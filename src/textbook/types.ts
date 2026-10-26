export type PartId = "cad2d" | "cad3d" | "basics" | "drafting" | "mechanics" | "elements" | "mechatronics" | "knowhow" | "design" | "ux" | "service" | "equipment";

export interface Quiz {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
}

/** Worked calculation problem: question and the solution revealed on demand (HTML). */
export interface Exercise {
  q: string;
  a: string;
}

export interface TextChapter {
  id: string;
  part: PartId;
  title: string;
  minutes: number;
  level: 1 | 2 | 3;
  /** One-paragraph introduction (plain text). */
  lead: string;
  /** Body HTML. `<div data-widget="name"></div>` mounts an interactive calculator. */
  body: string;
  /** Key points shown in the summary box. */
  points: string[];
  exercises: Exercise[];
  quiz: Quiz[];
  /** Related 3DCAD Studio lessons (ids of the in-app course). */
  lessons?: string[];
}

export interface Part {
  id: PartId;
  title: string;
  desc: string;
  color: string;
}
