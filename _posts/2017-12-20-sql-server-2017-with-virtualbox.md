---
title:    "Running SQL Server 2017 with VirtualBox"
layout:   post
date:     2017-12-20
---

This post gives instructions on installing an running SQL Server 2017 Developer Edition, completely free, with VirtualBox. This method should only be used on Developer workstations. This method **should not** be used for shared developer/test/QA installations. It absolutely should not be used for production installations.

### Step 1: Download and Install VirtualBox

You can grab the latest copy of VirtualBox for your host operating system [here](https://www.virtualbox.org/).

#### Step 2: Download the ISO for Windows Hyper-V Server 2016

Yes, Hyper-V server is built for running other servers. However, you *can* install SQL Server quite easily onto Hyper-V server, and that's perfect for developer scenarios.

Create a new VM. Give it as much RAM, CPU, and disk as you can afford given your machine configuration. Go through the installation and allow the machine to reboot.

You'll need to create an Administrator password. I recommend `Administrat0r`, but do whatever you want and whatever you'll remember.

#### Step 3: Install the VirtualBox Guest Additions

From the VirtualBox menu, you can install the Guest Additions. These enable additional functionality, including port forwarding, shared clipboard, and folder sharing. When you mount the Guest Additions disk, you should be able to run `D:\VBoxWindowsAdditions.exe`. If your disk drive is not `D:`, use that drive letter instead.

After the Guest Additions are installed, reboot the machine.

#### Step 4: Disable the Firewall

Yes, you can go about opening the correct firewall ports. The easier solution, since this is a developer installation on a developer workstation, is to disable the firewall entirely.

```
> netsh advfirewall set currentprofile state off
```

#### Step 5: Download SQL Server 2017 Developer Edition

You can grab a copy of SQL Server from [here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads).

#### Step 6: Install SQL Server 2017 Developer Edition

Mount the `SQLServer2017-x64-ENU-Dev.iso` file. Run the following command. This will launch the installer and make sure that named pipes and TCP are enabled.

```
> D:\setup.exe /uimode=EnableUIOnServerCore /action=Install /NPEnabled=1 /TCPEnabled=1
```

When you select features, I recommend that you install the following.

* Database Engine
* Full-Text and Semantic Extractions for Search
* Analysis Services
* Integration Services

Many features will not successfully install on Windows Server Core. You will get a rule check violation if you attempt to install unsupported features.

Use the default instance.

I use mixed-mode authentication. The SA password is `mySApassword*123`. Again, put whatever you want here, as long as it's something you'll remember. I also add `BUILTIN\Administrators`.

If you include Analysis Services, be sure to add `BUILTIN\Administrators` as an admin there, as well.

I leave all default folders and collation settings as-is.

Once the install completes, reboot the server.

#### Step 7: Connect to SQL Server

You should now be able to connect to SQL Server from the host machine. Open up SQL Server Management Studio and attempt to connect to `(local)` with the credentials `sa`/`mySApassword*123`.

#### Step 8: Enable Server Updates

Using the server configuration tool (`sconfig`), enable updates. Also, start downloading and installing updates. These can take a while, and many updates require a server restart, so do these during your lunch break, after work, etc.

After all of these steps, you're all set! You can connect from your host machine and query away as if you were working on localhost. Happy querying!
