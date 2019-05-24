'use strict';

self.addEventListener("push", (event) => {
    console.log(`[Service Worker] Push event received.`);
    console.log(`[Service Worker] Push event: ${event.data.text()}`);

    const title = "jarrettmeyer.com";
    const options = {
        body: event.data.text(),
        icon: "/favicon.ico"
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
