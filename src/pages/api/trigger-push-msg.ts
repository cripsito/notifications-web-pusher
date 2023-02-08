// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/sqlite';
import webpush from 'web-push';

function getSubscriptionsFromDatabase() {
  return new Promise(async function (resolve, reject) {
    resolve(await db.getOptions());
  });
}

const triggerPushMsg = function (subscription: any, dataToSend: any) {
  return webpush.sendNotification(subscription, dataToSend).catch((err) => {
    console.log('error in webpush', err);
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
      .then((subscriptions) => {
        console.log('api console', subscriptions);
        let promiseChain: any = Promise.resolve();

        for (let i = 0; i < subscriptions.length; i++) {
          const subscription = subscriptions[i];
          promiseChain = promiseChain.then(() => {
            return triggerPushMsg(JSON.parse(subscription.data), 'dataToSend');
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
