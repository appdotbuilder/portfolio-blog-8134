
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type BlogPost } from '../schema';
import { eq, and } from 'drizzle-orm';

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const result = await db.select()
      .from(blogPostsTable)
      .where(and(
        eq(blogPostsTable.slug, slug),
        eq(blogPostsTable.is_published, true)
      ))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    const post = result[0];
    return {
      ...post,
      created_at: post.created_at,
      updated_at: post.updated_at,
      published_at: post.published_at
    };
  } catch (error) {
    console.error('Failed to get blog post by slug:', error);
    throw error;
  }
};
