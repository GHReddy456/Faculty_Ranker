import {
  doc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { sanitizeFacultyKey } from "@/firebase/sanitizeFacultyKey";

interface FacultyRatingWithoutId extends Omit<FacultyRating, "id"> {}
// make all the fields in FacultyRatingCount not optional  using required

function getFacultyUpdatedRatingDetialCounters(
  facultyId: string,
  updatedFacultyRating: FacultyRatingWithoutId,
  countUsers: FacultyRatingCount
) {
  const safeKey = sanitizeFacultyKey(facultyId);
  return {
    [safeKey]: {
      teaching_rating: increment(updatedFacultyRating.teaching_rating!),
      attendance_rating: increment(updatedFacultyRating.attendance_rating!),
      correction_rating: increment(updatedFacultyRating.correction_rating!),
      num_teaching_ratings: increment(countUsers.num_teaching_ratings!),
      num_attendance_ratings: increment(countUsers.num_attendance_ratings!),
      num_correction_ratings: increment(countUsers.num_correction_ratings!),
    }
  };
}

function getNumCount(
  key: string,
  previousRating: FacultyRatingWithoutId,
  newRating: FacultyRatingWithoutId
): number {
  if (
    previousRating[key as keyof FacultyRatingWithoutId] === null &&
    newRating[key as keyof FacultyRatingWithoutId] !== null
  )
    return 1;
  if (
    previousRating[key as keyof FacultyRatingWithoutId] !== null &&
    newRating[key as keyof FacultyRatingWithoutId] === null
  )
    return -1;
  return 0;
}

export async function writeFacultyRating(
  facultyPartition: number,
  facultyId: string,
  ratingDocId: string,
  previousRating: FacultyRatingWithoutId,
  newRating: FacultyRatingWithoutId
) {
  // count if a user had been added or removed from the rating
  const countUsers: FacultyRatingCount = {
    num_teaching_ratings: getNumCount(
      "teaching_rating",
      previousRating,
      newRating
    ),
    num_attendance_ratings: getNumCount(
      "attendance_rating",
      previousRating,
      newRating
    ),
    num_correction_ratings: getNumCount(
      "correction_rating",
      previousRating,
      newRating
    ),
  };

  // subtract the previous rating from the new Rating
  const updatedFacultyRating: FacultyRatingWithoutId = {
    teaching_rating: 0,
    attendance_rating: 0,
    correction_rating: 0,
  };

  for (const key in previousRating) {
    const previousValue =
      previousRating[key as keyof FacultyRatingWithoutId] ?? 0;
    const newValue = newRating[key as keyof FacultyRatingWithoutId] ?? 0;
    const incValue = newValue - previousValue;
    updatedFacultyRating[key as keyof FacultyRatingWithoutId] = incValue;
  }

  for (const key in previousRating) {
    if (newRating[key as keyof FacultyRatingWithoutId] === null)
      newRating[key as keyof FacultyRatingWithoutId] = 0;
  }

  const facultyDocRef = doc(
    db,
    // "partitioned_faculty",
    "partition_faculty_2",
    facultyPartition.toString()
  );
  const ratingsDocRef = doc(db, "ratings", ratingDocId);

  await runTransaction(db, async (transaction) => {
    // Use set+merge so this works even if the faculty doc doesn't exist yet
    // (i.e., for faculty that have never been rated before)
    transaction.set(
      facultyDocRef,
      getFacultyUpdatedRatingDetialCounters(
        facultyId,
        updatedFacultyRating,
        countUsers
      ),
      { merge: true }
    );
    transaction.set(ratingsDocRef, newRating, { merge: true });
  });
}
