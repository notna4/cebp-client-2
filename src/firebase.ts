import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCtkYmVhUikyl9ndu8Tw2Q5gfTLi2FeVJ8",
    authDomain: "msa-db.firebaseapp.com",
    databaseURL: "https://msa-db-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "msa-db",
    storageBucket: "msa-db.firebasestorage.app",
    messagingSenderId: "230510055673",
    appId: "1:230510055673:web:876dc4f4a4528adba25228"
  };

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
