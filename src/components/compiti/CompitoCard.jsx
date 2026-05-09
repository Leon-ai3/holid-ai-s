import { Trash2, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MateriaIcon from "./MateriaIcon";

const DIFFICOLTA_BADGE = {
  facile: "bg-green-100 text-green-700 border-green-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  difficile: "bg-red-100 text-red-700 border-red-200",
};

export default function CompitoCard({ compito, onDelete }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-sm transition-shadow group">
      <MateriaIcon materia={compito.materia} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">{compito.materia}</span>
          <span className="text-xs text-muted-foreground capitalize">{compito.tipo}</span>
        </div>
        {compito.descrizione && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{compito.descrizione}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {compito.quantita && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              {compito.quantita} {compito.unita_misura}
            </span>
          )}
          {compito.minuti_stimati && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {compito.minuti_stimati} min
            </span>
          )}
          {compito.difficolta && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFFICOLTA_BADGE[compito.difficolta]}`}>
              {compito.difficolta}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(compito.id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
