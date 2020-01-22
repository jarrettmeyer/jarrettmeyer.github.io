---
title: "Validating Remote Server Certificates"
layout: post
date: 2017-10-19
description:
thumbnail: /assets/images/csharp-logo.png
---

Recently, we ran into a problem at work that required us to validate remote server X.509 certificates. Fortunately, this is quite easy to do with .NET.

It starts with creating a new `HttpWebRequest`. The `request` instance has a multicast delegate for validating certificates.

```csharp
HttpWebRequest request = (HttpWebRequest)WebRequest.Create(@"https://www.google.com");
request.ServerCertificateValidationCallback += OnCertificateValidation;
try
{
  HttpWebResponse response = (HttpWebResponse)request.GetResponse();
  Console.WriteLine("Response status: {0} ({1})", response.StatusCode, response.StatusDescription);
}
catch (WebException e)
{
  Console.WriteLine("Exception: {0}", e.Message);
}
```

Here is our validation callback. If this returns `true`, then the certificate is valid. If this return `false`, then the certificate is invalid.

```csharp
public static bool OnCertificateValidation(object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors errors)
{
  Console.WriteLine("Subject: {0}", certificate.Subject);
  Console.WriteLine("Effective date: {0}", certificate.GetEffectiveDateString());
  Console.WriteLine("Expiration date: {0}", certificate.GetExpirationDateString());
  Console.WriteLine("Issuer: {0}", certificate.Issuer);
  Console.WriteLine("Key algorithm: {0}", certificate.GetKeyAlgorithm());
  Console.WriteLine("Certificate hash: {0}", certificate.GetCertHashString());
  Console.WriteLine("Public key: {0}", certificate.GetPublicKeyString());
  Console.WriteLine("Serial number: {0}", certificate.GetSerialNumberString());
  Console.WriteLine("SSL policy errors: {0}", errors);
  return (errors == SslPolicyErrors.None);
}
```

Here is the completed code.

{% gist jarrettmeyer/bf0851889221b8fbe4d84827414cc6ba DemoValidateServerCertificate.cs %}

This is the output when run against [https://www.google.com](https://www.google.com).

```
Subject: CN=www.google.com, O=Google Inc, L=Mountain View, S=California, C=US
Effective date: 10/10/2017 10:37:01 AM
Expiration date: 12/28/2017 7:00:00 PM
Issuer: CN=Google Internet Authority G2, O=Google Inc, C=US
Key algorithm: 1.2.840.10045.2.1
Certificate hash: 891903894CFF80CBDF78D476967E332CD7A47AD4
Public key: 046BF4DBB3878545941DAE561637B5F7DAC9B305530F1E56332014308D699480D4662E19A004DB434EFEAFD79028F925A4C1E229877E9202353F4EB76E75702F67
Serial number: 5686E45C3812155C
SSL policy errors: None
Response status: OK (OK)
```

And this is the output when run against [https://self-signed.badssl.com](https://self-signed.badssl.com).

```
Subject: CN=*.badssl.com, O=BadSSL, L=San Francisco, S=California, C=US
Effective date: 8/8/2016 5:17:05 PM
Expiration date: 8/8/2018 5:17:05 PM
Issuer: CN=*.badssl.com, O=BadSSL, L=San Francisco, S=California, C=US
Key algorithm: 1.2.840.113549.1.1.1
Certificate hash: 641450D94A65FAEB3B631028D8E86C95431DB811
Public key: 3082010A0282010100C204ECF88CEE04C2B3D850D57058CC9318EB5CA86849B022B5F9959EB12B2C763E6CC04B604C4CEAB2B4C00F80B6B0F972C98602F95C415D132B7F71C44BBCE9942E5037A6671C618CF64142C546D31687279F74EB0A9D11522621736C844C7955E4D16BE8063D481552ADB328DBAAFF6EFF60954A776B39F124D131B6DD4DC0C4FC53B96D42ADB57CFEAEF515D23348E72271C7C2147A6C28EA374ADFEA6CB572B47E5AA216DC69B15744DB0A12ABDEC30F47745C4122E19AF91B93E6AD2206292EB1BA491C0C279EA3FB8BF7407200AC9208D98C5784538105CBE6FE6B5498402785C710BB7370EF6918410745557CF9643F3D2CC3A97CEB931A4C86D1CA850203010001
Serial number: 0086FB4DC8E5DD0F18
SSL policy errors: RemoteCertificateChainErrors
Exception: The underlying connection was closed: Could not establish trust relationship for the SSL/TLS secure channel.
```

Happy coding!
