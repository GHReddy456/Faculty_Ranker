import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "./firebase";

async function cleanup() {
  console.log("Cleaning up partition 28...");
  const docRef = doc(db, "partition_faculty_2", "28");
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const updates: any = {};
    
    // Look for bad fields with dots
    for (const key of Object.keys(data)) {
      if (key.includes(".teaching_rating") || 
          key.includes(".attendance_rating") || 
          key.includes(".correction_rating") ||
          key.includes(".num_")) {
        updates[key] = deleteField();
      }
    }
    
    // Delete the bad Monalisa Sahu map so it can be recreated fresh
    updates["Dr. Monalisa Sahu"] = deleteField();
    
    if (Object.keys(updates).length > 0) {
      console.log("Applying updates:", updates);
      await updateDoc(docRef, updates);
      console.log("Cleanup successful!");
    } else {
      console.log("No cleanup needed.");
    }
  } else {
    console.log("Partition 28 does not exist yet.");
  }
  process.exit(0);
}

cleanup().catch(console.error);
