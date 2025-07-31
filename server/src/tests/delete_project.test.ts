
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { deleteProject } from '../handlers/delete_project';
import { eq } from 'drizzle-orm';

// Test project input
const testProject: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing deletion',
  tech_stack: 'JavaScript, Node.js',
  project_url: 'https://example.com',
  github_url: 'https://github.com/test/project',
  image_url: 'https://example.com/image.jpg',
  is_featured: false,
  display_order: 1
};

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing project', async () => {
    // Create a project first
    const result = await db.insert(projectsTable)
      .values({
        title: testProject.title,
        description: testProject.description,
        tech_stack: testProject.tech_stack,
        project_url: testProject.project_url,
        github_url: testProject.github_url,
        image_url: testProject.image_url,
        is_featured: testProject.is_featured || false,
        display_order: testProject.display_order || 0
      })
      .returning()
      .execute();

    const projectId = result[0].id;

    // Verify project exists
    const projectsBefore = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();
    
    expect(projectsBefore).toHaveLength(1);

    // Delete the project
    await deleteProject(projectId);

    // Verify project is deleted
    const projectsAfter = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(projectsAfter).toHaveLength(0);
  });

  it('should throw error when project does not exist', async () => {
    const nonExistentId = 999;

    await expect(deleteProject(nonExistentId))
      .rejects.toThrow(/Project with ID 999 not found/i);
  });

  it('should not affect other projects when deleting one project', async () => {
    // Create two projects
    const project1 = await db.insert(projectsTable)
      .values({
        title: 'Project 1',
        description: 'First project',
        is_featured: false,
        display_order: 0
      })
      .returning()
      .execute();

    const project2 = await db.insert(projectsTable)
      .values({
        title: 'Project 2',
        description: 'Second project',
        is_featured: false,
        display_order: 1
      })
      .returning()
      .execute();

    // Delete first project
    await deleteProject(project1[0].id);

    // Verify first project is deleted
    const deletedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project1[0].id))
      .execute();
    
    expect(deletedProject).toHaveLength(0);

    // Verify second project still exists
    const remainingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project2[0].id))
      .execute();
    
    expect(remainingProject).toHaveLength(1);
    expect(remainingProject[0].title).toEqual('Project 2');
  });
});
