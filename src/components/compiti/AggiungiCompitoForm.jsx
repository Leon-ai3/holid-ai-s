import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Trash2, Wand2 } from "lucide-react";

// Calcolo automatico minuti basato su difficoltà, tipo e quantità esercizi
function calcolaMinutiAuto(tipo, difficolta, numEsercizi) {
  if (numEsercizi === 0) return "";
  // Minuti base per esercizio per tipo
  const basePerEsercizio = {
    esercizi: 3,
    problemi: 8,
    versione: 10,
    tema: 15,
    studio: 12,
    lettura: 5,
    ripasso: 4,
    altro: 5,
  };
  const moltiplicatoreDifficolta = { facile: 0.7, media: 1.0, difficile: 1.5 };
  const base = basePerEsercizio[tipo] || 5;
  const molt = moltiplicatoreDifficolta[difficolta] || 1.0;
  return Math.round(numEsercizi * base * molt);
}

const MATERIE_COMUNI = [
  "Matematica", "Italiano", "Storia", "Geografia", "Inglese",
  "Scienze", "Latino", "Greco", "Fisica", "Chimica", "Arte", "Musica"
];

// Riga singola: numero esercizio + pagina opzionale
function RigaEsercizio({ riga, onChange, onRemove, showRemove }) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        className="h-9 w-24 text-sm"
        placeholder="Es: 67"
        value={riga.numero}
        onChange={e => onChange({ ...riga, numero: e.target.value })}
      />
      <span className="text-xs text-muted-foreground">a pag.</span>
      <Input
        type="text"
        className="h-9 w-20 text-sm"
        placeholder="140"
        value={riga.pagina}
        onChange={e => onChange({ ...riga, pagina: e.target.value })}
      />
      {showRemove && (
        <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function AggiungiCompitoForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    materia: "",
    tipo: "esercizi",
    descrizione: "",
    difficolta: "media",
    minuti_stimati: "",
  });
  const [esercizi, setEsercizi] = useState([{ numero: "", pagina: "" }]);

  const [minutiAuto, setMinutiAuto] = useState(null); // minuti calcolati automaticamente

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const aggiungiRiga = () => setEsercizi(prev => [...prev, { numero: "", pagina: "" }]);
  const rimuoviRiga = (i) => setEsercizi(prev => prev.filter((_, idx) => idx !== i));
  const aggiornaRiga = (i, val) => setEsercizi(prev => prev.map((r, idx) => idx === i ? val : r));

  // Ricalcola stima automatica ogni volta che cambiano esercizi, tipo o difficoltà
  useEffect(() => {
    const numEsercizi = esercizi.filter(r => r.numero.trim()).length;
    if (numEsercizi > 0) {
      const stima = calcolaMinutiAuto(form.tipo, form.difficolta, numEsercizi);
      setMinutiAuto(stima);
      // Aggiorna il campo solo se l'utente non ha inserito manualmente un valore
      setForm(prev => prev.minuti_stimati === "" ? { ...prev, minuti_stimati: String(stima) } : prev);
    } else {
      setMinutiAuto(null);
    }
  }, [esercizi, form.tipo, form.difficolta]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.materia) return;

    // Costruisce la descrizione dagli esercizi inseriti
    const righeValide = esercizi.filter(r => r.numero.trim());
    let descrizioneEsercizi = "";
    if (righeValide.length > 0) {
      // Raggruppa per pagina
      const perPagina = {};
      const senzaPagina = [];
      righeValide.forEach(r => {
        if (r.pagina.trim()) {
          if (!perPagina[r.pagina]) perPagina[r.pagina] = [];
          perPagina[r.pagina].push(r.numero.trim());
        } else {
          senzaPagina.push(r.numero.trim());
        }
      });
      const parti = [];
      if (senzaPagina.length > 0) parti.push(`Es. ${senzaPagina.join(", ")}`);
      Object.entries(perPagina).forEach(([pag, numeri]) => {
        parti.push(`Es. ${numeri.join(", ")} a pag. ${pag}`);
      });
      descrizioneEsercizi = parti.join(" · ");
    }

    onSave({
      ...form,
      descrizione: descrizioneEsercizi || form.descrizione || undefined,
      quantita: righeValide.length > 0 ? righeValide.length : undefined,
      unita_misura: "esercizi",
      minuti_stimati: form.minuti_stimati ? Number(form.minuti_stimati) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Aggiungi compito</h3>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Materia */}
        <div className="space-y-1.5">
          <Label className="text-xs">Materia *</Label>
          <Select value={form.materia} onValueChange={v => set("materia", v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              {MATERIE_COMUNI.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
              <SelectItem value="__altra__">Altra materia...</SelectItem>
            </SelectContent>
          </Select>
          {form.materia === "__altra__" && (
            <Input
              className="h-9 mt-1"
              placeholder="Nome materia"
              onChange={e => set("materia", e.target.value)}
            />
          )}
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={form.tipo} onValueChange={v => set("tipo", v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["esercizi","studio","lettura","tema","versione","problemi","ripasso","altro"].map(t => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Esercizi con numero pagina */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-foreground">Esercizi da fare</Label>
        <div className="space-y-2">
          {esercizi.map((riga, i) => (
            <RigaEsercizio
              key={i}
              riga={riga}
              onChange={val => aggiornaRiga(i, val)}
              onRemove={() => rimuoviRiga(i)}
              showRemove={esercizi.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={aggiungiRiga}
          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
        >
          <Plus className="w-3 h-3" /> Aggiungi esercizio
        </button>
        <p className="text-xs text-muted-foreground">
          Esempio: Es. 67 a pag. 140 · Es. 90 a pag. 123
        </p>
      </div>

      {/* Difficoltà */}
      <div className="space-y-1.5">
        <Label className="text-xs">Difficoltà</Label>
        <div className="flex gap-2">
          {["facile","media","difficile"].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => set("difficolta", d)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                form.difficolta === d
                  ? d === "facile" ? "bg-green-100 text-green-700 border-green-300"
                    : d === "media" ? "bg-amber-100 text-amber-700 border-amber-300"
                    : "bg-red-100 text-red-700 border-red-300"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Minuti */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Minuti stimati</Label>
          {minutiAuto && (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Wand2 className="w-3 h-3" />
              calcolati automaticamente
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="5"
            className="h-9 w-36"
            placeholder="es: 60"
            value={form.minuti_stimati}
            onChange={e => {
              setMinutiAuto(null); // L'utente ha sovrascritto manualmente
              set("minuti_stimati", e.target.value);
            }}
          />
          {minutiAuto && form.minuti_stimati !== String(minutiAuto) && (
            <button
              type="button"
              onClick={() => { set("minuti_stimati", String(minutiAuto)); setMinutiAuto(minutiAuto); }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" /> Usa stima ({minutiAuto}min)
            </button>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!form.materia || form.materia === "__altra__"}>
        <Plus className="w-4 h-4 mr-1.5" />
        Aggiungi compito
      </Button>
    </form>
  );
}
