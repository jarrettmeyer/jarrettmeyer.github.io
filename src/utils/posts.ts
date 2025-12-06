import type { Post } from "@/types";
import { getCollection } from "astro:content";
import { slugifyTag } from "./slugify";

export const filterByCount = (count?: number) => {
  return (_post: Post, index: number) => {
    if (count && count > 0) {
      return index < count;
    }
    return true;
  };
};

export const filterByDate = (date?: Date) => {
  date = date || new Date();
  return (post: Post) => {
    if (import.meta.env.PROD && new Date(post.data?.date) >= date) {
      return false;
    }
    return true;
  };
};

export const filterByDraft = () => {
  return (post: Post) => {
    return !post.data?.draft;
  };
};

export const filterByTag = (tag?: string) => {
  return (post: Post) => {
    if (tag) {
      if (tag === "uncategorized") {
        return !(post.data?.tags && post.data.tags.length > 0);
      }
      return (post.data?.tags ?? []).some((t: string) => slugifyTag(t) === tag);
    }
    return true;
  };
};

export const sortPostsByDate = () => {
  return (a: Post, b: Post) => {
    const bDate = b.data?.date?.valueOf?.() ?? 0;
    const aDate = a.data?.date?.valueOf?.() ?? 0;
    return bDate - aDate;
  };
};

/**
 * All posts in the collection.
 */
export const getAllPosts = () => getCollection("posts");
