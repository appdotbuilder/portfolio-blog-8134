
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjects } from '../handlers/get_projects';

// Test project inputs
const testProject1: CreateProjectInput = {
  title: 'First Project',
  description: 'Description for first project',
  tech_stack: 'React, TypeScript',
  project_url: 'https://example.com/project1',
  github_url: 'https://github.com/user/project1',
  image_url: 'https://example.com/image1.jpg',
  is_featured: true,
  display_order: 2
};

const testProject2: CreateProjectInput = {
  title: 'Second Project',
  description: 'Description for second project',
  tech_stack: 'Node.js, PostgreSQL',
  project_url: 'https://example.com/project2',
  github_url: 'https://github.com/user/project2',
  image_url: 'https://example.com/image2.jpg',
  is_featured: false,
  display_order: 1
};

const testProject3: CreateProjectInput = {
  title: 'Third Project',
  description: 'Description for third project',
  tech_stack: null,
  project_url: null,
  github_url: null,
  image_url: null,
  is_featured: false,
  display_order: 1
};

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('should return all projects', async () => {
    // Create test projects
    await db.insert(projectsTable).values([
      {
        title: testProject1.title,
        description: testProject1.description,
        tech_stack: testProject1.tech_stack,
        project_url: testProject1.project_url,
        github_url: testProject1.github_url,
        image_url: testProject1.image_url,
        is_featured: testProject1.is_featured!,
        display_order: testProject1.display_order!
      },
      {
        title: testProject2.title,
        description: testProject2.description,
        tech_stack: testProject2.tech_stack,
        project_url: testProject2.project_url,
        github_url: testProject2.github_url,
        image_url: testProject2.image_url,
        is_featured: testProject2.is_featured!,
        display_order: testProject2.display_order!
      }
    ]).execute();

    const result = await getProjects();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Second Project');
    expect(result[1].title).toBe('First Project');
  });

  it('should order projects by display_order then by created_at', async () => {
    // Insert projects with same display_order but different creation times
    await db.insert(projectsTable).values({
      title: testProject2.title,
      description: testProject2.description,
      tech_stack: testProject2.tech_stack,
      project_url: testProject2.project_url,
      github_url: testProject2.github_url,
      image_url: testProject2.image_url,
      is_featured: testProject2.is_featured!,
      display_order: testProject2.display_order!
    }).execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable).values({
      title: testProject3.title,
      description: testProject3.description,
      tech_stack: testProject3.tech_stack,
      project_url: testProject3.project_url,
      github_url: testProject3.github_url,
      image_url: testProject3.image_url,
      is_featured: testProject3.is_featured!,
      display_order: testProject3.display_order!
    }).execute();

    await db.insert(projectsTable).values({
      title: testProject1.title,
      description: testProject1.description,
      tech_stack: testProject1.tech_stack,
      project_url: testProject1.project_url,
      github_url: testProject1.github_url,
      image_url: testProject1.image_url,
      is_featured: testProject1.is_featured!,
      display_order: testProject1.display_order!
    }).execute();

    const result = await getProjects();

    expect(result).toHaveLength(3);
    // First two should have display_order 1, ordered by created_at
    expect(result[0].display_order).toBe(1);
    expect(result[1].display_order).toBe(1);
    expect(result[0].title).toBe('Second Project'); // Created first
    expect(result[1].title).toBe('Third Project'); // Created second
    // Last should have display_order 2
    expect(result[2].display_order).toBe(2);
    expect(result[2].title).toBe('First Project');
  });

  it('should include all project fields', async () => {
    await db.insert(projectsTable).values({
      title: testProject1.title,
      description: testProject1.description,
      tech_stack: testProject1.tech_stack,
      project_url: testProject1.project_url,
      github_url: testProject1.github_url,
      image_url: testProject1.image_url,
      is_featured: testProject1.is_featured!,
      display_order: testProject1.display_order!
    }).execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    
    expect(project.id).toBeDefined();
    expect(project.title).toBe('First Project');
    expect(project.description).toBe('Description for first project');
    expect(project.tech_stack).toBe('React, TypeScript');
    expect(project.project_url).toBe('https://example.com/project1');
    expect(project.github_url).toBe('https://github.com/user/project1');
    expect(project.image_url).toBe('https://example.com/image1.jpg');
    expect(project.is_featured).toBe(true);
    expect(project.display_order).toBe(2);
    expect(project.created_at).toBeInstanceOf(Date);
    expect(project.updated_at).toBeInstanceOf(Date);
  });
});
