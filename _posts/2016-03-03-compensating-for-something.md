---
layout: post
title: "It looks like he's compensating for something"
date: 2016-03-03
tags: docker nginx nodejs
description: Using the wrong tool to solve a problem because using the right tool is painful
thumbnail: /assets/images/docker-logo.png
---

![Compensating](/assets/images/compensating-for-something.jpg){: .align-center }

The latest oddball request from a current NodeJS project I'm working on:

> When the application starts, I want to be able to include a command line switch for the number of threads to start. Something like `--threads 4`.

Now, this isn't a particularly difficult request. And, I completely understand the request. Working with IT at BIGCORP, Inc. is a PITA. I have found very little in this world slower than an IT department at any sufficiently large corporation.

**My issue with the request isn't the request itself; my issue is that it is the wrong request, being made for the wrong reasons.**

The request is not impossible. I've done something like this before for starting up queue listeners. It takes use of Node's [cluster](https://nodejs.org/api/cluster.html) library. I wrote a program that used RabbitMQ messages, and we wanted control over the number of subscribers. In NodeJS, this looks something like the following.

{% gist jarrettmeyer/3e1e34d1921577036c04 threaddemo.js %}

This demo is a very brief example. You should be listening on each thread for `"disconnect"`, `"error"`, and `"exit"` events. Log those events and start a new worker.

### Taking advantage of Docker

This particular project isn't a queue subscriber, though. It's an ExpressJS application, and we're already using [Docker](https://www.docker.com/) on the project. If you want more servers, simply deploy more containers.

```
$ docker pull my-app:latest
$ docker run -d --name my-app-1 --env PORT=8081 my-app
$ docker run -d --name my-app-2 --env PORT=8082 my-app
$ docker run -d --name my-app-3 --env PORT=8083 my-app
$ docker run -d --name my-app-4 --env PORT=8084 my-app
```

We then can easily tell Nginx (also running in its own Docker container) to round-robin requests to the multiple servers.

```
http {
  upstream backend {
    server path.to.docker.server:8081;
    server path.to.docker.server:8082;
    server path.to.docker.server:8083;
    server path.to.docker.server:8084;
  }
  server {
    location / {
      proxy_pass http://backend;
    }
  }
}
```

There is obviously still catch. The nginx configuration needs to have the same number of backend servers and the same assigned ports as the number of running application containers. I'm sure if we're intelligent enough, we can script this, keeping everything in check.

### Conclusion

Can we do the request as asked? Sure. We're smart. But should we? No. I don't think so. Every line of code we write is a line we have to test and maintain. We have other tools available for managing how our applications scale.
