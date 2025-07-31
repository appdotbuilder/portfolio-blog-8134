
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let existingProjectId: number;

  beforeEach(async () => {
    // Create a project to update in tests
    const result = await db.insert(projectsTable)
      .values({
        title: 'Original Project',
        description: 'Original description',
        tech_stack: 'JavaScript, Node.js',
        project_url: 'https://example.com',
        github_url: 'https://github.com/user/project',
        image_url: 'https://example.com/image.jpg',
        is_featured: false,
        display_order: 1
      })
      .returning()
      .execute();
    
    existingProjectId = result[0].id;
  });

  it('should update project with all fields', async () => {
    const updateInput: UpdateProjectInput = {
      id: existingProjectId,
      title: 'Updated Project',
      description: 'Updated description',
      tech_stack: 'TypeScript, React',
      project_url: 'https://updated.com',
      github_url: 'https://github.com/user/updated',
      image_url: 'https://updated.com/image.jpg',
      is_featured: true,
      display_order: 2
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(existingProjectId);
    expect(result.title).toEqual('Updated Project');
    expect(result.description).toEqual('Updated description');
    expect(result.tech_stack).toEqual('TypeScript, React');
    expect(result.project_url).toEqual('https://updated.com');
    expect(result.github_url).toEqual('https://github.com/user/updated');
    expect(result.image_url).toEqual('https://updated.com/image.jpg');
    expect(result.is_featured).toEqual(true);
    expect(result.display_order).toEqual(2);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update project with partial fields', async () => {
    const updateInput: UpdateProjectInput = {
      id: existingProjectId,
      title: 'Partially Updated',
      is_featured: true
    };

    const result = await updateProject(updateInput);

    expect(result.title).toEqual('Partially Updated');
    expect(result.is_featured).toEqual(true);
    // Other fields should remain unchanged
    expect(result.description).toEqual('Original description');
    expect(result.tech_stack).toEqual('JavaScript, Node.js');
    expect(result.display_order).toEqual(1);
  });

  it('should update project with nullable fields set to null', async () => {
    const updateInput: UpdateProjectInput = {
      id: existingProjectId,
      tech_stack: null,
      project_url: null,
      github_url: null,
      image_url: null
    };

    const result = await updateProject(updateInput);

    expect(result.tech_stack).toBeNull();
    expect(result.project_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.image_url).toBeNull();
    // Non-nullable fields should remain unchanged
    expect(result.title).toEqual('Original Project');
    expect(result.description).toEqual('Original description');
  });

  it('should save updated project to database', async () => {
    const updateInput: UpdateProjectInput = {
      id: existingProjectId,
      title: 'Database Test Update'
    };

    await updateProject(updateInput);

    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, existingProjectId))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Database Test Update');
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when project does not exist', async () => {
    const updateInput: UpdateProjectInput = {
      id: 99999,
      title: 'Non-existent Project'
    };

    await expect(updateProject(updateInput)).rejects.toThrow(/project with id 99999 not found/i);
  });

  it('should update updated_at timestamp', async () => {
    // Get original timestamp
    const originalProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, existingProjectId))
      .execute();

    const originalUpdatedAt = originalProject[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateProjectInput = {
      id: existingProjectId,
      title: 'Timestamp Test'
    };

    const result = await updateProject(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
