import { create } from "zustand";

export type TransitionState =
  | "idle"
  | "capturing"
  | "forward"
  | "backward";

type Rect = { top: number; left: number; width: number; height: number };

type TransitionStore = {
  state: TransitionState;

  from: {
    id: string;
    image: string;
    rect: Rect;
  } | null;

  to: {
    rect: Rect;
  } | null;

  progress: number;

  start: (payload: TransitionStore["from"]) => void;
  setTo: (rect: Rect) => void;
  updateProgress: (p: number) => void;
  reset: () => void;
};

export const useTransitionStore = create<TransitionStore>((set) => ({
  state: "idle",
  from: null,
  to: null,
  progress: 0,

  start: (from) =>
    set({ state: "forward", from, progress: 0 }),

  setTo: (rect) =>
    set({ to: { rect } }),

  updateProgress: (progress) =>
    set({ progress }),

  reset: () =>
    set({ state: "idle", from: null, to: null, progress: 0 }),
}));
