"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { queryFacultyData } from "@/app/showFaculty/query_faculty";
import { getFacultyRating } from "@/firebase/getFacultyDetails";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { writeFacultyRating } from "@/firebase/starRating";
import { sanitizeFacultyKey } from "@/firebase/sanitizeFacultyKey";
import facultyDetailsData from "@/data/faculty_details.json";
import Image from "next/image";

export default function SingleFacultyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, signInWithGoogle, signOutWithGoogle } = useAuth();

  const [hovered, setHovered] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("Education");

  const facultyId = params?.id ?? searchParams.get("id") ?? "unknown";
  const nameFromParams = searchParams.get("name") ?? "";

  // Try to find the faculty in queryFacultyData to get partition_number and fallback info
  // facultyId from the URL may be a composite like "Dr_Kailash_Chandra_Mishra-0-3" (sanitized name)
  // or a real Firestore ID like "8ysKflP8crtmGJXxHcIy-0-3". Strip the page suffix first.
  const baseId = String(facultyId).split(/-\d+-\d+$/)[0]; // e.g. "Dr_Kailash_Chandra_Mishra" or "8ysKfl..."
  const matchedFaculty = queryFacultyData.find(
    (faculty) =>
      faculty.id === baseId ||
      sanitizeFacultyKey(faculty.id) === baseId ||
      (nameFromParams && faculty.name === nameFromParams)
  );

  const facultyName = nameFromParams || matchedFaculty?.name || "";

  const facultySpecialization =
    searchParams.get("specialization") ??
    matchedFaculty?.specialization ??
    "";
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

  // The firebaseKey is the sanitized base ID used as the Firestore map key
  const firebaseKey = sanitizeFacultyKey(matchedFaculty?.id ?? baseId);

  const details = (facultyDetailsData as Record<string, any>)[firebaseKey] || null;

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
            <button onClick={signInWithGoogle} className="rounded-lg border border-primary/30 bg-primary px-6 py-2 font-label-md text-label-md text-on-primary-fixed transition-all duration-300 active:scale-95 hover:bg-primary/90">Sign In</button>
          ) : (
            <button onClick={signOutWithGoogle} className="rounded-lg border border-error/30 bg-error/10 px-6 py-2 font-label-md text-label-md text-error transition-all duration-300 active:scale-95 hover:bg-error/20">Sign Out</button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col px-margin-mobile pb-16 pt-24 md:px-margin-desktop">
        <section className="mb-12">
          <div className="glass-card relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl p-6 md:flex-row md:p-8">
            <div className="pointer-events-none absolute inset-0 shimmer" />
            <div className="relative z-10 aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 md:w-64">
              <Image className="h-full w-full object-cover" src={facultyImage} alt={facultyName} fill sizes="(max-width: 768px) 100vw, 256px" />
            </div>
            <div className="relative z-10 flex-1">
              <div className="mb-6 flex flex-col gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">{facultyName}</h1>
                {details?.designation && (
                  <p className="text-primary font-bold text-lg">{details.designation}</p>
                )}
                {details?.department && (
                  <p className="text-on-surface-variant font-medium text-base mb-2">{details.department}</p>
                )}
                <p className="max-w-2xl leading-relaxed text-on-surface-variant mt-2">
                  <span className="mr-2 font-bold text-primary">Specialization Areas:</span>
                  {facultySpecialization}
                </p>
                
                {details && (
                  <div className="flex flex-col gap-2 mt-4 text-sm text-on-surface-variant">
                    {details.email && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">mail</span>
                        <a href={`mailto:${details.email}`} className="hover:text-primary transition-colors">{details.email}</a>
                      </div>
                    )}
                    {details.office_address && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span>{details.office_address}</span>
                      </div>
                    )}
                  </div>
                )}
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

        {details && (
          <section className="mb-12">
            <div className="glass-card rounded-3xl p-6 md:p-8">
              {/* Tab Header */}
              <div className="flex overflow-x-auto border-b border-primary/20 pb-2 mb-8 hide-scrollbar gap-2">
                {["Education", "Research", "Projects", "Patents", "Awards"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 font-headline-md text-sm sm:text-base font-bold whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-[#6a0012] text-white" 
                        : "bg-[#fcebee] text-[#6a0012] hover:bg-[#fad3db]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === "Education" && (
                  <div className="animate-fade-in space-y-6 text-on-surface">
                    <h3 className="text-2xl font-bold text-[#6a0012] mb-6">Education</h3>
                    {details.education?.phd && (
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span> Doctoral Degree
                        </h4>
                        <p className="ml-4 mt-1 text-on-surface-variant">{details.education.phd}</p>
                      </div>
                    )}
                    {details.education?.pg && (
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span> Master Degree
                        </h4>
                        <p className="ml-4 mt-1 text-on-surface-variant">{details.education.pg}</p>
                      </div>
                    )}
                    {details.education?.ug && (
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span> Under Graduation
                        </h4>
                        <p className="ml-4 mt-1 text-on-surface-variant">{details.education.ug}</p>
                      </div>
                    )}
                    {!details.education?.phd && !details.education?.pg && !details.education?.ug && (
                      <p className="text-on-surface-variant italic">No education details available.</p>
                    )}
                  </div>
                )}

                {activeTab === "Research" && (
                  <div className="animate-fade-in space-y-6 text-on-surface">
                    <h3 className="text-2xl font-bold text-[#6a0012] mb-6">Research</h3>
                    
                    {details.research?.area && (
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span> Area of Specialisation
                        </h4>
                        <p className="ml-4 mt-1 text-on-surface-variant">{details.research.area}</p>
                      </div>
                    )}

                    <div className="space-y-3 mt-8">
                      {details.research?.orcid && (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span>
                          <span className="font-medium">ORCID - </span>
                          <a href={details.research.orcid.startsWith('http') ? details.research.orcid : `https://orcid.org/${details.research.orcid}`} target="_blank" rel="noreferrer" className="text-[#6a0012] hover:underline">Link</a>
                        </div>
                      )}
                      {details.research?.scopus && (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span>
                          <span className="font-medium">SCOPUS - </span>
                          <a href={details.research.scopus.startsWith('http') ? details.research.scopus : `https://www.scopus.com/authid/detail.uri?authorId=${details.research.scopus}`} target="_blank" rel="noreferrer" className="text-[#6a0012] hover:underline">Link</a>
                        </div>
                      )}
                      {details.research?.google_scholar && (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span>
                          <span className="font-medium">GOOGLE SCHOLAR - </span>
                          <a href={details.research.google_scholar} target="_blank" rel="noreferrer" className="text-[#6a0012] hover:underline">Link</a>
                        </div>
                      )}
                      {details.research?.vidwan && (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span>
                          <span className="font-medium">Vidwan - </span>
                          <a href={details.research.vidwan} target="_blank" rel="noreferrer" className="text-[#6a0012] hover:underline">Link</a>
                        </div>
                      )}
                      {details.linkedin && (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012]"></span>
                          <span className="font-medium">LinkedIn - </span>
                          <a href={details.linkedin} target="_blank" rel="noreferrer" className="text-[#6a0012] hover:underline">Link</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "Projects" && (
                  <div className="animate-fade-in text-on-surface">
                    <h3 className="text-2xl font-bold text-[#6a0012] mb-6">Projects</h3>
                    {details.projects && details.projects.length > 0 ? (
                      <div className="space-y-4 text-on-surface-variant">
                        {details.projects.map((proj: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012] mt-2 flex-shrink-0"></span>
                            <span>{proj.project}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-on-surface-variant italic">No projects available.</p>
                    )}
                  </div>
                )}

                {activeTab === "Patents" && (
                  <div className="animate-fade-in text-on-surface">
                    <h3 className="text-2xl font-bold text-[#6a0012] mb-6">Patents</h3>
                    {details.patents && details.patents.length > 0 ? (
                      <div className="space-y-4 text-on-surface-variant">
                        {details.patents.map((pat: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012] mt-2 flex-shrink-0"></span>
                            <span>{pat.patent}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-on-surface-variant italic">No patents available.</p>
                    )}
                  </div>
                )}

                {activeTab === "Awards" && (
                  <div className="animate-fade-in text-on-surface">
                    <h3 className="text-2xl font-bold text-[#6a0012] mb-6">Awards</h3>
                    {details.awards && details.awards.length > 0 ? (
                      <div className="space-y-4 text-on-surface-variant">
                        {details.awards.map((award: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6a0012] mt-2 flex-shrink-0"></span>
                            <span>{award.award_or_recognition_name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-on-surface-variant italic">No awards available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

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
                        const activeValue = hovered[section.key] || selected[section.key] || 0;
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
        <p className="font-body-md text-body-md text-on-surface-variant">© 2026 Faculty Ranker. All rights reserved.</p>
      </footer>
    </div>
  );
}
