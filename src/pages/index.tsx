'use client';
import { Inter } from '@next/font/google';
import React, { useMemo } from 'react';
import { generateVAPID } from '../lib/getVAPIDkeys';
import dynamic from 'next/dynamic';
import db from '../lib/sqlite';
import { getSubscripbers } from '../lib/firestoredb';

const SubscriberPage = dynamic(() => import('../components/subscriberPage'), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] });

export default function Home({
  publicKey,
  privateKey,
}: {
  publicKey: any;
  privateKey: any;
}) {
  return <SubscriberPage publicKey={publicKey} privateKey={privateKey} />;
}
export async function getServerSideProps(context: any) {
  const vapidKeys: any = generateVAPID();
  const dbres = await getSubscripbers();

  console.log(dbres);

  // Prints 2 URL Safe Base64 Encoded Strings
  console.log(vapidKeys.publicKey, vapidKeys.privateKey);

  return {
    props: {
      publicKey:
        'BMoGEW_YnvTdd7znphsBuYsPXptJnsEhrPzX4541LLxHil81MazwMYdTl9jG83v-b4qSw-n8Zm5fGRr-SNuLNiA',
      privateKey: 'test',
    },
  };
}
