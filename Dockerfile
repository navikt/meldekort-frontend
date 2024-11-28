FROM node:22-alpine AS node
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)
RUN npm config set @navikt:registry=https://npm.pkg.github.com


# build app
FROM node AS app-build
WORKDIR /app

COPY ./app ./app
COPY ./public ./public
COPY ./server ./server
COPY ./tsconfig.json ./
COPY ./package.json ./
COPY ./package-lock.json  ./

RUN npm ci --ignore-scripts
RUN npm run build


# install dependencies
FROM node AS app-dependencies
WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json  ./

RUN npm ci --ignore-scripts --omit dev


# runtime
FROM gcr.io/distroless/nodejs22-debian12 AS runtime
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV TZ="Europe/Oslo"
EXPOSE 8080

COPY ./public ./public/
COPY ./package.json ./package.json
COPY --from=app-build /app/build/ ./build/
COPY --from=app-build /app/server/build/ ./server/
COPY --from=app-dependencies /app/node_modules ./node_modules

CMD ["./server/server.js"]
