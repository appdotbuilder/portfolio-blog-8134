
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type UpdateBlogPostInput } from '../schema';
import { updateBlogPost } from '../handlers/update_blog_post';
import { eq } from 'drizzle-orm';

// Helper to create a test blog post
const createTestBlogPost = async (input: Partial<CreateBlogPostInput> = {}) => {
  const defaultInput: CreateBlogPostInput = {
    title: 'Original Title',
    content: 'Original content',
    excerpt: 'Original excerpt',
    is_published: false,
    tags: 'tag1,tag2',
    reading_time_minutes: 5
  };

  const blogPostInput = { ...defaultInput, ...input };
  
  const slug = blogPostInput.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const result = await db.insert(blogPostsTable)
    .values({
      title: blogPostInput.title,
      slug: slug,
      content: blogPostInput.content,
      excerpt: blogPostInput.excerpt,
      is_published: blogPostInput.is_published,
      tags: blogPostInput.tags,
      reading_time_minutes: blogPostInput.reading_time_minutes,
      published_at: blogPostInput.is_published ? new Date() : null
    })
    .returning()
    .execute();

  return result[0];
};

describe('updateBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update blog post title and generate new slug', async () => {
    const blogPost = await createTestBlogPost();
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      title: 'Updated Blog Post Title'
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPost.id);
    expect(result.title).toEqual('Updated Blog Post Title');
    expect(result.slug).toEqual('updated-blog-post-title');
    expect(result.content).toEqual('Original content'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > blogPost.updated_at).toBe(true);
  });

  it('should update blog post content', async () => {
    const blogPost = await createTestBlogPost();
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      content: 'This is the updated content'
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPost.id);
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
    expect(result.content).toEqual('This is the updated content');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should set published_at when publishing blog post', async () => {
    const blogPost = await createTestBlogPost({ is_published: false });
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      is_published: true
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPost.id);
    expect(result.is_published).toBe(true);
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at).not.toBeNull();
  });

  it('should unset published_at when unpublishing blog post', async () => {
    const blogPost = await createTestBlogPost({ is_published: true });
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      is_published: false
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPost.id);
    expect(result.is_published).toBe(false);
    expect(result.published_at).toBeNull();
  });

  it('should update multiple fields at once', async () => {
    const blogPost = await createTestBlogPost();
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      title: 'New Title',
      content: 'New content',
      excerpt: 'New excerpt',
      is_published: true,
      tags: 'new,tags',
      reading_time_minutes: 10
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPost.id);
    expect(result.title).toEqual('New Title');
    expect(result.slug).toEqual('new-title');
    expect(result.content).toEqual('New content');
    expect(result.excerpt).toEqual('New excerpt');
    expect(result.is_published).toBe(true);
    expect(result.tags).toEqual('new,tags');
    expect(result.reading_time_minutes).toEqual(10);
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const blogPost = await createTestBlogPost();
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      excerpt: null,
      tags: null,
      reading_time_minutes: null
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPost.id);
    expect(result.excerpt).toBeNull();
    expect(result.tags).toBeNull();
    expect(result.reading_time_minutes).toBeNull();
  });

  it('should generate proper slug from complex titles', async () => {
    const blogPost = await createTestBlogPost();
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      title: 'How to Build a React App with TypeScript & GraphQL!'
    };

    const result = await updateBlogPost(updateInput);

    expect(result.slug).toEqual('how-to-build-a-react-app-with-typescript-graphql');
  });

  it('should save changes to database', async () => {
    const blogPost = await createTestBlogPost();
    
    const updateInput: UpdateBlogPostInput = {
      id: blogPost.id,
      title: 'Database Test Title',
      is_published: true
    };

    await updateBlogPost(updateInput);

    // Verify changes in database
    const updatedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPost.id))
      .execute();

    expect(updatedPost).toHaveLength(1);
    expect(updatedPost[0].title).toEqual('Database Test Title');
    expect(updatedPost[0].slug).toEqual('database-test-title');
    expect(updatedPost[0].is_published).toBe(true);
    expect(updatedPost[0].published_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent blog post', async () => {
    const updateInput: UpdateBlogPostInput = {
      id: 99999,
      title: 'Non-existent Post'
    };

    await expect(updateBlogPost(updateInput)).rejects.toThrow(/not found/i);
  });
});
