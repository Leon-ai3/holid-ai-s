import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

const GIORNI = [
  { label: "Dom", value: 0 },
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Gio", value: 4 },
  { label: "Ven", value: 5 },
  { label: "Sab", value: 6 },
];

export default function ImpostazioniPiano({ onGenera, isLoading }) {
  const [nome, setNome] = useState("Vacanze estive 2025");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [oreStudio, setOreStudio] = useState(2);
  const [giorniRiposo, setGiorniRiposo] = useState([0]); // domenica di default

  const toggleGiorno = (val) => {
    setGiorniRiposo(prev =>
      prev.includes(val) ? prev.filter(g => g !== val) : [...prev, val]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dataInizio || !dataFine) return;
    onGenera({ nome, dataInizio, dataFine, oreStudio, giorniRiposo });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">Imposta le vacanze</h2>
        <p className="text-sm text-muted-foreground mt-1">L'IA distribuirà i compiti in modo equilibrato</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Nome del piano</Label>
        <Input value={nome} onChange={e => setNome(e.target.value)} className="h-9" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Inizio vacanze</Label>
          <Input type="date" value={dataInizio} onChange={e => setDataInizio(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fine vacanze</Label>
          <Input type="date" value={dataFine} onChange={e => setDataFine(e.target.value)} className="h-9" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Ore di studio al giorno (max)</Label>
        <div className="flex items-center gap-3">
          <input
            type="range" min="1" max="6" step="0.5"
            value={oreStudio}
            onChange={e => setOreStudio(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-semibold text-foreground w-16 text-right">{oreStudio} ore</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Giorni di riposo</Label>
        <div className="flex gap-2 flex-wrap">
          {GIORNI.map(g => (
            <button
              key={g.value}
              type="button"
              onClick={() => toggleGiorno(g.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                giorniRiposo.includes(g.value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!dataInizio || !dataFine || isLoading}>
        {isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generazione in corso...</>
        ) : (
          <><Sparkles className="w-4 h-4 mr-2" />Genera piano IA</>
        )}
      </Button>
    </form>
  );
}
