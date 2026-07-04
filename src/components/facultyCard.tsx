import FallbackImage from "./FallbackImage";
import { CiUser } from "react-icons/ci";
import { getRakingColor } from "./getRakingColor";

export default function FacultyCard(props: {
  faculty: FacultyData & { partition_number: number };
}) {
  const faculty = props.faculty;

  return (
    <div className="glass-card inner-glow h-full rounded-[1.75rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40">
      <div className="flex gap-4">
        <div className="shrink-0">
          <FallbackImage
            src={faculty.image_url}
            alt={faculty.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-2xl border border-white/10 bg-slate-900 object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-white">{faculty.name}</h1>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
            {faculty.specialization}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {createRatingTray(
          "Attendance",
          faculty.attendance_rating,
          faculty.num_attendance_ratings,
          getRakingColor(faculty.attendance_rating ?? 0),
        )}
        {createRatingTray(
          "Correction",
          faculty.correction_rating,
          faculty.num_correction_ratings,
          getRakingColor(faculty.correction_rating ?? 0),
        )}
        {createRatingTray(
          "Teaching",
          faculty.teaching_rating,
          faculty.num_teaching_ratings,
          getRakingColor(faculty.teaching_rating ?? 0),
        )}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
        <span>Student reviews</span>
        <span className="font-semibold text-primary">
          {Math.max(
            faculty.num_teaching_ratings ?? 0,
            faculty.num_attendance_ratings ?? 0,
            faculty.num_correction_ratings ?? 0
          )}
        </span>
      </div>
    </div>
  );
}

const createRatingTray = (
  label: string,
  rating: number | undefined | null,
  num_rated: number | undefined | null,
  color: string,
) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-3">
      <div>
        <p className="text-sm font-medium text-slate-300">{label}</p>
      </div>
      <div className="text-right">
        <p className={`${color} text-base font-semibold`}>
          {rating == null
            ? "—"
            : rating.toLocaleString("en", {
                minimumIntegerDigits: 1,
                minimumFractionDigits: 2,
                useGrouping: false,
              })}
        </p>
        <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-400">
          <CiUser className="text-sm" />
          <span>{num_rated ?? 0}</span>
        </div>
      </div>
    </div>
  );
};
