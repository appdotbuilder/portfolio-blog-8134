
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProject = async (input: UpdateProjectInput): Promise<Project> => {
  try {
    // First check if the project exists
    const existingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    if (existingProject.length === 0) {
      throw new Error(`Project with ID ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.tech_stack !== undefined) updateData.tech_stack = input.tech_stack;
    if (input.project_url !== undefined) updateData.project_url = input.project_url;
    if (input.github_url !== undefined) updateData.github_url = input.github_url;
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.is_featured !== undefined) updateData.is_featured = input.is_featured;
    if (input.display_order !== undefined) updateData.display_order = input.display_order;

    // Update the project
    const result = await db.update(projectsTable)
      .set(updateData)
      .where(eq(projectsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
};
