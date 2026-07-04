export function SearchBar({
  className = "",
  value = "",
  onChange,
}: {
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={"relative isolate z-[200] w-full max-w-2xl " + className}>
      <div className="relative flex h-14 w-full items-center overflow-visible rounded-full border border-white/10 bg-white/5 shadow-lg shadow-slate-950/40 backdrop-blur-xl">
        <div className="grid h-full w-14 place-items-center text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          className="peer h-full w-full bg-transparent px-2 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          type="text"
          id="search"
          value={value}
          onChange={onChange}
          placeholder="Search Faculty"
        />
      </div>
    </div>
  );
}
