// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSubscripbers } from '../../lib/firestoredb';
import webpush from 'web-push';

const vapidKeys = {
  publicKey:
    'BMoGEW_YnvTdd7znphsBuYsPXptJnsEhrPzX4541LLxHil81MazwMYdTl9jG83v-b4qSw-n8Zm5fGRr-SNuLNiA',
  privateKey: 'dlIfgFoHAf1QBp9Fjwhalrf84oeisWRVNNFNcRXYNnk',
};
webpush.setGCMAPIKey(
  'BL4L7qVQtdrPw3PJlAmCz9VB37lSjsP7_kXHzaWRTdfzuxvkA5E0R_vp2cx6wEm6f8QSd8aDe--uOjFyZCTtbh0'
);

webpush.setVapidDetails(
  'mailto:cripsito@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

function getSubscriptionsFromDatabase() {
  return new Promise(async function (resolve, reject) {
    resolve(await getSubscripbers());
  });
}

const triggerPushMsg = function (subscription: any, dataToSend: any) {
  return webpush.sendNotification(subscription, dataToSend).catch((err) => {
    console.log('Error in webpush:', err, JSON.stringify(err));
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('Subscription has expired or is no longer valid: ', err);
      //return deleteSubscriptionFromDatabase(subscription._id);
    } else {
      throw err;
    }
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('handler ok');
  if (req.method === 'POST') {
    return getSubscriptionsFromDatabase()
      .then((subscriptions: any) => {
        console.log('api console', subscriptions);
        let promiseChain: any = Promise.resolve();

        const payload = JSON.stringify({
          title: 'New notification',
          body: 'This is a test push notification',
        });

        for (let i = 0; i < subscriptions.length; i++) {
          const subscription = subscriptions[i];
          promiseChain = promiseChain.then(() => {
            return triggerPushMsg(JSON.parse(subscription.data), payload);
          });
        }

        return promiseChain;
      })
      .then(() => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ data: { success: true } }));
      })
      .catch(function (err) {
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.send(
          JSON.stringify({
            error: {
              id: 'unable-to-send-messages',
              message:
                `We were unable to send messages to all subscriptions : ` +
                `'${err.message}'`,
            },
          })
        );
      });
  } else {
    // Handle any other HTTP method
  }
}
