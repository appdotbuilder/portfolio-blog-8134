
import { z } from 'zod';

// About Me schema
export const aboutMeSchema = z.object({
  id: z.number(),
  name: z.string(),
  title: z.string(),
  bio: z.string(),
  email: z.string().email().nullable(),
  github_url: z.string().url().nullable(),
  linkedin_url: z.string().url().nullable(),
  website_url: z.string().url().nullable(),
  profile_image_url: z.string().url().nullable(),
  updated_at: z.coerce.date()
});

export type AboutMe = z.infer<typeof aboutMeSchema>;

// Input schema for updating about me
export const updateAboutMeInputSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  profile_image_url: z.string().url().nullable().optional()
});

export type UpdateAboutMeInput = z.infer<typeof updateAboutMeInputSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  tech_stack: z.string().nullable(), // Comma-separated technologies
  project_url: z.string().url().nullable(),
  github_url: z.string().url().nullable(),
  image_url: z.string().url().nullable(),
  is_featured: z.boolean(),
  display_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Input schema for creating projects
export const createProjectInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  tech_stack: z.string().nullable().optional(),
  project_url: z.string().url().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().optional()
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// Input schema for updating projects
export const updateProjectInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  tech_stack: z.string().nullable().optional(),
  project_url: z.string().url().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

// Blog post schema
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  is_published: z.boolean(),
  tags: z.string().nullable(), // Comma-separated tags
  reading_time_minutes: z.number().int().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  published_at: z.coerce.date().nullable()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// Input schema for creating blog posts
export const createBlogPostInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  tags: z.string().nullable().optional(),
  reading_time_minutes: z.number().int().positive().nullable().optional()
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// Input schema for updating blog posts
export const updateBlogPostInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  tags: z.string().nullable().optional(),
  reading_time_minutes: z.number().int().positive().nullable().optional()
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;

// Search input schema
export const searchInputSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['all', 'projects', 'posts']).optional()
});

export type SearchInput = z.infer<typeof searchInputSchema>;

// Search result schema
export const searchResultSchema = z.object({
  projects: z.array(projectSchema),
  posts: z.array(blogPostSchema)
});

export type SearchResult = z.infer<typeof searchResultSchema>;
