const MATERIA_COLORS = {
  "Matematica": "bg-blue-100 text-blue-700 border-blue-200",
  "Italiano": "bg-green-100 text-green-700 border-green-200",
  "Storia": "bg-amber-100 text-amber-700 border-amber-200",
  "Geografia": "bg-teal-100 text-teal-700 border-teal-200",
  "Inglese": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Scienze": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Latino": "bg-orange-100 text-orange-700 border-orange-200",
  "Greco": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Fisica": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Chimica": "bg-purple-100 text-purple-700 border-purple-200",
  "Arte": "bg-pink-100 text-pink-700 border-pink-200",
  "Musica": "bg-violet-100 text-violet-700 border-violet-200",
};

const DEFAULT_COLOR = "bg-slate-100 text-slate-700 border-slate-200";

export function getMateriaColor(materia) {
  return MATERIA_COLORS[materia] || DEFAULT_COLOR;
}

export default function MateriaIcon({ materia, size = "sm" }) {
  const colorClass = getMateriaColor(materia);
  const letter = materia?.charAt(0)?.toUpperCase() || "?";
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  return (
    <div className={`${sizeClass} ${colorClass} rounded-lg border flex items-center justify-center font-semibold flex-shrink-0`}>
      {letter}
    </div>
  );
}
