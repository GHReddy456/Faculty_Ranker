import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

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
    const facultyRaw = data?.[facultyId];
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

const fallbackFacultyData: FacultyData[] = [
  {
    id: "fallback-1",
    name: "Dr. Aastha Madonna Sathe",
    image_url: "/teach.jpg",
    specialization:
      "Computational Statistics, Stable Distributions, Time Series Analysis, Forecasting, Artificial Neural Networks",
    teaching_rating: 3.99,
    attendance_rating: 3.98,
    correction_rating: 3.59,
    num_teaching_ratings: 120,
    num_attendance_ratings: 115,
    num_correction_ratings: 110,
  },
  {
    id: "fallback-2",
    name: "Dr. Anil Vithalrao Turukmane",
    image_url: "/teach.jpg",
    specialization: "Network Security, Cyber Security, Python Programming, Machine Learning, AI, Database Management Systems",
    teaching_rating: 3.91,
    attendance_rating: 3.88,
    correction_rating: 3.74,
    num_teaching_ratings: 102,
    num_attendance_ratings: 98,
    num_correction_ratings: 95,
  },
  {
    id: "fallback-3",
    name: "Dr. Ambuj Sharma",
    image_url: "/teach.jpg",
    specialization: "Computational Mechanics, Finite Element Analysis, Structural Health Monitoring",
    teaching_rating: 3.86,
    attendance_rating: 3.79,
    correction_rating: 3.65,
    num_teaching_ratings: 88,
    num_attendance_ratings: 84,
    num_correction_ratings: 81,
  },
];

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
