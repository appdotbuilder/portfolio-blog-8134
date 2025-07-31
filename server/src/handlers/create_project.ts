
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';
import { desc } from 'drizzle-orm';

export async function createProject(input: CreateProjectInput): Promise<Project> {
  try {
    // Auto-generate display_order if not provided
    let displayOrder = input.display_order;
    
    if (displayOrder === undefined) {
      // Get the highest display_order and increment by 1
      const maxOrderResult = await db.select({ maxOrder: projectsTable.display_order })
        .from(projectsTable)
        .orderBy(desc(projectsTable.display_order))
        .limit(1)
        .execute();
      
      displayOrder = maxOrderResult.length > 0 ? maxOrderResult[0].maxOrder + 1 : 1;
    }

    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        title: input.title,
        description: input.description,
        tech_stack: input.tech_stack || null,
        project_url: input.project_url || null,
        github_url: input.github_url || null,
        image_url: input.image_url || null,
        is_featured: input.is_featured || false,
        display_order: displayOrder
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
}
