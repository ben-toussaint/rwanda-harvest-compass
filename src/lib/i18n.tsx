import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "rw" | "fr";
// Kinyarwanda and French strings need native-speaker review before field use.
const T = {
  nav_visit: { en: "New farmer visit", rw: "Gusura umuhinzi mushya", fr: "Nouvelle visite" },
  nav_farmers: { en: "My farmers", rw: "Abahinzi banjye", fr: "Mes agriculteurs" },
  nav_planner: { en: "Planner", rw: "Igenamigambi", fr: "Planification" },
  nav_feedback: { en: "Harvest results", rw: "Umusaruro wabonetse", fr: "Récoltes" },
  nav_admin: { en: "Data import", rw: "Kwinjiza amakuru", fr: "Import de données" },
  nav_method: { en: "Methodology", rw: "Uburyo bukoreshwa", fr: "Méthodologie" },
  demo_banner: {
    en: "Demo data – not official statistics. Real NISR and RwaSIS data will replace it after import.",
    rw: "Amakuru y'igerageza – si imibare yemewe. Azasimburwa n'aya NISR na RwaSIS.",
    fr: "Données de démonstration – pas des statistiques officielles.",
  },
  try_sample: { en: "Try the sample: Musanze, 1 ha maize, 5 t/ha", rw: "Gerageza urugero: Musanze, ha 1 y'ibigori, t 5/ha", fr: "Essayer l'exemple : Musanze, 1 ha de maïs, 5 t/ha" },
  expected: { en: "Expected yield range", rw: "Umusaruro uteganijwe", fr: "Rendement attendu" },
  attainable: { en: "Empirical attainable yield", rw: "Umusaruro ushoboka wagaragaye", fr: "Rendement atteignable observé" },
} as const;
export type TKey = keyof typeof T;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string }>({
  lang: "en", setLang: () => {}, t: (k) => T[k].en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangS] = useState<Lang>("en");
  useEffect(() => { const l = localStorage.getItem("dss.lang") as Lang | null; if (l) setLangS(l); }, []);
  const setLang = (l: Lang) => { localStorage.setItem("dss.lang", l); setLangS(l); };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => T[k][lang] }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
