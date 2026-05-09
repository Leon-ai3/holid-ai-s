import { useState } from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Clock, CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import MateriaIcon from "@/components/compiti/MateriaIcon";

export default function GiornoCard({ giorno, tuttiGiorni, onToggleCompito, onSpostaCompito }) {
  const [open, setOpen] = useState(true);
  const data = parseISO(giorno.data);
  const totaleMinuti = giorno.compiti?.reduce((acc, c) => acc + (c.minuti || 0), 0) || 0;
  const completati = giorno.compiti?.filter(c => c.completato).length || 0;
  const totale = giorno.compiti?.length || 0;
  const tuttiCompletati = completati === totale && totale > 0;

  const handleNonRiesco = (e, index) => {
    e.stopPropagation();
    // Trova il prossimo giorno nel piano con data successiva a questo
    const giornoIdx = (tuttiGiorni || []).findIndex(g => g.data === giorno.data);
    const prossimoGiorno = (tuttiGiorni || []).find((g, i) => i > giornoIdx);
    if (prossimoGiorno) {
      onSpostaCompito(giorno.data, index, prossimoGiorno.data);
    }
  };

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden transition-all ${tuttiCompletati ? "border-accent/50 bg-accent/5" : "border-border"}`}>
      {/* Header giorno */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold leading-tight ${tuttiCompletati ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
            <span>{format(data, "d")}</span>
            <span className="uppercase text-[9px] opacity-70">{format(data, "MMM", { locale: it })}</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground capitalize">
              {format(data, "EEEE d MMMM", { locale: it })}
            </p>
            <p className="text-xs text-muted-foreground">
              {totale} compiti · {totaleMinuti > 0 ? `${Math.round(totaleMinuti / 60 * 10) / 10}h` : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tuttiCompletati && (
            <span className="text-xs font-medium text-accent">✓ Completato</span>
          )}
          <span className="text-xs text-muted-foreground">{completati}/{totale}</span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted mx-5">
        <div
          className="h-full bg-accent transition-all rounded-full"
          style={{ width: totale > 0 ? `${(completati / totale) * 100}%` : "0%" }}
        />
      </div>

      {/* Lista compiti */}
      {open && (
        <div className="px-5 py-3 space-y-2">
          {giorno.compiti?.map((c, i) => (
            <div key={i} className="group flex items-center gap-2">
              <button
                className="flex-1 flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                onClick={() => onToggleCompito(giorno.data, i)}
              >
                {c.completato
                  ? <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                }
                <MateriaIcon materia={c.materia} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${c.completato ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {c.materia} — <span className="capitalize font-normal">{c.tipo}</span>
                  </p>
                  {c.descrizione && (
                    <p className="text-xs text-muted-foreground truncate">{c.descrizione}</p>
                  )}
                  {c.quantita_giorno && (
                    <p className="text-xs text-muted-foreground">{c.quantita_giorno} {c.unita_misura}</p>
                  )}
                </div>
                {c.minuti && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {c.minuti}m
                  </span>
                )}
              </button>

              {/* Bottone "Non riesco" - visibile solo se non completato */}
              {!c.completato && (
                <button
                  title="Non riesco oggi — sposta al giorno dopo"
                  onClick={(e) => handleNonRiesco(e, i)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2 py-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Non riesco</span>
                </button>
              )}
            </div>
          ))}
          {(!giorno.compiti || giorno.compiti.length === 0) && (
            <p className="text-sm text-muted-foreground py-2 text-center">Giorno libero 🎉</p>
          )}
        </div>
      )}
    </div>
  );
}
