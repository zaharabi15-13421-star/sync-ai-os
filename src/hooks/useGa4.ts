import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getGa4AuthUrl,
  getGa4Analytics,
  getGa4Status,
  listGa4Properties,
  refreshGa4Recommendations,
  selectGa4Property,
  syncGa4,
  disconnectGa4,
} from "@/lib/ga.functions";

export function useGa4Status(enabled = true) {
  const fn = useServerFn(getGa4Status);
  return useQuery({
    queryKey: ["ga4", "status"],
    queryFn: () => fn(),
    enabled,
    staleTime: 30_000,
  });
}

export function useGa4Analytics(enabled = true) {
  const fn = useServerFn(getGa4Analytics);
  return useQuery({
    queryKey: ["ga4", "analytics"],
    queryFn: () => fn({ data: {} }),
    enabled,
    staleTime: 60_000,
  });
}

export function useGa4AuthUrl() {
  const fn = useServerFn(getGa4AuthUrl);
  return useMutation({
    mutationFn: (args?: { returnTo?: string; source?: "brand_dna" | "brand_intelligence" | "manual"; websiteUrl?: string }) =>
      fn({ data: { returnTo: args?.returnTo, source: args?.source, websiteUrl: args?.websiteUrl } }),
  });
}

export function useGa4ListProperties() {
  const qc = useQueryClient();
  const fn = useServerFn(listGa4Properties);
  return useMutation({
    mutationFn: (args?: { websiteUrl?: string }) => fn({ data: { websiteUrl: args?.websiteUrl } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ga4"] }),
  });
}

export function useGa4SelectProperty() {
  const qc = useQueryClient();
  const fn = useServerFn(selectGa4Property);
  return useMutation({
    mutationFn: (propertyId: string) => fn({ data: { propertyId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ga4"] }),
  });
}

export function useGa4Sync() {
  const qc = useQueryClient();
  const fn = useServerFn(syncGa4);
  return useMutation({
    mutationFn: (periodDays?: number) => fn({ data: { periodDays: periodDays ?? 90 } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ga4"] }),
  });
}

export function useGa4Disconnect() {
  const qc = useQueryClient();
  const fn = useServerFn(disconnectGa4);
  return useMutation({
    mutationFn: () => fn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ga4"] }),
  });
}

export function useGa4RefreshRecommendations() {
  const qc = useQueryClient();
  const fn = useServerFn(refreshGa4Recommendations);
  return useMutation({
    mutationFn: () => fn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ga4"] }),
  });
}
