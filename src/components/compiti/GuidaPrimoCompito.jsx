import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ListChecks, Sparkles, ArrowRight, X } from "lucide-react";

const PASSI = [
  {
    icona: "📚",
    titolo: "Benvenuto nel Planner Vacanze!",
    descrizione: "Questa guida ti aiuterà ad aggiungere il tuo primo compito in pochi secondi. Potrai poi generare un piano personalizzato con l'IA.",
    cta: "Iniziamo",
  },
  {
    icona: "✏️",
    titolo: "Scegli la materia",
    descrizione: "Seleziona la materia dal menu a tendina (es. Matematica, Italiano…). Se la tua materia non c'è, scegli 'Altra materia' e scrivila tu.",
    highlight: "materia",
    cta: "Avanti",
  },
  {
    icona: "🔢",
    titolo: "Inserisci gli esercizi",
    descrizione: "Per ogni esercizio scrivi il numero (es. 67) e la pagina del libro (es. 140). Puoi aggiungere più esercizi cliccando '+ Aggiungi esercizio'.",
    highlight: "esercizi",
    cta: "Avanti",
  },
  {
    icona: "⚡",
    titolo: "Indica la difficoltà",
    descrizione: "Scegli se il compito è facile, medio o difficile. L'IA userà questa info per distribuire il carico nei giorni giusti.",
    highlight: "difficolta",
    cta: "Avanti",
  },
  {
    icona: "🎉",
    titolo: "Salva e continua!",
    descrizione: "Clicca 'Aggiungi compito' in fondo al form. Dopo aver aggiunto almeno 2 compiti potrai generare il tuo piano vacanze con l'IA.",
    cta: "Ho capito, aggiungo il primo compito!",
    ultimo: true,
  },
];

export default function GuidaPrimoCompito({ onFine }) {
  const [passo, setPasso] = useState(0);
  const corrente = PASSI[passo];

  const avanti = () => {
    if (corrente.ultimo) {
      onFine();
    } else {
      setPasso(p => p + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onFine}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-5">
          {PASSI.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= passo ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Contenuto */}
        <div className="text-center space-y-3">
          <div className="text-4xl">{corrente.icona}</div>
          <h3 className="font-display font-semibold text-lg text-foreground leading-snug">
            {corrente.titolo}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {corrente.descrizione}
          </p>
        </div>

        {/* CTA */}
        <Button className="w-full mt-6 gap-2" onClick={avanti}>
          {corrente.cta}
          {!corrente.ultimo && <ArrowRight className="w-4 h-4" />}
        </Button>

        {/* Skip */}
        {!corrente.ultimo && (
          <button
            className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            onClick={onFine}
          >
            Salta la guida
          </button>
        )}
      </div>
    </div>
  );
}
