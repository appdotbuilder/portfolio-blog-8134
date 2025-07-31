
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { aboutMeTable } from '../db/schema';
import { getAboutMe } from '../handlers/get_about_me';

describe('getAboutMe', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no about me record exists', async () => {
    const result = await getAboutMe();
    expect(result).toBeNull();
  });

  it('should return about me record when it exists', async () => {
    // Create test about me record
    const testAboutMe = {
      name: 'John Doe',
      title: 'Software Developer',
      bio: 'A passionate developer who loves coding.',
      email: 'john@example.com',
      github_url: 'https://github.com/johndoe',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      website_url: 'https://johndoe.dev',
      profile_image_url: 'https://example.com/profile.jpg'
    };

    await db.insert(aboutMeTable)
      .values(testAboutMe)
      .execute();

    const result = await getAboutMe();

    expect(result).toBeDefined();
    expect(result?.name).toEqual('John Doe');
    expect(result?.title).toEqual('Software Developer');
    expect(result?.bio).toEqual('A passionate developer who loves coding.');
    expect(result?.email).toEqual('john@example.com');
    expect(result?.github_url).toEqual('https://github.com/johndoe');
    expect(result?.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result?.website_url).toEqual('https://johndoe.dev');
    expect(result?.profile_image_url).toEqual('https://example.com/profile.jpg');
    expect(result?.id).toBeDefined();
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return only one record when multiple exist', async () => {
    // Create multiple about me records
    const testAboutMe1 = {
      name: 'John Doe',
      title: 'Software Developer',
      bio: 'First record',
      email: 'john1@example.com'
    };

    const testAboutMe2 = {
      name: 'Jane Doe',
      title: 'UI Designer',
      bio: 'Second record',
      email: 'jane@example.com'
    };

    await db.insert(aboutMeTable)
      .values([testAboutMe1, testAboutMe2])
      .execute();

    const result = await getAboutMe();

    expect(result).toBeDefined();
    expect(result?.name).toEqual('John Doe'); // Should return the first record
    expect(result?.bio).toEqual('First record');
  });

  it('should handle nullable fields correctly', async () => {
    // Create about me record with minimal required fields
    const testAboutMe = {
      name: 'Minimal User',
      title: 'Developer',
      bio: 'Just the basics',
      email: null,
      github_url: null,
      linkedin_url: null,
      website_url: null,
      profile_image_url: null
    };

    await db.insert(aboutMeTable)
      .values(testAboutMe)
      .execute();

    const result = await getAboutMe();

    expect(result).toBeDefined();
    expect(result?.name).toEqual('Minimal User');
    expect(result?.title).toEqual('Developer');
    expect(result?.bio).toEqual('Just the basics');
    expect(result?.email).toBeNull();
    expect(result?.github_url).toBeNull();
    expect(result?.linkedin_url).toBeNull();
    expect(result?.website_url).toBeNull();
    expect(result?.profile_image_url).toBeNull();
  });
});
