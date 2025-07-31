
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { getFeaturedProjects } from '../handlers/get_featured_projects';

describe('getFeaturedProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured projects', async () => {
    // Create mix of featured and non-featured projects
    await db.insert(projectsTable).values([
      {
        title: 'Featured Project 1',
        description: 'First featured project',
        is_featured: true,
        display_order: 1
      },
      {
        title: 'Regular Project',
        description: 'Not featured project',
        is_featured: false,
        display_order: 2
      },
      {
        title: 'Featured Project 2',
        description: 'Second featured project',
        is_featured: true,
        display_order: 3
      }
    ]).execute();

    const result = await getFeaturedProjects();

    expect(result).toHaveLength(2);
    expect(result.every(project => project.is_featured)).toBe(true);
    expect(result.map(p => p.title)).toContain('Featured Project 1');
    expect(result.map(p => p.title)).toContain('Featured Project 2');
    expect(result.map(p => p.title)).not.toContain('Regular Project');
  });

  it('should return projects ordered by display_order then created_at', async () => {
    // Create projects with different display orders
    const now = new Date();
    const earlier = new Date(now.getTime() - 60000); // 1 minute earlier

    await db.insert(projectsTable).values([
      {
        title: 'Third Order Project',
        description: 'Should be third',
        is_featured: true,
        display_order: 3,
        created_at: earlier
      },
      {
        title: 'First Order Project',
        description: 'Should be first',
        is_featured: true,
        display_order: 1,
        created_at: now
      },
      {
        title: 'Second Order Early',
        description: 'Should be second (earlier created_at)',
        is_featured: true,
        display_order: 2,
        created_at: earlier
      },
      {
        title: 'Second Order Late',
        description: 'Should be third (later created_at)',
        is_featured: true,
        display_order: 2,
        created_at: now
      }
    ]).execute();

    const result = await getFeaturedProjects();

    expect(result).toHaveLength(4);
    expect(result[0].title).toBe('First Order Project');
    expect(result[1].title).toBe('Second Order Early');
    expect(result[2].title).toBe('Second Order Late');
    expect(result[3].title).toBe('Third Order Project');
  });

  it('should return empty array when no featured projects exist', async () => {
    // Create only non-featured projects
    await db.insert(projectsTable).values([
      {
        title: 'Regular Project 1',
        description: 'Not featured',
        is_featured: false,
        display_order: 1
      },
      {
        title: 'Regular Project 2',
        description: 'Also not featured',
        is_featured: false,
        display_order: 2
      }
    ]).execute();

    const result = await getFeaturedProjects();

    expect(result).toHaveLength(0);
  });

  it('should return all project fields correctly', async () => {
    await db.insert(projectsTable).values({
      title: 'Complete Featured Project',
      description: 'Project with all fields',
      tech_stack: 'React, TypeScript, Node.js',
      project_url: 'https://example.com',
      github_url: 'https://github.com/user/repo',
      image_url: 'https://example.com/image.jpg',
      is_featured: true,
      display_order: 1
    }).execute();

    const result = await getFeaturedProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    expect(project.id).toBeDefined();
    expect(project.title).toBe('Complete Featured Project');
    expect(project.description).toBe('Project with all fields');
    expect(project.tech_stack).toBe('React, TypeScript, Node.js');
    expect(project.project_url).toBe('https://example.com');
    expect(project.github_url).toBe('https://github.com/user/repo');
    expect(project.image_url).toBe('https://example.com/image.jpg');
    expect(project.is_featured).toBe(true);
    expect(project.display_order).toBe(1);
    expect(project.created_at).toBeInstanceOf(Date);
    expect(project.updated_at).toBeInstanceOf(Date);
  });
});
