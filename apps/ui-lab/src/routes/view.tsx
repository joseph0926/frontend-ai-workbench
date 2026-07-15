import { useParams } from "react-router-dom";
import { experiments } from "../experiments/registry.ts";

export default function View() {
  const { slug, cand, state } = useParams();
  const experiment = experiments.find((e) => e.slug === slug);
  const candidate = experiment?.candidates.find((c) => c.id === cand);

  if (!experiment || !candidate || !state || !experiment.states.includes(state)) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        없는 후보/상태입니다: {slug}/{cand}/{state}
      </div>
    );
  }

  const Component = candidate.Component;
  return <Component state={state} />;
}
