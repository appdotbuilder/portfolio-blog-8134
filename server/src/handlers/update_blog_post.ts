
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBlogPost = async (input: UpdateBlogPostInput): Promise<BlogPost> => {
  try {
    // Build update values object with only provided fields
    const updateValues: any = {
      updated_at: new Date()
    };

    // Add provided fields to update values
    if (input.title !== undefined) {
      updateValues.title = input.title;
      // Generate slug from title
      updateValues.slug = input.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (input.content !== undefined) {
      updateValues.content = input.content;
    }

    if (input.excerpt !== undefined) {
      updateValues.excerpt = input.excerpt;
    }

    if (input.is_published !== undefined) {
      updateValues.is_published = input.is_published;
      // Set or unset published_at based on is_published
      updateValues.published_at = input.is_published ? new Date() : null;
    }

    if (input.tags !== undefined) {
      updateValues.tags = input.tags;
    }

    if (input.reading_time_minutes !== undefined) {
      updateValues.reading_time_minutes = input.reading_time_minutes;
    }

    // Update the blog post
    const result = await db.update(blogPostsTable)
      .set(updateValues)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Blog post with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Blog post update failed:', error);
    throw error;
  }
};
