// שמירת כל מצב האשף ב-Zustand + פרסיסט ללוקאל סטורג’
// הערות בעברית: מסבירות כל פעולה ומה היא עושה

import { create } from "zustand";
import { persist } from "zustand/middleware";

// --------- טיפוסים ----------

// שלב 1
export type Step1Data = {
  title: string;
  problem: string;
  audience: string;
  tags: string[];
};

// שלב 2 – פריטים שנאספו (קישורים/תובנות/קבצים)
// כאן נשמור רק טקסט/קישור. קבצים אמיתיים דורשים שרת – אפשר להוסיף בהמשך.
export type ResourceItem = {
  id: string;
  type: "link" | "note";
  title: string;
  url?: string;
  done?: boolean;
  createdAt: number;
};

// שלב 3 – רעיונות
export type Idea = {
  id: string;
  text: string;
  color: "yellow" | "blue" | "green" | "pink";
  votes: number;
  createdAt: number;
};

type WizardState = {
  // שלב 1
  step1: Step1Data;
  setStep1: (patch: Partial<Step1Data>) => void;

  // שלב 2
  resources: ResourceItem[];
  addResource: (
    item: Omit<ResourceItem, "id" | "createdAt"> & { title: string }
  ) => void;
  toggleResourceDone: (id: string) => void;
  removeResource: (id: string) => void;

  // שלב 3
  ideas: Idea[];
  addIdea: (text: string, color?: Idea["color"]) => void;
  voteIdea: (id: string, delta: 1 | -1) => void;
  removeIdea: (id: string) => void;
};

export const useWizard = create<WizardState>()(
  persist(
    (set, get) => ({
      // --- מצב התחלתי ---
      step1: { title: "", problem: "", audience: "", tags: [] },

      resources: [],

      ideas: [],

      // --- פעולות שלב 1 ---
      setStep1: (patch) => set((s) => ({ step1: { ...s.step1, ...patch } })),

      // --- פעולות שלב 2 ---
      addResource: (item) =>
        set((s) => ({
          resources: [
            {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              done: false,
              ...item,
            },
            ...s.resources,
          ],
        })),
      toggleResourceDone: (id) =>
        set((s) => ({
          resources: s.resources.map((r) =>
            r.id === id ? { ...r, done: !r.done } : r
          ),
        })),
      removeResource: (id) =>
        set((s) => ({
          resources: s.resources.filter((r) => r.id !== id),
        })),

      // --- פעולות שלב 3 ---
      addIdea: (text, color = "yellow") =>
        set((s) => ({
          ideas: [
            {
              id: crypto.randomUUID(),
              text,
              color,
              votes: 0,
              createdAt: Date.now(),
            },
            ...s.ideas,
          ],
        })),
      voteIdea: (id, delta) =>
        set((s) => ({
          ideas: s.ideas.map((i) =>
            i.id === id ? { ...i, votes: Math.max(0, i.votes + delta) } : i
          ),
        })),
      removeIdea: (id) =>
        set((s) => ({
          ideas: s.ideas.filter((i) => i.id !== id),
        })),
    }),
    {
      name: "innovation-wizard", // מפתח בלוקאל סטורג’
      version: 1,
    }
  )
);
