import type { Experiment } from "./types.ts";
import { contentDiscovery } from "./content-discovery/index.ts";

export const experiments: Experiment[] = [contentDiscovery];
