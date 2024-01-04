# https://hub.docker.com/_/node
FROM node:20 as builder

WORKDIR /usr/app

COPY ./package.json ./package-lock.json ./
COPY ./packages/jobs/package.json \
  ./packages/jobs/tsconfig.json \
  ./packages/jobs/
COPY ./packages/jobs/src/ ./packages/jobs/src/

RUN --mount=type=cache,target=/usr/app/.npm npm install -w jobs
RUN npm run build -w jobs

FROM node:20-alpine

WORKDIR /usr/app

COPY --from=builder /usr/app/package.json /usr/app/package-lock.json ./
COPY --from=builder /usr/app/packages/jobs/package.json ./packages/jobs/
COPY --from=builder /usr/app/packages/jobs/build/ packages/jobs/build/
RUN --mount=type=cache,target=/usr/app/.npm npm install -w packages/jobs --omit=dev

ENV NODE_ENV=production
CMD [ "node", "packages/jobs/build/src/index.js" ]
