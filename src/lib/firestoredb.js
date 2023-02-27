import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  Timestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: 'AIzaSyCSSMcbQuSQ_uWN9RN8OkkCjdh4IBY3MKQ',
  authDomain: 'web-push-notifications-ac587.firebaseapp.com',
  projectId: 'web-push-notifications-ac587',
  storageBucket: 'web-push-notifications-ac587.appspot.com',
  messagingSenderId: '1089467555002',
  appId: '1:1089467555002:web:eabb0c47bef047758a3683',
  measurementId: 'G-Z692KNV760',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export const newSubscription = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'subscribers'), {
      data: data,
      date: Timestamp.now(),
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const getSubscripbers = async () => {
  try {
    const q = query(collection(db, 'subscribers'));

    const querySnapshot = await getDocs(q);
    let docs = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data());
      docs.push(doc.data());
    });
    return docs;
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};
