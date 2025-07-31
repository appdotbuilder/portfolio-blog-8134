
import { db } from '../db';
import { aboutMeTable } from '../db/schema';
import { type AboutMe } from '../schema';

export const getAboutMe = async (): Promise<AboutMe | null> => {
  try {
    const result = await db.select()
      .from(aboutMeTable)
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get about me:', error);
    throw error;
  }
};
