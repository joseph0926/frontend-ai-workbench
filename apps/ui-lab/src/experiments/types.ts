import type { ComponentType } from "react";

export interface CandidateProps {
  state: string;
}

export interface CandidateMeta {
  id: string;
  label: string;
  Component: ComponentType<CandidateProps>;
}

export interface Experiment {
  slug: string;
  title: string;
  anchor: string;
  states: string[];
  candidates: CandidateMeta[];
}
