'use client';

import convert from 'convert-vapid-public-key';
import { useCallback, useState, useEffect } from 'react';

export default function SubscriberPage({
  publicKey,
  privateKey,
}: {
  publicKey: any;
  privateKey: any;
}) {
  const [pushSubscriptionObj, setPushSubscriptionObj] =
    useState<any>(undefined);
  function sendSubscriptionToBackEnd(subscription: any) {
    return fetch('/api/save-subscription/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Bad status code from server.');
        }

        return response.json();
      })
      .then(function (responseData) {
        if (!(responseData.data && responseData.data.success)) {
          throw new Error('Bad response from server.');
        }
      });
  }

  const createNotif = () => {
    const img = 'https://random.imagecdn.app/500/150';
    const text = `HEY! Your task  is now overdue.`;
    const notification = new Notification('To do list', {
      body: text,
      icon: img,
    });
  };

  useEffect(() => {
    if (pushSubscriptionObj != undefined) {
      const pushsubs = JSON.parse(JSON.stringify(pushSubscriptionObj));
      console.log('here', pushsubs);
      const subscriptionObject = {
        endpoint: 'localhost:3000/',
        keys: {
          p256dh: pushsubs.keys.p256dh,
          auth: pushsubs.keys.auth,
        },
      };
      sendSubscriptionToBackEnd(subscriptionObject);
    }
  }, [pushSubscriptionObj]);

  const validBrow = () => {
    if (!('serviceWorker' in navigator)) {
      // Service Worker isn't supported on this browser, disable or hide UI.
      return false;
    }

    if (!('PushManager' in window)) {
      // Push isn't supported on this browser, disable or hide UI.
      return false;
    }
    return true;
  };

  const subscribeUserToPush = useCallback(() => {
    return navigator.serviceWorker
      .register('/service-worker.js')
      .then(function (registration) {
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: convert(privateKey),
        };

        const currentSubs = registration.pushManager.getSubscription();
        if (currentSubs) {
          return currentSubs;
        }

        return registration.pushManager.subscribe(subscribeOptions);
      })
      .then(function (pushSubscription) {
        setPushSubscriptionObj(pushSubscription);
        console.log(
          'Received PushSubscription: ',
          JSON.stringify(pushSubscription)
        );
        return pushSubscription;
      })
      .catch((e) => {
        console.log(e);
      });
  }, [privateKey]);

  const askNotificationPermission = useCallback(() => {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (
        result
      ) {
        subscribeUserToPush();

        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    }).then(function (permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error("We weren't granted permission.");
      }
    });
  }, [subscribeUserToPush]);

  return (
    <>
      {validBrow() ? (
        <div>
          <button id="enable" onClick={askNotificationPermission}>
            Enable notifications
          </button>
          <button id="enable" onClick={createNotif}>
            Create notifications
          </button>
        </div>
      ) : (
        'not valid brow'
      )}
    </>
  );
}
