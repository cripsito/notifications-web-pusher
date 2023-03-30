// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/sqlite';
import { newSubscription } from '../../lib/firestoredb';
const isValidSaveRequest = (req: any, res: any) => {
  // Check the request body has at least an endpoint.
  if (!req.body || !req.body.endpoint) {
    // Not a valid subscription.
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        error: {
          id: 'no-endpoint',
          message: 'Subscription must have an endpoint.',
        },
      })
    );
    return false;
  }
  return true;
};

function saveSubscriptionToDatabase(subscription: any) {
  console.log('received susb', subscription);
  return newSubscription(JSON.stringify(subscription));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    if (!isValidSaveRequest(req, res)) {
      return;
    }

    return saveSubscriptionToDatabase(req.body)
      .then(function (subscription) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ data: { success: true } }));
      })
      .catch(function (err) {
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.send(
          JSON.stringify({
            error: {
              id: 'unable-to-save-subscription',
              message:
                'The subscription was received but we were unable to save it to our database.',
            },
          })
        );
      });
  } else {
    // Handle any other HTTP method
  }
}
