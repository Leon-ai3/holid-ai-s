import { BookOpen, Clock, CheckCircle2, BarChart3 } from "lucide-react";

export default function StatistichePiano({ piano }) {
  const tuttiCompiti = piano.piano_generato?.flatMap(g => g.compiti || []) || [];
  const completati = tuttiCompiti.filter(c => c.completato).length;
  const totale = tuttiCompiti.length;
  const minutiTotali = tuttiCompiti.reduce((acc, c) => acc + (c.minuti || 0), 0);
  const percentuale = totale > 0 ? Math.round((completati / totale) * 100) : 0;

  const stats = [
    { icon: BookOpen, label: "Compiti totali", value: totale, color: "text-primary" },
    { icon: Clock, label: "Ore totali", value: `${Math.round(minutiTotali / 60 * 10) / 10}h`, color: "text-amber-600" },
    { icon: CheckCircle2, label: "Completati", value: completati, color: "text-accent" },
    { icon: BarChart3, label: "Progresso", value: `${percentuale}%`, color: "text-indigo-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-card border border-border rounded-xl p-4">
          <Icon className={`w-5 h-5 ${color} mb-2`} />
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
