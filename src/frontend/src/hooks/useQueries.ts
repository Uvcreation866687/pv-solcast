import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SystemConfig as BackendSystemConfig } from "../backend.d";
import type { SystemConfig } from "../types";
import { useActor } from "./useActor";

// Convert frontend SystemConfig to backend format
function toBackendConfig(config: SystemConfig): BackendSystemConfig {
  return {
    ...config,
    arrays: config.arrays.map((a) => ({
      ...a,
      panelCount: BigInt(a.panelCount),
      panelWattage: BigInt(a.panelWattage),
    })),
  };
}

// Convert backend SystemConfig to frontend format
function fromBackendConfig(config: BackendSystemConfig): SystemConfig {
  return {
    ...config,
    unitPreference: config.unitPreference as "metric" | "imperial",
    arrays: config.arrays.map((a) => ({
      ...a,
      panelCount: Number(a.panelCount),
      panelWattage: Number(a.panelWattage),
    })),
  };
}

export function useSystemConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<SystemConfig | null>({
    queryKey: ["systemConfig"],
    queryFn: async () => {
      if (!actor) return null;
      const config = await actor.getSystemConfig();
      if (!config) return null;
      return fromBackendConfig(config);
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveSystemConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: SystemConfig) => {
      if (!actor) throw new Error("No actor available");
      const backendConfig = toBackendConfig(config);
      await actor.saveSystemConfig(backendConfig);
    },
    onSuccess: (_, config) => {
      queryClient.setQueryData(["systemConfig"], config);
    },
  });
}

export function usePresets() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["presets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPresets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavePreset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      config,
    }: { name: string; config: SystemConfig }) => {
      if (!actor) throw new Error("No actor available");
      const backendConfig = toBackendConfig(config);
      await actor.savePreset(name, backendConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });
}

export function usePreferences() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPreferences();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavePreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: {
      preferredTab: string;
      unitSystem: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      await actor.savePreferences(preferences);
    },
    onSuccess: (_, prefs) => {
      queryClient.setQueryData(["preferences"], prefs);
    },
  });
}
