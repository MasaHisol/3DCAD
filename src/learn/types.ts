import type { AssemblyDocument } from "../assembly/types";
import type { PartDocument } from "../core/types";

/**
 * Snapshot of the application state the lessons check against. Built from the
 * running app by the tutor (polling), or by hand in unit tests, so every step
 * check is a pure function of plain data.
 */
export interface LearnState {
  env: "part" | "assembly" | "drawing";
  mode: "model" | "sketch";
  /** Which document the open drawing belongs to. */
  drawingSource?: "part" | "assembly";
  /** Running assembly command (constraint, drive, explode …). */
  asmCommand?: string | null;
  /** Assembly shown exploded. */
  exploded?: boolean;
  /** Kind of the open structural / thermal analysis. */
  analysisKind?: string;
  part: PartDocument;
  asm: AssemblyDocument;
  /** Evaluated part parameters (name -> value). */
  values: Map<string, number>;
  /** Id of the running feature / analysis command (null when idle). */
  command: string | null;
  /** Active sketch editor (sketch mode only). */
  sketch: { id: string; tool: string; dof: number; ok: boolean } | null;
  /** Solid bodies of the part. */
  bodies: number;
  /** Features that failed to rebuild. */
  errors: number;
  style: string;
  section: boolean;
  realistic: boolean;
  /** A structural / modal / thermal analysis produced a result in the running analysis command. */
  analysisDone: boolean;
}

/** How the document is prepared when a lesson starts. */
export type LessonSetup =
  | { kind: "keep" }
  | { kind: "newPart" }
  | { kind: "part"; make: () => PartDocument }
  | { kind: "assembly"; make: () => AssemblyDocument };

export interface LessonStep {
  /** Instruction (HTML allowed: <b>, <kbd>, <i>). */
  text: string;
  /** Extra help shown on demand. */
  hint?: string;
  /** Ribbon tab to bring forward and command (data-cmd) to highlight. */
  tab?: string;
  ui?: string | string[];
  /** Completed automatically when this returns true; omitted = the learner presses 「次へ」. */
  check?: (s: LearnState) => boolean;
}

export interface QuizItem {
  q: string;
  choices: string[];
  /** Index of the correct choice. */
  answer: number;
  explain: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Minutes. */
  minutes: number;
  level: 1 | 2 | 3;
  /** What the learner will be able to do. */
  goals: string[];
  /** Concept explanation (HTML) shown before the hands-on steps. */
  theory: string;
  setup: LessonSetup;
  steps: LessonStep[];
  /** Key points shown on completion. */
  summary: string[];
  quiz: QuizItem[];
  /** Related chapters of the textbook (座学テキスト). */
  see?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  desc: string;
  lessons: Lesson[];
}

export interface GlossaryEntry {
  term: string;
  reading?: string;
  en?: string;
  desc: string;
}

/** Requirement of a free design exercise (checked live, not step by step). */
export interface Requirement {
  text: string;
  check: (s: LearnState) => boolean;
}

export interface Exercise {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  brief: string;
  /** Specification shown as a drawing-like table. */
  spec: [string, string][];
  requirements: Requirement[];
  tips: string[];
}
