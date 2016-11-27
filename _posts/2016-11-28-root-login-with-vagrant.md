---
title:    "Root Login with Vagrant"
layout:   post
date:     2016-11-28
---

When you create a [Vagrant](http://www.vagrantup.com) virtual machine, you do not get to enter your own `root` password. Yes, the `vagrant` user has `sudo` access, but sometimes you will find yourself wanting just a little bit more. Fortunately, this is easily handled with SSH keys.

This can easily be handled as part of your provisioning process. In my `Vagrantfile`, I add the following line.

```rb
config.vm.provision "shell", path: "scripts/setup_ssh.sh"
```

This script will create all of the necessary SSH keys and put them in the correct places.

```sh
ROOT_HOME="/root"
ROOT_SSH_HOME="$ROOT_HOME/.ssh"
ROOT_AUTHORIZED_KEYS="$ROOT_SSH_HOME/authorized_keys"
VAGRANT_HOME="/home/vagrant"
VAGRANT_SSH_HOME="$VAGRANT_HOME/.ssh"
VAGRANT_AUTHORIZED_KEYS="$VAGRANT_SSH_HOME/authorized_keys"

ssh-keygen -C root@localhost -f "$ROOT_SSH_HOME/id_rsa" -q -N ""
cat "$ROOT_SSH_HOME/id_rsa.pub" >> "$ROOT_AUTHORIZED_KEYS"
chmod 644 "$ROOT_AUTHORIZED_KEYS"

ssh-keygen -C vagrant@localhost -f "$VAGRANT_SSH_HOME/id_rsa" -q -N ""
cat "$VAGRANT_SSH_HOME/id_rsa.pub" >> "$ROOT_AUTHORIZED_KEYS"
cat "$VAGRANT_SSH_HOME/id_rsa.pub" >> "$VAGRANT_AUTHORIZED_KEYS"
```

With this completed, you should now be able to SSH as both `vagrant` and `root`.

```
$ vagrant ssh

You are now logged into your VM as 'vagrant'.
$ ssh root@localhost

You are now logged into your VM as 'root'.
# whoami
root
# pwd
/root
# exit

You are now back to your VM as 'vagrant'.
$ exit

You are now back on your host machine.
$
```

Hopefully this helps all you developers and Vagrant users out there in the world.
