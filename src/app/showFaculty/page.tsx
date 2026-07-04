"use client";

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";
import { useAuth } from "@/context/AuthContext";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getPreviousStateFromLocalStorage,
  savePreviousStateToLocalStorage,
} from "./previousPageState";
import FacultyCard from "@/components/facultyCard";
import { LoadingCardComponent } from "@/components/loadingCard";
import { SearchBar } from "./searchbar";
import { queryFacultyData, FACULTY_DATA_VERSION } from "./query_faculty";
import { getFacultyRating } from "@/firebase/getFacultyDetails";
import { sanitizeFacultyKey } from "@/firebase/sanitizeFacultyKey";

const ITEMS_PER_PAGE = 6;

export default function RenderFacultyGrid() {
  const { user, signInWithGoogle, signOutWithGoogle } = useAuth();
  const [faculty_details_with_ratings, setFaculty_details_with_ratings] =
    useState<FacultyData[]>([]);

  const [loading, setLoading] = useState(true);
  const [pageIndex, setIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMeta = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return queryFacultyData; 
    return queryFacultyData.filter((f) =>
      `${f.name} ${f.specialization ?? ""}`.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMeta.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    const previousState = getPreviousStateFromLocalStorage(FACULTY_DATA_VERSION);
    if (!previousState) return;
    setIndex(previousState.index);
  }, []);

  useEffect(() => {
    const safePageIndex = Math.min(pageIndex, Math.max(0, totalPages - 1));
    if (safePageIndex !== pageIndex) {
      setIndex(safePageIndex);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const pageSlice = filteredMeta.slice(
      safePageIndex * ITEMS_PER_PAGE,
      (safePageIndex + 1) * ITEMS_PER_PAGE
    );

    Promise.all(
      pageSlice.map(async (meta, index) => {
        const safeId = sanitizeFacultyKey(meta.id);
        const ratingData = await getFacultyRating(safeId, meta.partition_number);
        return {
          id: `${safeId}-${safePageIndex}-${index}`,
          name: meta.name,
          image_url: meta.image_url ?? "/teach.jpg",
          specialization: meta.specialization ?? "",
          teaching_rating: ratingData?.teaching_rating ?? null,
          attendance_rating: ratingData?.attendance_rating ?? null,
          correction_rating: ratingData?.correction_rating ?? null,
          num_teaching_ratings: ratingData?.num_teaching_ratings ?? null,
          num_attendance_ratings: ratingData?.num_attendance_ratings ?? null,
          num_correction_ratings: ratingData?.num_correction_ratings ?? null,
          partition_number: meta.partition_number,
        } as FacultyData;
      })
    )
      .then((results) => {
        if (!isMounted) return;
        setFaculty_details_with_ratings(results);
      })
      .catch(() => {
        if (!isMounted) return;
        setFaculty_details_with_ratings([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          savePreviousStateToLocalStorage({ index: safePageIndex }, FACULTY_DATA_VERSION);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pageIndex, filteredMeta, totalPages]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-surface-dim text-on-surface selection:bg-primary selection:text-primary-container font-body-md" suppressHydrationWarning>
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
        <div className="flex items-center gap-4">
          {!user ? (
            <button onClick={signInWithGoogle} className="rounded-lg border border-primary/30 bg-primary px-6 py-2 font-label-md text-label-md text-on-primary-fixed transition-all duration-300 active:scale-95 hover:bg-primary/90">
              Sign In
            </button>
          ) : (
            <button onClick={signOutWithGoogle} className="rounded-lg border border-error/30 bg-error/10 px-6 py-2 font-label-md text-label-md text-error transition-all duration-300 active:scale-95 hover:bg-error/20">
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-grow flex-col px-margin-mobile pb-16 pt-32 md:px-margin-desktop">
        <div className="container-max mx-auto w-full space-y-8">
          <section className="glass-card relative z-10 overflow-visible rounded-[2rem] p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.35em] text-primary/80">Academic transparency</p>
                <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">All Faculty</h1>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  Explore transparent faculty performance insights across attendance, correction, and teaching metrics for VIT-AP University.
                </p>
              </div>
              <FacultyFilterSearchBar
                className="w-full max-w-xl lg:ml-auto"
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setIndex(0);
                }}
              />
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
                        partition_number: (faculty as FacultyData & { partition_number?: number }).partition_number ?? pageIndex,
                      },
                    }}
                  >
                    <FacultyCard
                      key={faculty.id}
                      faculty={{ ...faculty, partition_number: (faculty as FacultyData & { partition_number?: number }).partition_number ?? pageIndex }}
                    />
                  </Link>
                ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setIndex((current) => Math.max(0, current - 1));
              }}
              disabled={pageIndex === 0}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Page {pageIndex + 1} of {totalPages}
            </div>
            <button
              onClick={() => {
                setIndex((current) => Math.min(totalPages - 1, current + 1));
              }}
              disabled={pageIndex >= totalPages - 1}
              className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto flex w-full flex-col items-center gap-6 border-t border-white/5 bg-surface-container-lowest py-12 backdrop-blur-md">
        <div className="flex items-center gap-12">
          <a className="font-label-md text-label-md text-on-surface-variant underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://github.com/GHReddy456/Faculty_Ranker.git">GitHub</a>
          <a className="font-label-md text-label-md text-on-surface-variant underline opacity-80 transition-colors hover:text-primary hover:opacity-100" href="https://mail.google.com/mail/?view=cm&to=harigaddam2006@gmail.com" target="_blank" rel="noopener noreferrer">Contact us</a>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-headline-md text-headline-md text-on-surface opacity-50">Faculty Ranker</span>
          <p className="font-body-md text-body-md text-on-surface-variant/60">© 2026 Faculty Ranker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FacultyFilterSearchBar({
  className = "",
  value = "",
  onChange,
}: {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const facultySearchData = queryFacultyData;
  const [filteredData, setFilteredData] = useState<FacultyQueryData[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const updateDropdownPosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [filteredData, value]);

  const filterSearchData = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (onChange) {
      onChange(text);
    }

    if (text.length < 2) {
      setFilteredData([]);
      return;
    }

    const _filteredData = facultySearchData.filter((faculty) => {
      const searchableText = `${faculty.name} ${faculty.specialization ?? ""}`.toLowerCase();
      return searchableText.includes(text.toLowerCase());
    });
    setFilteredData(_filteredData);
  };

  return (
    <div ref={containerRef} className={"relative isolate z-[300] " + className}>
      <SearchBar value={value} onChange={filterSearchData} />
      {filteredData.length > 0 && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[9999]"
              style={{
                top: dropdownStyle.top,
                left: dropdownStyle.left,
                width: dropdownStyle.width,
              }}
            >
              <div className="relative z-[10000] max-h-52 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/50">
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
