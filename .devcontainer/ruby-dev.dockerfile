FROM ruby:3.4-alpine

RUN apk update && apk upgrade
RUN apk add build-base git make

RUN gem update --system 3.7.0
RUN gem install bundler -v 2.7.0
# RUN gem install jekyll -v 4.4.1

# RUN cd ./website && bundle install

# USER root
# RUN usermod --shell /bin/bash chsh -s /bin/bash

EXPOSE 4000
