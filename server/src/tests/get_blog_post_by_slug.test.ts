
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { getBlogPostBySlug } from '../handlers/get_blog_post_by_slug';

// Helper function to create a blog post
const createTestBlogPost = async (overrides = {}) => {
  const defaultPost = {
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    content: 'This is test content for the blog post.',
    excerpt: 'This is a test excerpt',
    is_published: true,
    tags: 'javascript,testing',
    reading_time_minutes: 5,
    published_at: new Date()
  };

  const result = await db.insert(blogPostsTable)
    .values({ ...defaultPost, ...overrides })
    .returning()
    .execute();

  return result[0];
};

describe('getBlogPostBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a published blog post by slug', async () => {
    // Create a published test post
    await createTestBlogPost({
      slug: 'my-test-post',
      title: 'My Test Post',
      is_published: true
    });

    const result = await getBlogPostBySlug('my-test-post');

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('my-test-post');
    expect(result!.title).toEqual('My Test Post');
    expect(result!.is_published).toBe(true);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const result = await getBlogPostBySlug('non-existent-slug');

    expect(result).toBeNull();
  });

  it('should return null for unpublished post', async () => {
    // Create an unpublished test post
    await createTestBlogPost({
      slug: 'unpublished-post',
      is_published: false
    });

    const result = await getBlogPostBySlug('unpublished-post');

    expect(result).toBeNull();
  });

  it('should return the correct post when multiple posts exist', async () => {
    // Create multiple posts
    await createTestBlogPost({
      slug: 'first-post',
      title: 'First Post',
      is_published: true
    });

    await createTestBlogPost({
      slug: 'second-post',
      title: 'Second Post',
      is_published: true
    });

    await createTestBlogPost({
      slug: 'third-post',
      title: 'Third Post',
      is_published: false
    });

    const result = await getBlogPostBySlug('second-post');

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('second-post');
    expect(result!.title).toEqual('Second Post');
    expect(result!.is_published).toBe(true);
  });

  it('should handle posts with nullable fields', async () => {
    // Create post with minimal required fields
    await createTestBlogPost({
      slug: 'minimal-post',
      title: 'Minimal Post',
      excerpt: null,
      tags: null,
      reading_time_minutes: null,
      published_at: null,
      is_published: true
    });

    const result = await getBlogPostBySlug('minimal-post');

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('minimal-post');
    expect(result!.excerpt).toBeNull();
    expect(result!.tags).toBeNull();
    expect(result!.reading_time_minutes).toBeNull();
    expect(result!.published_at).toBeNull();
  });
});
