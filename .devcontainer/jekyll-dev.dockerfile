FROM ruby:3.4-alpine

RUN apk update && apk upgrade
RUN apk add build-base git make

RUN gem update --system 3.7.0
RUN gem install bundler

EXPOSE 4000
