
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteBlogPost = async (id: number): Promise<void> => {
  try {
    // Delete the blog post by ID
    const result = await db.delete(blogPostsTable)
      .where(eq(blogPostsTable.id, id))
      .returning()
      .execute();

    // Check if any rows were deleted
    if (result.length === 0) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
  } catch (error) {
    console.error('Blog post deletion failed:', error);
    throw error;
  }
};
