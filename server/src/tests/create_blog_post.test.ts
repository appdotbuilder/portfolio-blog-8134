
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Test input for a draft post
const draftPostInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is the content of the test blog post.',
  excerpt: 'This is a test excerpt.',
  is_published: false,
  tags: 'test,blog,draft',
  reading_time_minutes: 5
};

// Test input for a published post
const publishedPostInput: CreateBlogPostInput = {
  title: 'Published Test Post',
  content: 'This is a published blog post content.',
  excerpt: null,
  is_published: true,
  tags: null,
  reading_time_minutes: null
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a draft blog post', async () => {
    const result = await createBlogPost(draftPostInput);

    // Basic field validation
    expect(result.title).toEqual('Test Blog Post');
    expect(result.slug).toEqual('test-blog-post');
    expect(result.content).toEqual(draftPostInput.content);
    expect(result.excerpt).toEqual('This is a test excerpt.');
    expect(result.is_published).toEqual(false);
    expect(result.tags).toEqual('test,blog,draft');
    expect(result.reading_time_minutes).toEqual(5);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.published_at).toBeNull();
  });

  it('should create a published blog post with published_at timestamp', async () => {
    const result = await createBlogPost(publishedPostInput);

    // Validate published post fields
    expect(result.title).toEqual('Published Test Post');
    expect(result.slug).toEqual('published-test-post');
    expect(result.is_published).toEqual(true);
    expect(result.excerpt).toBeNull();
    expect(result.tags).toBeNull();
    expect(result.reading_time_minutes).toBeNull();
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at).not.toBeNull();
  });

  it('should save blog post to database', async () => {
    const result = await createBlogPost(draftPostInput);

    // Query database to verify post was saved
    const posts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(posts).toHaveLength(1);
    expect(posts[0].title).toEqual('Test Blog Post');
    expect(posts[0].slug).toEqual('test-blog-post');
    expect(posts[0].content).toEqual(draftPostInput.content);
    expect(posts[0].is_published).toEqual(false);
    expect(posts[0].published_at).toBeNull();
    expect(posts[0].created_at).toBeInstanceOf(Date);
  });

  it('should generate proper slug from title', async () => {
    const complexTitleInput: CreateBlogPostInput = {
      title: 'How to Build APIs with Node.js & TypeScript!',
      content: 'Content here.',
      is_published: false
    };

    const result = await createBlogPost(complexTitleInput);

    expect(result.slug).toEqual('how-to-build-apis-with-node-js-typescript');
  });

  it('should handle minimal input with defaults', async () => {
    const minimalInput: CreateBlogPostInput = {
      title: 'Minimal Post',
      content: 'Just the basics.'
    };

    const result = await createBlogPost(minimalInput);

    expect(result.title).toEqual('Minimal Post');
    expect(result.slug).toEqual('minimal-post');
    expect(result.content).toEqual('Just the basics.');
    expect(result.excerpt).toBeNull();
    expect(result.is_published).toEqual(false);
    expect(result.tags).toBeNull();
    expect(result.reading_time_minutes).toBeNull();
    expect(result.published_at).toBeNull();
  });
});
