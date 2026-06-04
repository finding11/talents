"use client";

export type AccountRole = "TALENT" | "RECRUITER";

type RoleToggleProps = {
  role: AccountRole;
  onChange: (role: AccountRole) => void;
  label?: string;
};

export function RoleToggle({ role, onChange, label = "I am signing in as" }: RoleToggleProps) {
  return (
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("TALENT")}
          className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
            role === "TALENT"
              ? "border-pitch-500 bg-pitch-500/15 text-white"
              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
          }`}
        >
          <span className="block font-semibold">Talent</span>
          <span className="mt-1 block text-xs opacity-80">Player profile</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("RECRUITER")}
          className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
            role === "RECRUITER"
              ? "border-pitch-500 bg-pitch-500/15 text-white"
              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
          }`}
        >
          <span className="block font-semibold">Recruiter</span>
          <span className="mt-1 block text-xs opacity-80">Scout / club</span>
        </button>
      </div>
    </div>
  );
}
