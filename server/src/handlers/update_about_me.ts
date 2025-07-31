
import { db } from '../db';
import { aboutMeTable } from '../db/schema';
import { type UpdateAboutMeInput, type AboutMe } from '../schema';

export const updateAboutMe = async (input: UpdateAboutMeInput): Promise<AboutMe> => {
  try {
    // Check if an about_me record exists
    const existing = await db.select()
      .from(aboutMeTable)
      .limit(1)
      .execute();

    if (existing.length === 0) {
      // Create new record if none exists
      const result = await db.insert(aboutMeTable)
        .values({
          name: input.name || 'John Doe',
          title: input.title || 'Software Developer', 
          bio: input.bio || 'Passionate developer building amazing things.',
          email: input.email,
          github_url: input.github_url,
          linkedin_url: input.linkedin_url,
          website_url: input.website_url,
          profile_image_url: input.profile_image_url
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing record
      const updateData: Partial<typeof aboutMeTable.$inferInsert> = {};
      
      if (input.name !== undefined) updateData.name = input.name;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.github_url !== undefined) updateData.github_url = input.github_url;
      if (input.linkedin_url !== undefined) updateData.linkedin_url = input.linkedin_url;
      if (input.website_url !== undefined) updateData.website_url = input.website_url;
      if (input.profile_image_url !== undefined) updateData.profile_image_url = input.profile_image_url;

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date();
        
        const result = await db.update(aboutMeTable)
          .set(updateData)
          .returning()
          .execute();

        return result[0];
      } else {
        // No changes, return existing record
        return existing[0];
      }
    }
  } catch (error) {
    console.error('About me update failed:', error);
    throw error;
  }
};
