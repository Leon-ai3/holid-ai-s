import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Sparkles, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ESEMPIO = `Matematica: esercizi 12, 14, 18 a pag. 45
Italiano: tema sulla natura (2 ore)
Inglese: studiare vocaboli unità 5 (30 min)
Storia: leggere capitolo 3 pag. 88-102
Latino: versione a pag. 76 (difficile)`;

export default function ImportaCompiti({ onImportati, onClose }) {
  const [testo, setTesto] = useState("");
  const [stato, setStato] = useState("idle"); // idle | loading | preview | done
  const [compitiAnteprima, setCompitiAnteprima] = useState([]);
  const [errore, setErrore] = useState("");

  const analizza = async () => {
    if (!testo.trim()) return;
    setStato("loading");
    setErrore("");

    const risultato = await base44.integrations.Core.InvokeLLM({
      prompt: `Analizza questo elenco di compiti scolastici e restituisci un array JSON di oggetti compito.
Per ogni compito estrai: materia, tipo (scegli tra: esercizi, studio, lettura, tema, versione, problemi, ripasso, altro), 
descrizione breve, difficolta (facile/media/difficile), minuti_stimati (stima ragionevole).
Se ci sono esercizi con numero di pagina, mettili nella descrizione (es. "Es. 12, 14 a pag. 45").

Testo da analizzare:
${testo}

Rispondi SOLO con l'array JSON, senza markdown.`,
      response_json_schema: {
        type: "object",
        properties: {
          compiti: {
            type: "array",
            items: {
              type: "object",
              properties: {
                materia: { type: "string" },
                tipo: { type: "string" },
                descrizione: { type: "string" },
                difficolta: { type: "string" },
                minuti_stimati: { type: "number" },
              },
            },
          },
        },
      },
    });

    if (!risultato?.compiti?.length) {
      setErrore("Non ho trovato compiti nel testo. Prova a riscriverlo in modo più chiaro.");
      setStato("idle");
      return;
    }

    setCompitiAnteprima(risultato.compiti);
    setStato("preview");
  };

  const conferma = async () => {
    setStato("loading");
    await Promise.all(
      compitiAnteprima.map(c =>
        base44.entities.Compito.create({
          materia: c.materia,
          tipo: c.tipo || "altro",
          descrizione: c.descrizione,
          difficolta: c.difficolta || "media",
          minuti_stimati: c.minuti_stimati,
        })
      )
    );
    onImportati();
    onClose();
  };

  const DIFF_COLORS = {
    facile: "bg-green-100 text-green-700",
    media: "bg-amber-100 text-amber-700",
    difficile: "bg-red-100 text-red-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Importa compiti con IA</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {stato !== "preview" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Incolla o scrivi la lista dei tuoi compiti. L'IA li riconoscerà e li aggiungerà automaticamente.
              </p>

              <Textarea
                className="min-h-[160px] text-sm font-mono resize-none"
                placeholder={ESEMPIO}
                value={testo}
                onChange={e => setTesto(e.target.value)}
                disabled={stato === "loading"}
              />

              <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Esempi di formato accettato:</p>
                <p>• "Matematica: es. 12, 14 a pag. 45"</p>
                <p>• "Storia: studiare cap. 3 (facile)"</p>
                <p>• Foto del diario scolastico? Descrivi il contenuto a testo</p>
              </div>

              {errore && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errore}
                </div>
              )}

              <Button
                className="w-full gap-2"
                onClick={analizza}
                disabled={!testo.trim() || stato === "loading"}
              >
                {stato === "loading" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analisi in corso…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analizza con IA</>
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Ho trovato <strong>{compitiAnteprima.length} compiti</strong>. Controlla e conferma l'importazione.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {compitiAnteprima.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/40 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{c.materia}</span>
                        <span className="text-xs text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">{c.tipo}</span>
                        {c.difficolta && (
                          <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${DIFF_COLORS[c.difficolta] || "bg-muted text-muted-foreground"}`}>
                            {c.difficolta}
                          </span>
                        )}
                        {c.minuti_stimati && (
                          <span className="text-xs text-muted-foreground">{c.minuti_stimati}min</span>
                        )}
                      </div>
                      {c.descrizione && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.descrizione}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setStato("idle")}>
                  Modifica testo
                </Button>
                <Button className="flex-1 gap-2" onClick={conferma} disabled={stato === "loading"}>
                  {stato === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvataggio…</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Importa {compitiAnteprima.length} compiti</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
