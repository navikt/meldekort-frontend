FROM node:26-alpine@sha256:6f08a523443ddedf52941874c203475b0ad503e859ad70cb26ab8be9a517dbd5 AS node
RUN npm install -g corepack@latest --force && \
    corepack enable && \
    corepack prepare pnpm@12.12.1 --activate
RUN pnpm config set @navikt:registry=https://npm.pkg.github.com


# build app
FROM node AS app-build
WORKDIR /app

COPY ./app ./app
COPY ./public ./public
COPY ./vite.config.ts ./
COPY ./react-router.config.ts ./
COPY ./package.json ./
COPY ./pnpm-lock.yaml  ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    pnpm install --ignore-scripts --frozen-lockfile && \
    pnpm config delete //npm.pkg.github.com/:_authToken
RUN pnpm run build


# install dependencies
FROM node AS app-dependencies
WORKDIR /app

COPY ./package.json ./
COPY pnpm-lock.yaml ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    pnpm install --ignore-scripts --frozen-lockfile --prod && \
    pnpm config delete //npm.pkg.github.com/:_authToken


# export build to filesystem (GitHub)
FROM scratch AS export
COPY --from=app-build /app/build /


# runtime
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26@sha256:4da41390bd1ad8b0eeac6b805737142e51aa2b705967971099d79172afb0348e AS runtime
WORKDIR /app

ENV TZ="Europe/Oslo"

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=8080
ENV PORT=${PORT}
EXPOSE ${PORT}

COPY ./package.json ./package.json
COPY --from=app-build /app/build/ ./build/
COPY --from=app-dependencies /app/node_modules ./node_modules
COPY ./server.js ./server.js

CMD ["./server.js"]
