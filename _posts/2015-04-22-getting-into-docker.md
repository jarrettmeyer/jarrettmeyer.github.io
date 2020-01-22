---
layout: post
title: "Getting into Docker"
date: 2015-04-22
comments: true
tags: docker
description:
thumbnail: /assets/images/docker-logo.png
---

## What is this Docker thing, anyway?

For the best answer, check out [What is Docker?](https://www.docker.com/whatisdocker/) on Docker's web site. Briefly, Docker is a way to deliver applications. A container holds one or more applications. Docker provides a way to deploy, share, and update those containers. Docker containers are similar to virtual machines, in so far as they host an operating system. However, they rely solely on the host's RAM, CPU, and networking.

## Advantages of Docker vs. traditional deployment

**You are not shipping code; you are shipping a binary.** This binary is an image of the application. It is published to a Docker registry &mdash; either the public registry at [Docker Hub](https://registry.hub.docker.com/) or an [internal registry in your organization](https://docs.docker.com/registry/). To get the latest version of a container, simply use `docker pull`.

Except for the Docker engine, **you do not have to install anything on your production machines.** You do not have to install web servers, databases, cache engines, scripting runtimes (like NodeJS, Python, or Ruby) or any of your production servers.

**Every application runs inside its own Docker container.** You can have multiple versions of your application's toolset without version interference issues.

## Authoring a Client-Side Web Application

Here is our application directory structure.

```
my-app/
  src/
    scripts/
      main.js
    index.html
```

The application itself lives under `/my-app/src`. In this app, we only have an `index.html` and a single JavaScript file. Deployment scripts are under `/my-app/deploy`.

Here is the `my-app/src/index.html` file.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Getting into Docker</title>
        <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.3.min.js"></script>
    </head>
    <body>
        <h1>Hello World!</h1>
        <p>The current time is <span id="timestamp"></span></p>
    </body>
    <script type="text/javascript" src="/scripts/main.js"></script>
</html>
```

Here is our `my-app/src/scripts/main.js` file.

```javascript
(function() {
    function updateTimestamp() {
        var timestamp = new Date().toLocaleString();
        $("#timestamp").text(timestamp);
    }

    updateTimestamp();
})();
```

## Deploying our application

First, let's start with the [nginx](http://nginx.org/) Docker container. It is [available in the public Docker registry](https://registry.hub.docker.com/u/library/nginx/). This container is configured to forward requests from port 80 to `/usr/share/nginx/html`. (Port 443 is ready to go for SSL, as well, but we will not be using that in this demo.) To do this, we are going to add three new files to the `my-app/` directory.

```
my-app/
  build.sh
  Dockerfile
  run.sh
```

Let's take a look at the `Dockerfile`.

```
FROM nginx:1.7.12
COPY ./src /usr/share/nginx/html
```

There is nothing too difficult here. We are starting with the `nginx:1.7.12` image. To that image, we are going to copy the contents from the `src` directory to the `/usr/share/nginx/html` folder.

You might be tempted to move the `Dockerfile` to a build folder. _This will not work_. The `Dockerfile` must be in or above the the `src/` directory. This is because Docker sets us a context from the location of the `Dockerfile`, and it cannot access anything outside of that context.

Our build script will take care of this build process for us.

```
#!/usr/bin/env bash
sudo docker build -t my_app .
```

Build, using the `Dockerfile` located in the current directory. Additionally, tag (`-t`) this container as `my-app`. We can now see this Docker image on our server.

```
$ sudo docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
my_app              latest              04caf9e7a04e        6 minutes ago       93.44 MB
nginx               1.7.12              637d3b2f5fb5        7 days ago          93.44 MB
```

Finally, let's create a script to run our application.

```
#!/usr/bin/env bash
sudo docker run --name my_app_run -d -p 8080:80 my_app
```

Run the application in the background (`-d`), using the container named `my_app`. Forward requests on host port 8080 to container port 80. Also, name the running container to let us easily access it by name later (`--name my_app_run`).

```
$ sudo docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS                           NAMES
9f729419e7ca        my_app:latest       "nginx -g 'daemon of   4 seconds ago       Up 3 seconds        443/tcp, 0.0.0.0:8080->80/tcp   my_app_run
```

## Conclusion

A copy of this source code is available [on Github](https://github.com/jarrettmeyer/getting_into_docker).
