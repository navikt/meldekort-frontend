FROM gcr.io/distroless/nodejs18-debian11

WORKDIR /var

COPY build/ build/
COPY server/build server/
COPY public/ public/
COPY node_modules/ node_modules/

EXPOSE 8080
CMD ["./server/server.js"]
