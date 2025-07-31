
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { getBlogPosts } from '../handlers/get_blog_posts';

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no published posts exist', async () => {
    const result = await getBlogPosts();
    expect(result).toEqual([]);
  });

  it('should return published blog posts only', async () => {
    // Create published post
    await db.insert(blogPostsTable).values({
      title: 'Published Post',
      slug: 'published-post',
      content: 'This is published content',
      is_published: true,
      published_at: new Date()
    });

    // Create unpublished post
    await db.insert(blogPostsTable).values({
      title: 'Draft Post',
      slug: 'draft-post',
      content: 'This is draft content',
      is_published: false
    });

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Published Post');
    expect(result[0].is_published).toBe(true);
  });

  it('should return posts ordered by published_at descending', async () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 60000); // 1 minute earlier
    const later = new Date(now.getTime() + 60000); // 1 minute later

    // Create posts with different published dates
    await db.insert(blogPostsTable).values({
      title: 'Oldest Post',
      slug: 'oldest-post',
      content: 'Content 1',
      is_published: true,
      published_at: earlier
    });

    await db.insert(blogPostsTable).values({
      title: 'Newest Post',
      slug: 'newest-post',
      content: 'Content 2',
      is_published: true,
      published_at: later
    });

    await db.insert(blogPostsTable).values({
      title: 'Middle Post',
      slug: 'middle-post',
      content: 'Content 3',
      is_published: true,
      published_at: now
    });

    const result = await getBlogPosts();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Newest Post');
    expect(result[1].title).toEqual('Middle Post');
    expect(result[2].title).toEqual('Oldest Post');
  });

  it('should return all required blog post fields', async () => {
    await db.insert(blogPostsTable).values({
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      is_published: true,
      tags: 'javascript,web',
      reading_time_minutes: 5,
      published_at: new Date()
    });

    const result = await getBlogPosts();
    const post = result[0];

    expect(post.id).toBeDefined();
    expect(post.title).toEqual('Test Post');
    expect(post.slug).toEqual('test-post');
    expect(post.content).toEqual('Test content');
    expect(post.excerpt).toEqual('Test excerpt');
    expect(post.is_published).toBe(true);
    expect(post.tags).toEqual('javascript,web');
    expect(post.reading_time_minutes).toEqual(5);
    expect(post.created_at).toBeInstanceOf(Date);
    expect(post.updated_at).toBeInstanceOf(Date);
    expect(post.published_at).toBeInstanceOf(Date);
  });

  it('should handle posts with null published_at gracefully', async () => {
    // Create published post without published_at
    await db.insert(blogPostsTable).values({
      title: 'Published Post No Date',
      slug: 'published-no-date',
      content: 'Content without published date',
      is_published: true,
      published_at: null
    });

    // Create published post with published_at
    await db.insert(blogPostsTable).values({
      title: 'Published Post With Date',
      slug: 'published-with-date',
      content: 'Content with published date',
      is_published: true,
      published_at: new Date()
    });

    const result = await getBlogPosts();

    expect(result).toHaveLength(2);
    // Post with date should come first (DESC NULLS LAST), null values come last
    expect(result[0].title).toEqual('Published Post With Date');
    expect(result[1].title).toEqual('Published Post No Date');
    expect(result[1].published_at).toBeNull();
  });
});
