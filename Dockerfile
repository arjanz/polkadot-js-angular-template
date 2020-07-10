### STAGE 1: Build ###
FROM node:14-alpine as builder

COPY package.json package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app

WORKDIR /ng-app

RUN npx ngcc --properties es2015 browser module main --create-ivy-entry-points

COPY . /ng-app/

RUN npm run ng build -- --prod --output-path=dist

### STAGE 2: Setup ###
FROM nginx:alpine

## Remove default nginx configs
RUN rm -rf /etc/nginx/conf.d/*

COPY nginx.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

EXPOSE 80
