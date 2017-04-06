---
title:   "Fixing My Drivers for My HP Webcam"
layout:  post
date:    2017-04-06
---

I have a very nice HP Elitebook 8770W. Unfortunately, ever since I installed Windows 10, the webcam hasn't worked. The little light would come on, but the input was always black. This fixed it.

1. Open up the Device Manager. Open up the tab for "Imaging Devices". You should see one called "HP HD Webcam [Fixed]"

    ![Device Manager](/assets/images/device_manager.png)

2. Right-click and select "Update Driver Software".

3. Choose the option for "Let me pick from a list of device drivers on my computer".

4. Select the option for "USB Video Device".

    ![USB Video Device](/assets/images/select_usb_video_device.png)

5. Click "Next", and the driver will be installed.

That should be it. Changing to the generic USB device fixed the problem for me. I hope you have the same luck.
