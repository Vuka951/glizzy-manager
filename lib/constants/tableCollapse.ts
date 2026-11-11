// A man eats himself out of the match at the long table: three bites, then
// his cholesterol bursts and a stretcher crew carries him off, or he throws
// up and slides under the table. Every scene that stages it and its sound
// cues share these marks. The first bite waits for the bumper to clear
export type TableCollapse = 'cholesterol' | 'puke';

export const tableCollapseBeats = {
  bites: [1050, 1400, 1750],
  burst: 2300,
  faceplant: 2550,
  crewIn: 2700,
  crewSet: 3100,
  lift: 3250,
  carry: 3450,
  gone: 4100,
  heave: 2200,
  spray: 2300,
  slide: 2950,
  underTable: 3250,
};
