
import { db } from '../db';
import { projectsTable, blogPostsTable } from '../db/schema';
import { type SearchInput, type SearchResult } from '../schema';
import { or, ilike, and, eq } from 'drizzle-orm';

export async function searchContent(input: SearchInput): Promise<SearchResult> {
  try {
    const { query, type = 'all' } = input;
    const searchTerm = `%${query}%`;

    let projects: any[] = [];
    let posts: any[] = [];

    // Search projects if type is 'all' or 'projects'
    if (type === 'all' || type === 'projects') {
      projects = await db.select()
        .from(projectsTable)
        .where(
          or(
            ilike(projectsTable.title, searchTerm),
            ilike(projectsTable.description, searchTerm),
            ilike(projectsTable.tech_stack, searchTerm)
          )
        )
        .execute();
    }

    // Search blog posts if type is 'all' or 'posts'
    if (type === 'all' || type === 'posts') {
      posts = await db.select()
        .from(blogPostsTable)
        .where(
          and(
            eq(blogPostsTable.is_published, true), // Only search published posts
            or(
              ilike(blogPostsTable.title, searchTerm),
              ilike(blogPostsTable.content, searchTerm),
              ilike(blogPostsTable.excerpt, searchTerm),
              ilike(blogPostsTable.tags, searchTerm)
            )
          )
        )
        .execute();
    }

    return {
      projects,
      posts
    };
  } catch (error) {
    console.error('Content search failed:', error);
    throw error;
  }
}
