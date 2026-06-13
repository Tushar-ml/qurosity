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

export type AdjacentPostRef = {
  id: string;
  title: string;
  filePath: string | undefined;
};

function toAdjacentRef(
  post: CollectionEntry<"posts">
): AdjacentPostRef {
  return {
    id: post.id,
    title: post.data.title,
    filePath: post.filePath,
  };
}

/**
 * Previous/next post for navigation.
 * Series posts: ordered by seriesPart (prev = earlier part, next = later part).
 * Other posts: ordered by publish date descending (blog archive order).
 */
export function getAdjacentPosts(
  post: CollectionEntry<"posts">,
  sortedPosts: CollectionEntry<"posts">[],
  allPosts: CollectionEntry<"posts">[]
): { prevPost: AdjacentPostRef | null; nextPost: AdjacentPostRef | null } {
  const { series, seriesPart } = post.data;

  if (series && seriesPart) {
    const seriesPosts = getSeriesPosts(allPosts, slugifyStr(series));
    const index = seriesPosts.findIndex(p => p.id === post.id);

    if (index !== -1) {
      return {
        prevPost:
          index > 0 ? toAdjacentRef(seriesPosts[index - 1]!) : null,
        nextPost:
          index < seriesPosts.length - 1
            ? toAdjacentRef(seriesPosts[index + 1]!)
            : null,
      };
    }
  }

  const index = sortedPosts.findIndex(p => p.id === post.id);

  return {
    prevPost: index > 0 ? toAdjacentRef(sortedPosts[index - 1]!) : null,
    nextPost:
      index < sortedPosts.length - 1
        ? toAdjacentRef(sortedPosts[index + 1]!)
        : null,
  };
}
