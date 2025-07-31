
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.is_featured, true))
      .orderBy(asc(projectsTable.display_order), asc(projectsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch featured projects:', error);
    throw error;
  }
}
