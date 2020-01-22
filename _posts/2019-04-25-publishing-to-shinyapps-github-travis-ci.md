---
title: "Publishing to shinyapps.io with Github and Travis CI"
layout: post
date: 2019-04-25
tags: git r
description: Trying to make Github, Travis CI, and Shiny all play nicely together
thumbnail: /assets/images/travis-ci-logo.svg
---

I had a fun experience these past few days figuring out how to publish to [shinyapps.io](https://www.shinyapps.io/) directly from a [Github](https://github.com) push. In this post, I leverage [Travis CI](https://travis-ci.org/) to handle the automated build and deployment process.

### Creating Your DESCRIPTION File

If you have created an R package in the past, you will already be familiar with the required [`DESCRIPTION`](https://cran.r-project.org/doc/manuals/r-release/R-exts.html#The-DESCRIPTION-file) file. Even though a Shiny application is not a package, you will still need a `DESCRIPTION` file. This is a Debian Control File (dcf) format. While the `DESCRIPTION` file has many possible key-value pairs, only two are necessary for a Shiny application. You need to specify the `Package` and the `Type`. The Package name does not matter, since you are not deploying this as a package to an R package repository.

```dcf
Package: plotdemos
Type: Shiny
```

### Creating Your Travis CI Configuration File

Getting your `.travis.yml` just right can be a bit of a trick. Hopefully this will help you get up and running quickly.

First, we need to put a bit of header data into our configuration. This tells Travis what Ubuntu distribution to use, if `sudo` access is required, and what language we are deploying (R). The `r: release` tells Travis to use the latest available release. You can also specify specific versions, e.g. r: 3.5.3.

```yml
dist: xenial
sudo: false
latex: false
language: r
r: release
```

R gives quite a few warnings when it builds. I would love to get to the point where I can set this to `true`, but I am not quite there yet. If you set this to `true`, then any warnings produced during the build will cause an error.

```yml
warnings_are_errors: false
```

We want Travis to cache its packages. This will make later builds much faster.

```yml
cache:
    packages: true
```

We need to install a few extra packages from `apt`. If you have necessary `apt` packages, put those here.

```yml
apt_packages:
    - libgdal-dev
    - libudunits2-dev
```

After `apt` is done installing, it will pull your code from Github. I don't want the `git` command to use the `depth` flag.

```yml
git:
    depth: false
```

What R packages need to be installed?

```yml
r_packages:
    - gapminder
    - ggthemes
    - maps
    - RColorBrewer
    - rgeos
    - rnaturalearth
    - rnaturalearthdata
    - rsconnect
    - shiny
    - shinyAce
    - survminer
    - survival
    - tidyverse
```

What script do you want to run? I will include the content of this `deploy.R` in the next section.

```yml
script:
    - R -f deploy.R
```

### Writing Your Deployment Script

The deployment script needs to do a few things.

1. Load your necessary packages.
2. Configure your connection to [shinyapps.io](https://www.shinyapps.io).
3. Deploy your application.

In my case, my `util.R` file contains all of my `library()` load instructions. Sourcing that file will load my packages. The necessary connection requirements are saved as hidden environment variables.

```r
library(rsconnect)

# Print a list of app dependencies. Libraries need to be loaded
# before publishing so deployApp() knows what is necessary.
source("./R/util.R")

# Set the account info for deployment.
setAccountInfo(name   = Sys.getenv("shinyapps_name"),
               token  = Sys.getenv("shinyapps_token"),
               secret = Sys.getenv("shinyapps_secret"))

# Deploy the application.
deployApp()
```

### Configuring Travis CI

In Travis CI, you will need to set up your deployment keys. You can get those values from your [shinyapps.io](https://www.shinyapps.io) settings page. If you want to push back to Github, you will also need a Github token. Make sure all of these are marked as hidden. "Display value in build log" should be **unchecked**.

![Travis CI Settings](/assets/images/travis-ci-jarrettmeyer-ggplotly_demos-settings.png)

### Deploying Your Updates

Deploying your application is linked directly to your Github repository. When you push to Github, Travis CI will kick off your build, pull your latest code, and - if everything is successful - deploy your application.

Now, go forth and deploy all the things! If you have questions, please let me know.

### Resources

-   [Github: jarrettmeyer/ggplotly_demos](https://github.com/jarrettmeyer/ggplotly_demos)
-   [Travis CI: jarrettmeyer/ggplotly_demos](https://travis-ci.org/jarrettmeyer/ggplotly_demos)
-   [Travis CI R Community](https://travis-ci.community/c/languages/r)
-   [Travis CI R Language](https://docs.travis-ci.com/user/languages/r/)
