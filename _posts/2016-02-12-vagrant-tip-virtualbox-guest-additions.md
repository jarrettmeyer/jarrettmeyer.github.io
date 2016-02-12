---
layout:   post
title:    "Vagrant Tip: Virtualbox Guest Additions"
date:     2016-02-12
---

Tired of seeing this message when you run `vagrant up`?

```
==> default: Machine booted and ready!
==> default: Checking for guest additions in VM...
    default: The guest additions on this VM do not match the installed version of
    default: VirtualBox! In most cases this is fine, but in rare cases it can
    default: prevent things such as shared folders from working properly. If you see
    default: shared folder errors, please make sure the guest additions within the
    default: virtual machine match the version of VirtualBox you have installed on
    default: your host and reload your VM.
    default:
    default: Guest Additions Version: 4.3.36
    default: VirtualBox Version: 5.0
```

There's fix for that. Check out the [vbguest vagrant plugin](https://github.com/dotless-de/vagrant-vbguest). Install the plugin with the following command.

```
$ vagrant plugin install vagrant-vbguest
Installing the 'vagrant-vbguest' plugin. This can take a few minutes...
Installed the plugin 'vagrant-vbguest (0.11.0)'!
```

The first time you run `vagrant up` you will see a lot of messages about unused packages, the uninstall output for removing the old version of Guest Additions, and the install output for installing the new version of Guest Additions. On my laptop, this is about 140 lines of output text. This isn't a big deal. I'm just saying that this plugin is noisy.

Now, when running `vagrant up`, you should see the following output.

```
==> default: Machine booted and ready!
GuestAdditions 5.0.10 running --- OK.
==> default: Checking for guest additions in VM...
```

Much better!

## Links

* [https://github.com/dotless-de/vagrant-vbguest](https://github.com/dotless-de/vagrant-vbguest)
