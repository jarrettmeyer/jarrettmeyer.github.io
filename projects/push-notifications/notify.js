$(document).ready(() => {

    const $enableButton = $("#enable-notifications");
    const $registerButton = $("#register-notifications");
    const $updateButton = $("#update-service-worker");
    const applicationServerPublicKey = "BKzdnlmoyePut0e17uCx64w8PSmd43Z32qckoKAKSCQvbCeROVF1LiQZTxs-C0Kwf8-5v687owr5UugyeN8mXp4";
    let isSubscribed = false;
    let registration = null;

    function b64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function initializeUI() {
        registration.pushManager.getSubscription()
            .then((subscription) => {
                isSubscribed = !!(subscription);

                if (isSubscribed) {
                    console.log('User is subscribed.');
                }
                else {
                    console.warn("User is not subscribed.");
                }

                updateEnableButton();
                updateUpdateButton();
                updateSubscriptionOnServer(subscription);
            });
    }

    function registerNotifications() {
        if (('serviceWorker' in navigator) && ('PushManager' in window)) {
            console.log('Push notifications are supported by this browser.');

            navigator.serviceWorker.register('/projects/push-notifications/sw.js')
                .then((result) => {
                    console.log('Service worker is registered:', result);
                    registration = result;
                    $registerButton.attr("disabled", true);
                    $registerButton.text("Service Worker is Registered");
                    initializeUI();
                })
                .catch((error) => {
                    console.error('Service worker registation error:', error);
                    $registerButton.attr("disabled", true);
                });
        }
        else {
            console.warn('Push notifications are not supported in this browser.');
            $registerButton.text("Push Notifications Not Supported");
            $registerButton.attr("disabled", true);
        }
    }

    function subscribeUser() {
        const serverKey = b64ToUint8Array(applicationServerPublicKey);
        const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: serverKey
        };
        registration.pushManager.subscribe(subscribeOptions)
            .then((subscription) => {
                console.log("User is subscribed:", subscription);
                isSubscribed = true;
                updateSubscriptionOnServer(subscription);
                updateEnableButton();
                updateUpdateButton();
            })
            .catch((error) => {
                console.error("Failed to subscribe user:", error);
                updateEnableButton();
                updateUpdateButton();
            });
    }

    function unsubscribeUser() {
        registration.pushManager.getSubscription()
            .then((subscription) => {
                if (subscription) {
                    return subscription.unsubscribe();
                }
            })
            .then(() => {
                console.log("User is unsubscribed.");
                isSubscribed = false;
                updateSubscriptionOnServer(null);
                updateEnableButton();
                updateUpdateButton();
            })
            .catch((error) => {
                console.error("Error unsubscribing user:", error);
            });
    }

    function updateEnableButton() {
        if (Notification.permission === "denied") {
            $enableButton.text("Push Messaging Blocked");
            $enableButton.prop("disabled", true);
            updateSubscriptionOnServer(null);
            return;
        }

        if (isSubscribed) {
            $enableButton.text("Disable Push Messaging");
        }
        else {
            $enableButton.text("Enable Push Messaging");
        }
        $enableButton.prop("disabled", false);
    }

    function updateServiceWorker() {
        if (registration) {
            registration.update()
                .then((result) => {
                    console.log("Service worker is updated:", result);
                    registration = result;
                    $registerButton.attr("disabled", true);
                    $registerButton.text("Service Worker is Registered");
                    initializeUI();
                });
        }
    }

    function updateUpdateButton() {
        $updateButton.prop("disabled", !registration);
    }

    function updateSubscriptionOnServer(subscription) {
        // TODO: Send subscription to server.
        $("#subscription-json").text(JSON.stringify(subscription, null, 4));
    }

    $enableButton.on("click", () => {
        if (isSubscribed) {
            unsubscribeUser();
        }
        else {
            subscribeUser();
        }
    });

    $registerButton.on("click", () => {
        registerNotifications();
    });

    $updateButton.on("click", () => {
        updateServiceWorker();
    });

    $enableButton.prop("disabled", true);
    $updateButton.prop("disabled", true);
    console.log("Loaded.");
});
