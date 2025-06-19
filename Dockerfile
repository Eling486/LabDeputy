FROM node:20.12-alpine as build

LABEL org.opencontainers.image.authors="Eling486"

WORKDIR /app/LabDeputy
RUN apk add python3 && \
    apk add gcc && \
    apk add g++ && \ 
    apk add make
ADD ./backend/ /app/LabDeputy/backend/
ADD ./package.json /app/LabDeputy/package.json
RUN npm i --production

FROM node:20.12-alpine
COPY --from=build /app/LabDeputy /app
RUN rm -rf /app/LabDeputy
WORKDIR /app
RUN npm i pm2 -g

EXPOSE 8080

ENTRYPOINT ["npm", "start"]