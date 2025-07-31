
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, blogPostsTable } from '../db/schema';
import { type SearchInput } from '../schema';
import { searchContent } from '../handlers/search_content';

// Helper function to create test project
const createTestProject = async (overrides: any = {}) => {
  const result = await db.insert(projectsTable)
    .values({
      title: 'Default Project',
      description: 'A default project description',
      tech_stack: 'HTML, CSS, JavaScript',
      project_url: 'https://example.com',
      github_url: 'https://github.com/user/project',
      image_url: 'https://example.com/image.jpg',
      is_featured: false,
      display_order: 1,
      ...overrides
    })
    .returning()
    .execute();
  return result[0];
};

// Helper function to create test blog post with unique slug
const createTestBlogPost = async (overrides: any = {}) => {
  const uniqueSlug = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const result = await db.insert(blogPostsTable)
    .values({
      title: 'Default Blog Post',
      slug: overrides.slug || uniqueSlug,
      content: 'Default blog post content',
      excerpt: 'Default excerpt',
      is_published: true,
      tags: 'Default, Blog',
      reading_time_minutes: 5,
      published_at: new Date(),
      ...overrides
    })
    .returning()
    .execute();
  return result[0];
};

describe('searchContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should search projects by title', async () => {
    await createTestProject({ 
      title: 'React Portfolio',
      description: 'A portfolio website',
      tech_stack: 'HTML, CSS, JavaScript'
    });
    await createTestProject({ 
      title: 'Vue Dashboard',
      description: 'A dashboard application',
      tech_stack: 'Vue, JavaScript, CSS'
    });

    const input: SearchInput = {
      query: 'React',
      type: 'projects'
    };

    const result = await searchContent(input);

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].title).toEqual('React Portfolio');
    expect(result.posts).toHaveLength(0);
  });

  it('should search projects by description', async () => {
    await createTestProject({ 
      title: 'My App',
      description: 'Built with React and modern tools',
      tech_stack: 'JavaScript, CSS'
    });

    const input: SearchInput = {
      query: 'React',
      type: 'projects'
    };

    const result = await searchContent(input);

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].description).toContain('React');
  });

  it('should search projects by tech stack', async () => {
    await createTestProject({ 
      title: 'My App',
      description: 'A web application',
      tech_stack: 'Node.js, Express, PostgreSQL'
    });

    const input: SearchInput = {
      query: 'Node.js',
      type: 'projects'
    };

    const result = await searchContent(input);

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].tech_stack).toContain('Node.js');
  });

  it('should search published blog posts by title', async () => {
    await createTestBlogPost({ 
      title: 'React Best Practices',
      slug: 'react-best-practices',
      content: 'Tips for development',
      tags: 'Programming',
      is_published: true 
    });
    await createTestBlogPost({ 
      title: 'Vue Components Guide',
      slug: 'vue-components',
      content: 'Guide to Vue components',
      tags: 'Vue, Components',
      is_published: true 
    });
    await createTestBlogPost({ 
      title: 'React Hooks Guide',
      slug: 'react-hooks-guide',
      content: 'Understanding hooks',
      tags: 'Hooks',
      is_published: false 
    }); // Unpublished - should be excluded

    const input: SearchInput = {
      query: 'React',
      type: 'posts'
    };

    const result = await searchContent(input);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toEqual('React Best Practices');
    expect(result.projects).toHaveLength(0);
  });

  it('should search blog posts by content', async () => {
    await createTestBlogPost({ 
      title: 'Web Development',
      slug: 'web-development',
      content: 'This tutorial covers React hooks and state management',
      tags: 'Web, Tutorial'
    });

    const input: SearchInput = {
      query: 'React hooks',
      type: 'posts'
    };

    const result = await searchContent(input);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].content).toContain('React hooks');
  });

  it('should search blog posts by tags', async () => {
    await createTestBlogPost({ 
      title: 'Web Tutorial',
      slug: 'web-tutorial',
      content: 'A comprehensive tutorial',
      tags: 'JavaScript, Frontend, Tutorial'
    });

    const input: SearchInput = {
      query: 'JavaScript',
      type: 'posts'
    };

    const result = await searchContent(input);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].tags).toContain('JavaScript');
  });

  it('should search both projects and posts when type is all', async () => {
    await createTestProject({ 
      title: 'React Portfolio',
      description: 'A portfolio site',
      tech_stack: 'HTML, CSS'
    });
    await createTestBlogPost({ 
      title: 'React Tutorial',
      slug: 'react-tutorial',
      content: 'Learn basics',
      tags: 'Tutorial'
    });

    const input: SearchInput = {
      query: 'React',
      type: 'all'
    };

    const result = await searchContent(input);

    expect(result.projects).toHaveLength(1);
    expect(result.posts).toHaveLength(1);
    expect(result.projects[0].title).toEqual('React Portfolio');
    expect(result.posts[0].title).toEqual('React Tutorial');
  });

  it('should default to searching all content types', async () => {
    await createTestProject({ 
      title: 'TypeScript App',
      description: 'An application',
      tech_stack: 'TypeScript, Node.js'
    });
    await createTestBlogPost({ 
      title: 'TypeScript Guide',
      slug: 'typescript-guide',
      content: 'Learn TypeScript',
      tags: 'Programming, TypeScript'
    });

    const input: SearchInput = {
      query: 'TypeScript'
      // No type specified - should default to 'all'
    };

    const result = await searchContent(input);

    expect(result.projects).toHaveLength(1);
    expect(result.posts).toHaveLength(1);
  });

  it('should handle case insensitive search', async () => {
    await createTestProject({ 
      title: 'React Portfolio',
      description: 'A portfolio site',
      tech_stack: 'HTML, CSS'
    });
    await createTestBlogPost({ 
      title: 'Vue Tutorial',
      slug: 'vue-tutorial',
      content: 'Learn Vue basics',
      tags: 'Vue, Tutorial'
    });

    const input: SearchInput = {
      query: 'react', // lowercase
      type: 'all'
    };

    const result = await searchContent(input);

    expect(result.projects).toHaveLength(1);
    expect(result.posts).toHaveLength(0);
    expect(result.projects[0].title).toEqual('React Portfolio');
  });

  it('should return empty results when no matches found', async () => {
    await createTestProject({ 
      title: 'Vue Portfolio',
      description: 'A portfolio site',
      tech_stack: 'Vue, CSS'
    });
    await createTestBlogPost({ 
      title: 'Vue Tutorial',
      slug: 'vue-tutorial',
      content: 'Learn Vue basics',
      tags: 'Vue, Tutorial'
    });

    const input: SearchInput = {
      query: 'Angular',
      type: 'all'
    };

    const result = await searchContent(input);

    expect(result.projects).toHaveLength(0);
    expect(result.posts).toHaveLength(0);
  });

  it('should exclude unpublished blog posts from search', async () => {
    await createTestBlogPost({ 
      title: 'React Hooks',
      slug: 'react-hooks-unpublished',
      content: 'Understanding hooks',
      tags: 'React, Hooks',
      is_published: false 
    });
    await createTestBlogPost({ 
      title: 'React Components',
      slug: 'react-components-published',
      content: 'Building components',
      tags: 'React, Components',
      is_published: true 
    });

    const input: SearchInput = {
      query: 'React',
      type: 'posts'
    };

    const result = await searchContent(input);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toEqual('React Components');
    expect(result.posts[0].is_published).toBe(true);
  });
});
