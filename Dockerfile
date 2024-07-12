FROM node:18-bullseye
WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn build
RUN yarn global add serve
RUN yarn cache clean
CMD ["serve", "-s", "build", "-l", "3000"]