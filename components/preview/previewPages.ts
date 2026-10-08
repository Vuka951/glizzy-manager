export type PreviewPage = {
  href: string;
  title: string;
  note: string;
};

export const previewPages: PreviewPage[] = [
  {
    href: "/preview/animations",
    title: "Pregled animacija",
    note: "Sve animacije i retka stanja igre na klik, bez igranja.",
  },
  {
    href: "/preview/broadcast",
    title: "Pregled prenosa",
    note: "Komentator, tale of the tape i studio uvod po fazama otključavanja.",
  },
  {
    href: "/preview/election",
    title: "Pregled izbora",
    note: "Izborna noć, skupština i anketa na klik.",
  },
  {
    href: "/preview/match-stats",
    title: "Statistika na stolu",
    note: "Traka sa veštinama i upozorenjima ispod imena, po nivou doušnika.",
  },
  {
    href: "/preview/season-backdrop",
    title: "Pregled godišnjih doba",
    note: "Žive pozadine, atmosfersko svetlo i sezonski detalji.",
  },
  {
    href: "/preview/achievement-toast",
    title: "Trofej toast",
    note: "Svaki trofej na klik, bez otključavanja.",
  },
];
