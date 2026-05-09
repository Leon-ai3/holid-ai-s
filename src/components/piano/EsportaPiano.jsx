import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Calendar, FileText, X, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import jsPDF from "jspdf";

function generaICS(piano) {
  const linee = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Planner Vacanze IA//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  (piano.piano_generato || []).forEach((giorno) => {
    (giorno.compiti || []).forEach((c, i) => {
      const dataStr = giorno.data.replace(/-/g, "");
      const uid = `${dataStr}-${i}-pianovacanze@app`;
      const summary = `${c.materia} — ${c.tipo}`;
      const desc = c.descrizione ? c.descrizione.replace(/,/g, "\\,") : "";
      const durMinuti = c.minuti || 30;

      linee.push("BEGIN:VEVENT");
      linee.push(`UID:${uid}`);
      linee.push(`DTSTART;VALUE=DATE:${dataStr}`);
      linee.push(`DTEND;VALUE=DATE:${dataStr}`);
      linee.push(`SUMMARY:📚 ${summary}`);
      if (desc) linee.push(`DESCRIPTION:${desc} (${durMinuti}min)`);
      linee.push("END:VEVENT");
    });
  });

  linee.push("END:VCALENDAR");
  return linee.join("\r\n");
}

function generaPDF(piano) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const marginX = 15;
  let y = 20;

  // Titolo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(piano.nome || "Piano Vacanze", marginX, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Dal ${piano.data_inizio} al ${piano.data_fine}  •  ${piano.ore_studio_giorno || 2}h/giorno`, marginX, y);
  y += 10;

  doc.setDrawColor(220);
  doc.line(marginX, y, 195, y);
  y += 6;

  (piano.piano_generato || []).forEach((giorno) => {
    // Controlla spazio pagina
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const dataFormattata = format(parseISO(giorno.data), "EEEE d MMMM yyyy", { locale: it });

    // Header giorno
    doc.setFillColor(245, 240, 255);
    doc.roundedRect(marginX, y - 4, 180, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 40, 140);
    const totMin = (giorno.compiti || []).reduce((s, c) => s + (c.minuti || 0), 0);
    doc.text(
      `${dataFormattata.charAt(0).toUpperCase() + dataFormattata.slice(1)}${totMin ? `  (${Math.round(totMin / 60 * 10) / 10}h)` : ""}`,
      marginX + 3,
      y + 1
    );
    y += 10;

    // Compiti
    (giorno.compiti || []).forEach((c) => {
      if (y > 275) { doc.addPage(); y = 20; }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30);
      doc.text(`• ${c.materia}`, marginX + 3, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      const dettaglio = [c.tipo, c.descrizione, c.minuti ? `${c.minuti}min` : null].filter(Boolean).join("  |  ");
      doc.text(dettaglio, marginX + 22, y);
      y += 6;
    });

    y += 3;
  });

  doc.save(`piano-vacanze-${piano.nome || "studio"}.pdf`);
}

export default function EsportaPiano({ piano, onClose }) {
  const [loading, setLoading] = useState(null);

  const handlePDF = async () => {
    setLoading("pdf");
    setTimeout(() => {
      generaPDF(piano);
      setLoading(null);
    }, 100);
  };

  const handleICS = () => {
    setLoading("ics");
    const contenuto = generaICS(piano);
    const blob = new Blob([contenuto], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `piano-vacanze-${piano.nome || "studio"}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Esporta piano</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Scegli il formato di esportazione per avere il tuo piano sempre con te.
          </p>

          {/* PDF */}
          <button
            onClick={handlePDF}
            disabled={!!loading}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">Esporta in PDF</p>
              <p className="text-xs text-muted-foreground">Documento stampabile con tutti i giorni e compiti</p>
            </div>
            {loading === "pdf" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </button>

          {/* ICS */}
          <button
            onClick={handleICS}
            disabled={!!loading}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">Aggiungi al calendario</p>
              <p className="text-xs text-muted-foreground">File .ics compatibile con Google Calendar, Apple Calendar, Outlook</p>
            </div>
            {loading === "ics" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
}
