"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { queryFacultyData } from "@/app/showFaculty/query_faculty";

export default function SingleFacultyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [hovered, setHovered] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Record<string, number>>({});

  const facultyId = params?.id ?? searchParams.get("id") ?? "unknown";
  const facultyName = searchParams.get("name") ?? "Dr. Aastha Madonna Sathe";
  const matchedFaculty = queryFacultyData.find(
    (faculty) => faculty.id === facultyId || faculty.name === facultyName
  );
  const facultySpecialization =
    searchParams.get("specialization") ??
    matchedFaculty?.specialization ??
    "Computational Statistics, Stable Distributions, Time Series Analysis, Forecasting, Artificial Neural Networks";
  const facultyImage = searchParams.get("image_url") ?? matchedFaculty?.image_url ?? "/teach.jpg";
  const attendanceRating = Number(searchParams.get("attendance_rating") ?? 3.98);
  const correctionRating = Number(searchParams.get("correction_rating") ?? 3.59);
  const teachingRating = Number(searchParams.get("teaching_rating") ?? 3.99);

  const ratingSections = useMemo(
    () => [
      { key: "attendance", label: "Attendance Rating", helper: "Amount of leniency in taking attendance", title: "Amount of leniency in taking attendance" },
      { key: "correction", label: "Correction Rating", helper: "Amount of leniency in correction", title: "Leniency in correction of papers" },
      { key: "teaching", label: "Teaching Rating", helper: "Experience in teaching", title: "Experience and quality of teaching" },
    ],
    []
  );

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
          <a className="border-b-2 border-primary pb-1 font-label-md text-label-md text-primary" href="/showFaculty">All Faculty</a>
          <button className="rounded-full border border-primary/30 px-6 py-2 font-label-md text-label-md text-primary transition-all duration-300 hover:bg-white/5 active:scale-95">Sign In</button>
        </nav>
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
                  { label: "Attendance", value: attendanceRating.toFixed(2) },
                  { label: "Correction", value: correctionRating.toFixed(2) },
                  { label: "Teaching", value: teachingRating.toFixed(2) },
                ].map((item) => (
                  <div key={item.label} className="glass-card inner-glow flex flex-col items-center justify-center gap-1 rounded-2xl border-primary/20 p-4">
                    <span className={`font-rating-number text-rating-number ${item.label === "Correction" ? "text-tertiary" : "text-primary"}`}>{item.value}</span>
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
            <form className="space-y-10" onSubmit={(event) => event.preventDefault()}>
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
                            className={`material-symbols-outlined rating-star text-3xl ${isActive ? "active" : ""}`}
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
                <button className="rounded-xl bg-primary px-12 py-4 font-headline-md text-on-primary-fixed transition-all duration-300 hover:bg-primary-fixed-dim hover:shadow-[0_0_20px_rgba(186,200,220,0.4)] active:scale-95">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="mt-auto flex w-full flex-col items-center gap-4 border-t border-white/5 bg-surface-container-lowest py-8 backdrop-blur-md">
        <div className="flex gap-8">
          <a className="font-label-md text-label-md text-tertiary underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://github.com/Sarath191181208/faculty-ranker">GitHub</a>
          <a className="font-label-md text-label-md text-tertiary underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://mail.google.com/mail/?view=cm&to=facultyranker@gmail.com">Contact us</a>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">© 2023 Faculty Ranker. All rights reserved.</p>
      </footer>
    </div>
  );
}
