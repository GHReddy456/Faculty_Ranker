"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { queryFacultyData } from "@/app/showFaculty/query_faculty";
import { getFacultyRating } from "@/firebase/getFacultyDetails";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { writeFacultyRating } from "@/firebase/starRating";

export default function SingleFacultyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, signInWithGoogle, signOutWithGoogle } = useAuth();

  const [hovered, setHovered] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Record<string, number>>({});

  const facultyId = params?.id ?? searchParams.get("id") ?? "unknown";
  const facultyName = searchParams.get("name") ?? "Dr. Aastha Madonna Sathe";

  // Try to find the faculty in queryFacultyData to get partition_number and fallback info
  const matchedFaculty = queryFacultyData.find(
    (faculty) => faculty.id === facultyId || faculty.name === facultyName
  );

  const facultySpecialization =
    searchParams.get("specialization") ??
    matchedFaculty?.specialization ??
    "Computational Statistics, Stable Distributions, Time Series Analysis, Forecasting, Artificial Neural Networks";
  const facultyImage = searchParams.get("image_url") ?? matchedFaculty?.image_url ?? "/teach.jpg";

  // Ratings from query params (set when navigating from the main grid, which passes real Firebase data)
  const qpAttendance = searchParams.get("attendance_rating");
  const qpCorrection = searchParams.get("correction_rating");
  const qpTeaching = searchParams.get("teaching_rating");
  const qpNumTeaching = searchParams.get("num_teaching_ratings");
  const qpNumAttendance = searchParams.get("num_attendance_ratings");
  const qpNumCorrection = searchParams.get("num_correction_ratings");

  // Whether the query params already carry real ratings (grid navigation)
  // The fallback defaults in the old code were exactly 3.98/3.59/3.99, so if ALL three
  // are absent we know we came from the dropdown and must fetch from Firebase.
  const hasRatingsInParams = qpAttendance !== null && qpCorrection !== null && qpTeaching !== null;

  const [ratings, setRatings] = useState<{
    attendance_rating: number | null;
    correction_rating: number | null;
    teaching_rating: number | null;
    num_teaching_ratings: number | null;
    num_attendance_ratings: number | null;
    num_correction_ratings: number | null;
  } | null>(
    hasRatingsInParams
      ? {
          attendance_rating: Number(qpAttendance),
          correction_rating: Number(qpCorrection),
          teaching_rating: Number(qpTeaching),
          num_teaching_ratings: qpNumTeaching !== null ? Number(qpNumTeaching) : null,
          num_attendance_ratings: qpNumAttendance !== null ? Number(qpNumAttendance) : null,
          num_correction_ratings: qpNumCorrection !== null ? Number(qpNumCorrection) : null,
        }
      : null
  );

  const [loadingRatings, setLoadingRatings] = useState(!hasRatingsInParams);

  // Determine the partition number — prefer query param, then queryFacultyData lookup
  const partitionFromParam = searchParams.get("partition_number");
  const partitionNumber =
    partitionFromParam !== null
      ? Number(partitionFromParam)
      : (matchedFaculty?.partition_number ?? 0);

  // The raw facultyId from the URL may be suffixed like "FIREBASE_KEY-pageIndex-listIndex"
  // Strip the suffix to get the original Firebase document field key
  const rawId = String(facultyId);
  const firebaseKey = matchedFaculty?.id ?? rawId.split(/-\d+-\d+$/)[0];

  useEffect(() => {
    if (hasRatingsInParams) return; // already have real ratings from query params

    setLoadingRatings(true);
    getFacultyRating(firebaseKey, partitionNumber)
      .then((data) => {
        if (data) setRatings(data);
      })
      .finally(() => setLoadingRatings(false));
  }, [firebaseKey, partitionNumber, hasRatingsInParams]);

  // Auth & Rating submission logic
  const [originalUserRating, setOriginalUserRating] = useState<{
    attendance_rating: number | null;
    correction_rating: number | null;
    teaching_rating: number | null;
  }>({
    attendance_rating: null,
    correction_rating: null,
    teaching_rating: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const ratingDocId = user ? `${firebaseKey}_${user.uid}` : "";

  useEffect(() => {
    if (!user || !firebaseKey) return;
    const fetchUserRating = async () => {
      try {
        const docRef = doc(db, "ratings", ratingDocId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const r = {
            attendance_rating: data.attendance_rating ?? null,
            correction_rating: data.correction_rating ?? null,
            teaching_rating: data.teaching_rating ?? null,
          };
          setOriginalUserRating(r);
          setSelected({
            attendance: r.attendance_rating ?? 0,
            correction: r.correction_rating ?? 0,
            teaching: r.teaching_rating ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch previous rating (might be a Firestore permissions issue):", error);
      }
    };
    fetchUserRating();
  }, [user, firebaseKey, ratingDocId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signInWithGoogle();
      return;
    }
    
    if (!selected.attendance && !selected.correction && !selected.teaching) {
       return;
    }

    setIsSubmitting(true);
    try {
      const newRating = {
        attendance_rating: selected.attendance || originalUserRating.attendance_rating,
        correction_rating: selected.correction || originalUserRating.correction_rating,
        teaching_rating: selected.teaching || originalUserRating.teaching_rating,
      };

      await writeFacultyRating(
        partitionNumber,
        firebaseKey,
        ratingDocId,
        originalUserRating,
        newRating
      );

      // Re-fetch overall ratings from Firebase to reflect immediately
      const updatedData = await getFacultyRating(firebaseKey, partitionNumber);
      if (updatedData) {
         setRatings(updatedData);
      }
      
      setOriginalUserRating(newRating);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const attendanceRating = ratings?.attendance_rating ?? null;
  const correctionRating = ratings?.correction_rating ?? null;
  const teachingRating = ratings?.teaching_rating ?? null;

  const ratingSections = useMemo(
    () => [
      { key: "attendance", label: "Attendance Rating", helper: "Amount of leniency in taking attendance", title: "Amount of leniency in taking attendance" },
      { key: "correction", label: "Correction Rating", helper: "Amount of leniency in correction", title: "Leniency in correction of papers" },
      { key: "teaching", label: "Teaching Rating", helper: "Experience in teaching", title: "Experience and quality of teaching" },
    ],
    []
  );

  const formatRating = (val: number | null) =>
    val == null ? "—" : val.toFixed(2);

  return (
    <div className="min-h-screen flex flex-col bg-surface-dim text-on-surface font-body-md">
      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-surface-dim/80 px-margin-mobile py-4 shadow-lg shadow-surface-dim/20 backdrop-blur-xl md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <a className="flex items-center text-on-surface-variant transition-colors hover:text-on-surface" href="/showFaculty">
            <span className="material-symbols-outlined mr-2">arrow_back</span>
          </a>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">Faculty Ranker</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <a className="font-label-md text-label-md text-on-surface-variant transition-all duration-300 hover:text-on-surface" href="/">Home</a>
          <a className="border-b-2 border-primary pb-1 font-label-md text-label-md text-primary" href="/showFaculty">All Faculty</a>
        </nav>
        <div className="hidden md:block">
          {!user ? (
            <button onClick={signInWithGoogle} className="rounded-full border border-primary/30 px-6 py-2 font-label-md text-label-md text-primary transition-all duration-300 hover:bg-white/5 active:scale-95">Sign In</button>
          ) : (
            <button onClick={signOutWithGoogle} className="rounded-full border border-error/30 px-6 py-2 font-label-md text-label-md text-error transition-all duration-300 hover:bg-error/10 active:scale-95">Sign Out</button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col px-margin-mobile pb-16 pt-24 md:px-margin-desktop">
        <section className="mb-12">
          <div className="glass-card relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl p-6 md:flex-row md:p-8">
            <div className="pointer-events-none absolute inset-0 shimmer" />
            <div className="relative z-10 aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 md:w-64">
              <img className="h-full w-full object-cover" src={facultyImage} alt={facultyName} />
            </div>
            <div className="relative z-10 flex-1">
              <div className="mb-6 flex flex-col gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">{facultyName}</h1>
                <p className="max-w-2xl leading-relaxed text-on-surface-variant">
                  <span className="mr-2 font-bold text-primary">Specialization Areas:</span>
                  {facultySpecialization}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Attendance", value: attendanceRating },
                  { label: "Correction", value: correctionRating },
                  { label: "Teaching", value: teachingRating },
                ].map((item) => (
                  <div key={item.label} className="glass-card inner-glow flex flex-col items-center justify-center gap-1 rounded-2xl border-primary/20 p-4">
                    {loadingRatings ? (
                      <span className="h-8 w-16 animate-pulse rounded-md bg-white/10" />
                    ) : (
                      <span className={`font-rating-number text-rating-number ${item.label === "Correction" ? "text-tertiary" : "text-primary"}`}>
                        {formatRating(item.value)}
                      </span>
                    )}
                    <span className="font-label-md text-label-md uppercase tracking-widest text-on-secondary-container">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="mb-8 flex items-center gap-2 font-headline-md text-headline-md">
              <span className="material-symbols-outlined text-primary">rate_review</span>
              Rate the faculty
            </h2>
            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="grid gap-10">
                {ratingSections.map((section) => (
                  <div key={section.key} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-md text-on-surface">{section.label}</span>
                        <span className="material-symbols-outlined cursor-help text-sm text-on-surface-variant" title={section.title}>help</span>
                      </div>
                      <p className="font-body-md text-on-surface-variant">{section.helper}</p>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const activeValue = hovered[section.key] ?? selected[section.key] ?? 0;
                        const isActive = value <= activeValue;
                        return (
                          <span
                            key={`${section.key}-${value}`}
                            className={`material-symbols-outlined rating-star text-3xl cursor-pointer transition-all duration-200 hover:scale-110 ${isActive ? "active text-primary" : "text-white/20"}`}
                            onMouseEnter={() => setHovered((prev) => ({ ...prev, [section.key]: value }))}
                            onMouseLeave={() => setHovered((prev) => ({ ...prev, [section.key]: 0 }))}
                            onClick={() => setSelected((prev) => ({ ...prev, [section.key]: value }))}
                          >
                            star
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-8">
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary px-12 py-4 font-headline-md text-on-primary-fixed transition-all duration-300 hover:bg-primary-fixed-dim hover:shadow-[0_0_20px_rgba(186,200,220,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? "Submitting..." : (!user ? "Sign In to Rate" : "Submit")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="mt-auto flex w-full flex-col items-center gap-4 border-t border-white/5 bg-surface-container-lowest py-8 backdrop-blur-md">
        <div className="flex gap-8">
          <a className="font-label-md text-label-md text-tertiary underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://github.com/GHReddy456/Faculty_Ranker.git">GitHub</a>
          <a className="font-label-md text-label-md text-tertiary underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://mail.google.com/mail/?view=cm&to=harigaddam2006@gmail.com" target="_blank" rel="noopener noreferrer">Contact us</a>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">© 2023 Faculty Ranker. All rights reserved.</p>
      </footer>
    </div>
  );
}
