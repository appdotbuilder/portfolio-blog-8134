
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq, desc } from 'drizzle-orm';

// Simple test input
const testInput: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing',
  tech_stack: 'React, TypeScript',
  project_url: 'https://example.com',
  github_url: 'https://github.com/user/project',
  image_url: 'https://example.com/image.jpg',
  is_featured: true,
  display_order: 5
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with all fields', async () => {
    const result = await createProject(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Project');
    expect(result.description).toEqual(testInput.description);
    expect(result.tech_stack).toEqual('React, TypeScript');
    expect(result.project_url).toEqual('https://example.com');
    expect(result.github_url).toEqual('https://github.com/user/project');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.is_featured).toEqual(true);
    expect(result.display_order).toEqual(5);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a project with minimal fields', async () => {
    const minimalInput: CreateProjectInput = {
      title: 'Minimal Project',
      description: 'Basic description'
    };

    const result = await createProject(minimalInput);

    expect(result.title).toEqual('Minimal Project');
    expect(result.description).toEqual('Basic description');
    expect(result.tech_stack).toBeNull();
    expect(result.project_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.is_featured).toEqual(false);
    expect(result.display_order).toEqual(1); // Auto-generated
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Test Project');
    expect(projects[0].description).toEqual(testInput.description);
    expect(projects[0].tech_stack).toEqual('React, TypeScript');
    expect(projects[0].is_featured).toEqual(true);
    expect(projects[0].display_order).toEqual(5);
    expect(projects[0].created_at).toBeInstanceOf(Date);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should auto-generate display_order when not provided', async () => {
    const inputWithoutOrder: CreateProjectInput = {
      title: 'Project Without Order',
      description: 'No display order specified'
    };

    const result = await createProject(inputWithoutOrder);
    expect(result.display_order).toEqual(1);

    // Create another project to test incrementing
    const secondResult = await createProject({
      title: 'Second Project',
      description: 'Another project'
    });
    expect(secondResult.display_order).toEqual(2);
  });

  it('should increment display_order based on existing projects', async () => {
    // Create first project with explicit order
    await createProject({
      title: 'First Project',
      description: 'First project',
      display_order: 10
    });

    // Create second project without order - should be 11
    const result = await createProject({
      title: 'Second Project',
      description: 'Second project'
    });

    expect(result.display_order).toEqual(11);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: CreateProjectInput = {
      title: 'Project with Nulls',
      description: 'Has null fields',
      tech_stack: null,
      project_url: null,
      github_url: null,
      image_url: null
    };

    const result = await createProject(inputWithNulls);

    expect(result.tech_stack).toBeNull();
    expect(result.project_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.image_url).toBeNull();
  });

  it('should query projects by display order correctly', async () => {
    // Create multiple projects
    await createProject({
      title: 'Project A',
      description: 'First project',
      display_order: 3
    });

    await createProject({
      title: 'Project B',
      description: 'Second project',
      display_order: 1
    });

    await createProject({
      title: 'Project C',
      description: 'Third project',
      display_order: 2
    });

    // Query projects ordered by display_order descending
    const projects = await db.select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.display_order))
      .execute();

    expect(projects).toHaveLength(3);
    expect(projects[0].title).toEqual('Project A'); // display_order: 3
    expect(projects[1].title).toEqual('Project C'); // display_order: 2
    expect(projects[2].title).toEqual('Project B'); // display_order: 1
  });
});
