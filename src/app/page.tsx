"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { user, signInWithGoogle, signOutWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-surface-dim text-on-surface selection:bg-primary selection:text-primary-container font-body-md">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 animate-float" />
        <div className="blob absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-tertiary/20 animate-float" style={{ animationDelay: "-3s" }} />
        <div className="blob absolute right-[10%] top-[40%] h-[300px] w-[300px] rounded-full bg-secondary/15 animate-float" style={{ animationDelay: "-1.5s" }} />
      </div>

      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-surface-dim/80 px-margin-mobile py-4 shadow-lg shadow-surface-dim/20 backdrop-blur-xl md:px-margin-desktop">
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-headline-md font-bold text-on-surface">Faculty Ranker</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <Link className="border-b-2 border-primary pb-1 font-label-md text-label-md text-primary" href="/">Home</Link>
          <Link className="font-label-md text-label-md text-on-surface-variant transition-all duration-300 hover:text-on-surface" href="/showFaculty">All Faculty</Link>
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

      <main className="relative z-20 flex flex-grow flex-col px-margin-mobile pb-24 pt-32 md:px-margin-desktop">
        <div className="container-max relative mx-auto flex h-full flex-col items-center justify-between gap-12 md:flex-row">
          <div className="z-10 w-full text-center md:w-1/2 md:text-left">
            <h1 className="mb-6 font-display-lg text-display-lg leading-tight tracking-tight text-white">
              Welcome to <br />
              <span className="italic text-primary">Faculty Rating System</span>
            </h1>
            <p className="mx-auto mb-10 max-w-lg font-body-lg text-body-lg text-on-surface-variant md:mx-0">
              Empowering students and academia through transparent, data-driven performance metrics for modern educational excellence.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
              <Link href="/showFaculty" className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-headline-md text-headline-md text-primary-container transition-all duration-300 hover:shadow-[0_0_20px_rgba(186,200,220,0.4)] active:scale-95">
                Faculty
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
              {!user && (
                <button onClick={signInWithGoogle} className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-headline-md text-headline-md text-white transition-all duration-300 hover:bg-white/10 active:scale-95">
                  Sign In
                </button>
              )}
            </div>
          </div>

          <div className="relative z-20 mt-4 h-full min-h-[400px] w-full md:w-5/12 md:aspect-auto">
            <div className="absolute right-[10%] top-[10%] h-4/5 w-4/5 rounded-3xl bg-secondary/10 blur-2xl" />
            <div className="glass-card absolute right-0 top-0 z-20 h-[90%] w-full rotate-3 overflow-hidden rounded-3xl p-4 transition-transform duration-700 hover:rotate-0">
              <div className="inner-glow relative h-full w-full overflow-hidden rounded-2xl">
                <Image className="h-full w-full object-cover" src="/stitch_glassmorphic_ui_redesign/shutterstock_2183363749-scaled.jpg" alt="Faculty illustration" fill sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary">Top Rated Educator</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((star) => (
                        <span key={star} className="material-symbols-outlined text-sm text-[#FFD700]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                      <span className="material-symbols-outlined text-sm text-white/40">star</span>
                    </div>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[85%] bg-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card absolute -bottom-4 -left-4 z-30 animate-float rounded-2xl border border-white/20 p-6" style={{ animationDelay: "-2s" }}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-tertiary/30 bg-tertiary-container/50">
                  <span className="material-symbols-outlined text-tertiary">analytics</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant">Active Students</p>
                  <p className="font-rating-number text-rating-number text-white">12,400+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="relative z-0 -mt-14 bg-surface-container-low/50 px-margin-mobile py-24 pt-28 backdrop-blur-sm md:-mt-16 md:px-margin-desktop md:pt-32">
        <div className="container-max mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: "verified", title: "Verified Ratings", text: "Authenticated student feedback systems ensure the highest integrity of faculty reviews and academic performance data." },
              { icon: "insights", title: "Advanced Analytics", text: "Deep dive into course-specific metrics, teaching methodologies, and departmental rankings with intuitive visualizations." },
              { icon: "school", title: "Academic Focus", text: "Built specifically for the higher education ecosystem, prioritizing research impact and instructional excellence." },
            ].map((item) => (
              <div key={item.title} className="glass-card group rounded-3xl border border-white/5 p-8 transition-all hover:border-primary/30">
                <span className="material-symbols-outlined mb-4 text-4xl text-primary transition-transform group-hover:scale-110">{item.icon}</span>
                <h3 className="mb-2 font-headline-md text-headline-md text-white">{item.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
