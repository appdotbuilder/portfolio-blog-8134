
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type BlogPost } from '../schema';

export const createBlogPost = async (input: CreateBlogPostInput): Promise<BlogPost> => {
  try {
    // Generate slug from title
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Set published_at if the post is being published
    const publishedAt = input.is_published ? new Date() : null;

    // Insert blog post record
    const result = await db.insert(blogPostsTable)
      .values({
        title: input.title,
        slug: slug,
        content: input.content,
        excerpt: input.excerpt || null,
        is_published: input.is_published || false,
        tags: input.tags || null,
        reading_time_minutes: input.reading_time_minutes || null,
        published_at: publishedAt
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Blog post creation failed:', error);
    throw error;
  }
};
