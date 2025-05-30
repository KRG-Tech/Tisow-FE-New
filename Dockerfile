FROM node:20.16.0-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable

COPY --from=build /app/dist/controller/browser /usr/share/nginx/html

EXPOSE 80

