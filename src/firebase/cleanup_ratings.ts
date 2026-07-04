import { collection, query, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

async function cleanupRatings() {
  console.log("Cleaning up ratings for Monalisa Sahu...");
  const q = collection(db, "ratings");
  const querySnapshot = await getDocs(q);
  
  for (const docSnap of querySnapshot.docs) {
    if (docSnap.id.includes("Monalisa Sahu")) {
      console.log("Deleting rating doc:", docSnap.id);
      await deleteDoc(docSnap.ref);
    }
  }
  
  console.log("Ratings cleanup successful!");
  process.exit(0);
}

cleanupRatings().catch(console.error);
