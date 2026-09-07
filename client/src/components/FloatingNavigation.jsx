import { Plus, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingNavigation() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const actions = [["/profile", "Perfil", UserRound], ["/kairos", "Kairos", Sparkles], ["/create", "Crear", Plus]];

  return <div className={`k-floating-navigation ${open ? "is-open" : ""}`}>
    {open && actions.map(([to, label, Icon]) => <button key={to} type="button" aria-label={label} onClick={() => { setOpen(false); navigate(to); }}><Icon size={18} /></button>)}
    <button type="button" className="k-floating-toggle" aria-label={open ? "Cerrar accesos rápidos" : "Abrir accesos rápidos"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Plus size={21} />}</button>
  </div>;
}
