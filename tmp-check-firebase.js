const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBeQTyQF_2w4f_TdBz3v_vqX2lToiyCK0k',
  authDomain: 'faculty-ranker.firebaseapp.com',
  projectId: 'faculty-ranker',
  storageBucket: 'faculty-ranker.appspot.com',
  messagingSenderId: '40238234411',
  appId: '1:40238234411:web:0558c965616ec79e9a236e',
  measurementId: 'G-HQRYPE1E2B'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  for (const start of [0, 1, 2, 3]) {
    const ref = doc(db, 'partition_faculty_2', String(start));
    const snap = await getDoc(ref);
    console.log('doc', start, 'exists', snap.exists());
    if (snap.exists()) {
      const data = snap.data();
      const firstKey = Object.keys(data)[0];
      console.log('sample', firstKey, JSON.stringify(data[firstKey], null, 2));
      break;
    }
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
