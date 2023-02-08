import webpush from 'web-push';

export function generateVAPID() {
  const vapidKeys = webpush.generateVAPIDKeys();

  // Prints 2 URL Safe Base64 Encoded Strings
  console.log(vapidKeys.publicKey, vapidKeys.privateKey);

  return { publicKey: vapidKeys.publicKey, privateKey: vapidKeys.privateKey };
}
