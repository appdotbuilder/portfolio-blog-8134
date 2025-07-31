
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteProject(id: number): Promise<void> {
  try {
    // Check if project exists first
    const existingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .execute();

    if (existingProject.length === 0) {
      throw new Error(`Project with ID ${id} not found`);
    }

    // Delete the project
    await db.delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .execute();
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
}
