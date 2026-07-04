import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { sanitizeFacultyKey } from "@/firebase/sanitizeFacultyKey";

/** Fetch the real ratings for a single faculty from Firebase.
 *  Returns null if the faculty cannot be found. */
export const getFacultyRating = async (
  facultyId: string,
  partitionNumber: number
): Promise<{
  teaching_rating: number | null;
  attendance_rating: number | null;
  correction_rating: number | null;
  num_teaching_ratings: number | null;
  num_attendance_ratings: number | null;
  num_correction_ratings: number | null;
} | null> => {
  try {
    const docRef = doc(db, "partition_faculty_2", partitionNumber.toString());
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    const safeKey = sanitizeFacultyKey(facultyId);
    const facultyRaw = data?.[safeKey];
    if (!facultyRaw) return null;

    const toAvg = (total: number | null | undefined, count: number | null | undefined) =>
      total != null && count != null && count > 0
        ? parseFloat((total / count).toFixed(2))
        : null;

    return {
      teaching_rating: toAvg(facultyRaw.teaching_rating, facultyRaw.num_teaching_ratings),
      attendance_rating: toAvg(facultyRaw.attendance_rating, facultyRaw.num_attendance_ratings),
      correction_rating: toAvg(facultyRaw.correction_rating, facultyRaw.num_correction_ratings),
      num_teaching_ratings: facultyRaw.num_teaching_ratings ?? null,
      num_attendance_ratings: facultyRaw.num_attendance_ratings ?? null,
      num_correction_ratings: facultyRaw.num_correction_ratings ?? null,
    };
  } catch {
    return null;
  }
};

const fallbackFacultyData: FacultyData[] = [];

const getFallbackFacultyData = (start: number): FacultyData[] => {
  return fallbackFacultyData.map((faculty, index) => ({
    ...faculty,
    id: `${faculty.id}-${start}-${index}`,
  }));
};

export const getFacultyDetails = async (
  start: number
): Promise<FacultyData[]> => {
  try {
    const docRef = doc(db, "partition_faculty_2", start.toString());
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return getFallbackFacultyData(start);
    }

    const data = docSnap.data();
    if (!data) {
      return getFallbackFacultyData(start);
    }

    const facultyData = Object.entries(data).map(([key, value]) => {
      return {
        id: key,
        ...value,
      } as FacultyData;
    });

    facultyData.sort((a, b) => {
      const nameA = a?.name?.replace(/Dr\.?/gi, "")?.replace(/\s/g, "");
      const nameB = b?.name?.replace(/Dr\.?/gi, "")?.replace(/\s/g, "");

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    facultyData.forEach((faculty) => {
      const numRatings = [
        "num_teaching_ratings",
        "num_attendance_ratings",
        "num_correction_ratings",
      ] as const;

      const numRatingsTotalRatings = [
        "teaching_rating",
        "attendance_rating",
        "correction_rating",
      ] as const;

      numRatings.forEach((numRating, index) => {
        const totalRating = numRatingsTotalRatings[index];
        if (faculty[numRating] != null && faculty[totalRating] != null) {
          faculty[totalRating] = parseFloat((faculty[totalRating]! / faculty[numRating]!).toFixed(2));
        }
      });
    });

    if (facultyData.length === 0) {
      return getFallbackFacultyData(start);
    }

    return facultyData;
  } catch (error) {
    console.warn("Faculty data fetch failed, using fallback data.", error);
    return getFallbackFacultyData(start);
  }
};
