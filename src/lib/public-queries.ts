import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getDestinationBySlug, getSiteSettings, listActiveDestinations } from "./public-data.functions";

export const siteSettingsQuery = queryOptions({
  queryKey: ["public", "site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 60_000,
});

export const activeDestinationsQuery = queryOptions({
  queryKey: ["public", "destinations"],
  queryFn: () => listActiveDestinations(),
  staleTime: 30_000,
});

export const destinationBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public", "destination", slug],
    queryFn: () => getDestinationBySlug({ data: { slug } }),
    staleTime: 30_000,
  });

export function useSiteSettings() {
  return useSuspenseQuery(siteSettingsQuery).data;
}
