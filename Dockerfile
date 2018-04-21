FROM node:8

WORKDIR /home/www/express
COPY . /home/www/express

RUN yarn

EXPOSE 3000

ENTRYPOINT ["yarn", "run"]
CMD ["start"]
