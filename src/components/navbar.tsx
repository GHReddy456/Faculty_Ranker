"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, signInWithGoogle, signOutWithGoogle } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOutWithGoogle();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-lg text-sky-200">
            ✦
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">
              Faculty Ranker
            </p>
            <p className="text-base font-semibold text-white">Academic Insights</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/showFaculty" className="text-sm font-medium text-slate-300 transition hover:text-white">
            All Faculty
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-300 transition hover:text-white">
            Home
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 sm:flex">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? "Profile"}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/20 text-sm text-sky-200">
                    {user.displayName?.charAt(0) ?? "U"}
                  </div>
                )}
                <span className="text-sm text-slate-200">
                  {user.displayName?.split(" ")[0] ?? "Student"}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
