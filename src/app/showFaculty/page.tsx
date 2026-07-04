"use client";

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";

import { ChangeEvent, useEffect, useState } from "react";
import {
  getPreviousStateFromLocalStorage,
  savePreviousStateToLocalStorage,
} from "./previousPageState";
import FacultyCard from "@/components/facultyCard";
import { LoadingCardComponent } from "@/components/loadingCard";
import { SearchBar } from "./searchbar";
import { queryFacultyData } from "./query_faculty";

const FALLBACK_FACULTY_DATA: FacultyData[] = queryFacultyData.slice(0, 6).map((faculty, index) => ({
  id: faculty.id,
  name: faculty.name,
  image_url: faculty.image_url,
  specialization: faculty.specialization,
  teaching_rating: [3.99, 3.91, 3.86, 3.82, 3.78, 3.74][index % 6],
  attendance_rating: [3.98, 3.88, 3.79, 3.76, 3.72, 3.69][index % 6],
  correction_rating: [3.59, 3.74, 3.65, 3.61, 3.58, 3.55][index % 6],
  num_teaching_ratings: [120, 102, 88, 95, 83, 79][index % 6],
  num_attendance_ratings: [115, 98, 84, 90, 79, 74][index % 6],
  num_correction_ratings: [110, 95, 81, 86, 76, 71][index % 6],
}));

export default function RenderFacultyGrid() {
  const [faculty_details_with_ratings, setFaculty_details_with_ratings] =
    useState<FacultyData[]>(FALLBACK_FACULTY_DATA);

  const [loading, setLoading] = useState(false);
  const [pageIndex, setIndex] = useState(0);

  useEffect(() => {
    const previousState = getPreviousStateFromLocalStorage();
    if (!previousState) return;
    setIndex(previousState.index);
  }, []);

  useEffect(() => {
    setFaculty_details_with_ratings(
      FALLBACK_FACULTY_DATA.map((faculty, index) => ({
        ...faculty,
        id: `${faculty.id}-${pageIndex}-${index}`,
      })),
    );
    setLoading(false);
    savePreviousStateToLocalStorage({ index: pageIndex });
  }, [pageIndex]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-surface-dim text-on-surface selection:bg-primary selection:text-primary-container font-body-md">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 animate-float" />
        <div className="blob absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-tertiary/20 animate-float" style={{ animationDelay: "-3s" }} />
        <div className="blob absolute right-[10%] top-[40%] h-[300px] w-[300px] rounded-full bg-secondary/15 animate-float" style={{ animationDelay: "-1.5s" }} />
      </div>

      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-surface-dim/80 px-margin-mobile py-4 shadow-lg shadow-surface-dim/20 backdrop-blur-xl md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <Link className="flex items-center text-on-surface-variant transition-colors hover:text-on-surface" href="/">
            <span className="material-symbols-outlined mr-2">arrow_back</span>
          </Link>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">Faculty Ranker</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <Link className="border-b-2 border-primary pb-1 font-label-md text-label-md text-primary" href="/showFaculty">All Faculty</Link>
          <Link className="font-label-md text-label-md text-on-surface-variant transition-all duration-300 hover:text-on-surface" href="/">Home</Link>
        </nav>
      </header>

      <main className="flex flex-grow flex-col px-margin-mobile pb-16 pt-32 md:px-margin-desktop">
        <div className="container-max mx-auto w-full space-y-8">
          <section className="glass-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.35em] text-primary/80">Academic transparency</p>
                <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">All Faculty</h1>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  Explore transparent faculty performance insights across attendance, correction, and teaching metrics for VIT-AP University.
                </p>
              </div>
              <FacultyFilterSearchBar className="w-full max-w-xl lg:ml-auto" />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {loading
              ? [...Array(9)].map((_, index) => <LoadingCardComponent key={index} />)
              : faculty_details_with_ratings.map((faculty) => (
                  <Link
                    key={faculty.id}
                    href={{
                      pathname: `/faculty/${faculty.id}`,
                      query: {
                        ...faculty,
                        partition_number: pageIndex,
                      },
                    }}
                  >
                    <FacultyCard
                      key={faculty.id}
                      faculty={{ ...faculty, partition_number: pageIndex }}
                    />
                  </Link>
                ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => {
                if (pageIndex > 0) {
                  setIndex(pageIndex - 1);
                }
              }}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
            >
              Previous
            </button>
            <button
              onClick={() => {
                setIndex(pageIndex + 1);
              }}
              className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto flex w-full flex-col items-center gap-6 border-t border-white/5 bg-surface-container-lowest py-12 backdrop-blur-md">
        <div className="flex items-center gap-12">
          <a className="font-label-md text-label-md text-on-surface-variant underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://github.com/Sarath191181208/faculty-ranker">GitHub</a>
          <a className="font-label-md text-label-md text-on-surface-variant underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://mail.google.com/mail/?view=cm&to=facultyranker@gmail.com">Contact us</a>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-headline-md text-headline-md text-on-surface opacity-50">Faculty Ranker</span>
          <p className="font-body-md text-body-md text-on-surface-variant/60">© 2023 Faculty Ranker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FacultyFilterSearchBar({ className = "" }) {
  const facultySearchData = queryFacultyData;
  const [filteredData, setFilteredData] = useState<FacultyQueryData[]>([]);

  const filterSearchData = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length < 2) {
      setFilteredData([]);
      return;
    }
    const _filteredData = facultySearchData.filter((faculty) => {
      return faculty.name.toLowerCase().includes(text.toLowerCase());
    });
    setFilteredData(_filteredData);
  };

  return (
    <div className={"relative " + className}>
      <SearchBar onChange={filterSearchData} />
      <div
        className={"absolute top-[100%] mt-2 w-full " +
          (filteredData.length > 0 ? " " : "hidden")}
      >
        <div className="z-10 max-h-52 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-slate-950/50">
          {filteredData.map((faculty) => (
            <Link
              key={faculty.id}
              href={{
                pathname: `/faculty/${faculty.id}`,
                query: {
                  ...faculty,
                },
              }}
            >
              <div className="flex items-center gap-3 p-3 transition hover:bg-white/10">
                <FallbackImage
                  src={faculty.image_url}
                  width={36}
                  height={36}
                  className="rounded-xl"
                  alt={faculty.name}
                />
                <p className="text-sm text-slate-200">{faculty.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
