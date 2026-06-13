import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";
import { slugifyStr } from "./slugify";

export type SeriesInfo = {
  slug: string;
  name: string;
  count: number;
};

/** Returns all unique series with their display name and post count. */
export function getUniqueSeries(
  posts: CollectionEntry<"posts">[]
): SeriesInfo[] {
  const map = new Map<string, { name: string; count: number }>();

  posts.filter(postFilter).forEach(post => {
    const { series } = post.data;
    if (!series) return;
    const slug = slugifyStr(series);
    const existing = map.get(slug);
    if (existing) {
      existing.count++;
    } else {
      map.set(slug, { name: series, count: 1 });
    }
  });

  return Array.from(map.entries())
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Returns all posts in a given series, sorted by seriesPart ascending. */
export function getSeriesPosts(
  posts: CollectionEntry<"posts">[],
  seriesSlug: string
): CollectionEntry<"posts">[] {
  return posts
    .filter(postFilter)
    .filter(post => {
      const { series } = post.data;
      return series && slugifyStr(series) === seriesSlug;
    })
    .sort((a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0));
}
