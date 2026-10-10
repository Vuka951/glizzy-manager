export type PreviewPage = {
  href: string;
  title: string;
  note: string;
};

export const previewPages: PreviewPage[] = [
  {
    href: "/preview/animations",
    title: "Animations preview",
    note: "Every animation and rare game state on a click, without playing.",
  },
  {
    href: "/preview/broadcast",
    title: "Broadcast preview",
    note: "The commentator, the tale of the tape and the studio intro by unlock stage.",
  },
  {
    href: "/preview/election",
    title: "Election preview",
    note: "Election night, the assembly and the poll on a click.",
  },
  {
    href: "/preview/match-stats",
    title: "Stats at the table",
    note: "The skills and warnings strip under the name, by informant level.",
  },
  {
    href: "/preview/season-backdrop",
    title: "Seasons preview",
    note: "Living backdrops, atmospheric light and seasonal details.",
  },
  {
    href: "/preview/achievement-toast",
    title: "Achievement toast",
    note: "Every achievement on a click, without unlocking it.",
  },
];
