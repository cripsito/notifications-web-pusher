// pages/subscriber.js

import { useCallback, useEffect, useState } from 'react';

function SubscriberPage({ publicKey }: any) {
  const [pushSubscriptionObj, setPushSubscriptionObj] =
    useState<any>(undefined);

  function sendSubscriptionToBackEnd(subscription: any) {
    return fetch('/api/save-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Bad status code from server.');
        }

        return response.json();
      })
      .then((responseData) => {
        if (!(responseData.data && responseData.data.success)) {
          throw new Error('Bad response from server.');
        }
      });
  }

  const subscribeUserToPush = useCallback(() => {
    return navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        };

        return registration.pushManager.subscribe(subscribeOptions);
      })
      .then((pushSubscription) => {
        setPushSubscriptionObj(pushSubscription);
        return pushSubscription;
      })
      .catch((e) => {
        console.log(e);
      });
  }, [publicKey]);

  const askNotificationPermission = useCallback(() => {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (
        result
      ) {
        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
      .then((permissionResult) => {
        if (permissionResult !== 'granted') {
          throw new Error("We weren't granted permission.");
        }
        return subscribeUserToPush();
      })
      .catch((error) => {
        console.error('Failed to subscribe user:', error);
      });
  }, [subscribeUserToPush]);

  useEffect(() => {
    if (pushSubscriptionObj !== undefined) {
      const pushsubs = JSON.parse(JSON.stringify(pushSubscriptionObj));
      const subscriptionObject = {
        endpoint: pushsubs.endpoint,
        keys: {
          p256dh: pushsubs.keys.p256dh,
          auth: pushsubs.keys.auth,
        },
      };
      sendSubscriptionToBackEnd(subscriptionObject);
    }
  }, [pushSubscriptionObj]);

  return (
    <div>
      <button id="enable" onClick={askNotificationPermission}>
        Enable notifications
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: any) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default SubscriberPage;
