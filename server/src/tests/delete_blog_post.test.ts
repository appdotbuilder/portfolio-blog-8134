
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { deleteBlogPost } from '../handlers/delete_blog_post';
import { eq } from 'drizzle-orm';

// Test blog post data
const testBlogPost: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content',
  excerpt: 'Test excerpt',
  is_published: true,
  tags: 'test,blog',
  reading_time_minutes: 5
};

describe('deleteBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing blog post', async () => {
    // Create a blog post first
    const createResult = await db.insert(blogPostsTable)
      .values({
        title: testBlogPost.title,
        slug: 'test-blog-post',
        content: testBlogPost.content,
        excerpt: testBlogPost.excerpt,
        is_published: testBlogPost.is_published,
        tags: testBlogPost.tags,
        reading_time_minutes: testBlogPost.reading_time_minutes
      })
      .returning()
      .execute();

    const blogPost = createResult[0];

    // Delete the blog post
    await expect(deleteBlogPost(blogPost.id)).resolves.toBeUndefined();

    // Verify the blog post was deleted
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPost.id))
      .execute();

    expect(deletedPost).toHaveLength(0);
  });

  it('should throw error when blog post does not exist', async () => {
    const nonExistentId = 999;

    await expect(deleteBlogPost(nonExistentId)).rejects.toThrow(/blog post with id 999 not found/i);
  });

  it('should not affect other blog posts when deleting one', async () => {
    // Create two blog posts
    const firstPost = await db.insert(blogPostsTable)
      .values({
        title: 'First Post',
        slug: 'first-post',
        content: 'First post content',
        excerpt: 'First excerpt',
        is_published: true,
        tags: 'first',
        reading_time_minutes: 3
      })
      .returning()
      .execute();

    const secondPost = await db.insert(blogPostsTable)
      .values({
        title: 'Second Post',
        slug: 'second-post',
        content: 'Second post content',
        excerpt: 'Second excerpt',
        is_published: false,
        tags: 'second',
        reading_time_minutes: 7
      })
      .returning()
      .execute();

    // Delete first post
    await deleteBlogPost(firstPost[0].id);

    // Verify first post is deleted
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, firstPost[0].id))
      .execute();

    expect(deletedPost).toHaveLength(0);

    // Verify second post still exists
    const remainingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, secondPost[0].id))
      .execute();

    expect(remainingPost).toHaveLength(1);
    expect(remainingPost[0].title).toEqual('Second Post');
  });
});
