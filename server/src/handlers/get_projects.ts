
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { asc } from 'drizzle-orm';

export async function getProjects(): Promise<Project[]> {
  try {
    const results = await db.select()
      .from(projectsTable)
      .orderBy(asc(projectsTable.display_order), asc(projectsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}
