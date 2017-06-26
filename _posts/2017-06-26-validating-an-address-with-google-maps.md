---
title:    Validating an Address with Google Maps
layout:   post
date:     2017-06-26
---

Need to validate an address on the cheap? Google services to the rescue. Their API allows up to 5,000 requests per day free of charge. You will need a developer API key, but you can get that for free.

## Step 1: Include the Google Maps Library

```html
<script type="text/javascript" src="//maps.google.com/maps/api/js?key=AIzaSyCD0DXnm5Q8nqdAzYve83o_9XmFpQgs7KU"></script>
```

## Step 2: Validate the Address

Validating the address is a relatively simple step.

```js
(function (w, google) {
  if (!w.app) {
    w.app = {};
  }
  
  function _formatResults(addresses) {
    if (!addresses || !addresses.length) {
      return [];
    }
    return addresses.map(function (address) {
      var a = {};
      a.formattedAddress = address.formatted_address;
      var parts = a.formattedAddress.split(",");
      a.line1 = parts[0].trim();
      a.city = parts[1].trim();
      var stateParts = parts[2].trim().split(" ");
      a.state = stateParts[0];
      a.zip = stateParts[1];
      a.country = parts[3];
      a.longitude = address.geometry.location.lng();
      a.latitude = address.geometry.location.lat();
      return a;
    });
  }
  
  function _validateAddress(address) {
    return new Promise(function (resolve, reject) {
      var addressArray = [address.line1, address.city, address.state];
      var addressString = addressArray.join(", ");
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: addressString }, function (results, error) {
        if (error != "OK") {
          return reject(error);
        }
        var answer = _formatResults(results);
        return resolve(answer);
      });
    });
  }
  
  w.app.validateAddress = _validateAddress;
}(window, google));
```

That's it! Now go forth and validate.