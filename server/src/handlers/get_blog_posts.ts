
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type BlogPost } from '../schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Fetch all published blog posts ordered by published_at descending
    // Use NULLS LAST to ensure posts with actual dates come before null dates
    const results = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.is_published, true))
      .orderBy(sql`${blogPostsTable.published_at} DESC NULLS LAST`)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw error;
  }
}
