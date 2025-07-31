
import { serial, text, pgTable, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const aboutMeTable = pgTable('about_me', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  bio: text('bio').notNull(),
  email: text('email'), // Nullable by default
  github_url: text('github_url'),
  linkedin_url: text('linkedin_url'),
  website_url: text('website_url'),
  profile_image_url: text('profile_image_url'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  tech_stack: text('tech_stack'), // Comma-separated technologies
  project_url: text('project_url'),
  github_url: text('github_url'),
  image_url: text('image_url'),
  is_featured: boolean('is_featured').default(false).notNull(),
  display_order: integer('display_order').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  is_published: boolean('is_published').default(false).notNull(),
  tags: text('tags'), // Comma-separated tags
  reading_time_minutes: integer('reading_time_minutes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  published_at: timestamp('published_at'),
});

// TypeScript types for the table schemas
export type AboutMe = typeof aboutMeTable.$inferSelect;
export type NewAboutMe = typeof aboutMeTable.$inferInsert;

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export type BlogPost = typeof blogPostsTable.$inferSelect;
export type NewBlogPost = typeof blogPostsTable.$inferInsert;

// Important: Export all tables for proper query building
export const tables = {
  aboutMe: aboutMeTable,
  projects: projectsTable,
  blogPosts: blogPostsTable
};
