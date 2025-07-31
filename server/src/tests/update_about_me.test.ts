
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { aboutMeTable } from '../db/schema';
import { type UpdateAboutMeInput } from '../schema';
import { updateAboutMe } from '../handlers/update_about_me';

const testInput: UpdateAboutMeInput = {
  name: 'Jane Smith',
  title: 'Full Stack Developer',
  bio: 'Experienced developer with passion for clean code',
  email: 'jane@example.com',
  github_url: 'https://github.com/janesmith',
  linkedin_url: 'https://linkedin.com/in/janesmith',
  website_url: 'https://janesmith.dev',
  profile_image_url: 'https://example.com/profile.jpg'
};

describe('updateAboutMe', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new about me record when none exists', async () => {
    const result = await updateAboutMe(testInput);

    expect(result.name).toEqual('Jane Smith');
    expect(result.title).toEqual('Full Stack Developer');
    expect(result.bio).toEqual('Experienced developer with passion for clean code');
    expect(result.email).toEqual('jane@example.com');
    expect(result.github_url).toEqual('https://github.com/janesmith');
    expect(result.linkedin_url).toEqual('https://linkedin.com/in/janesmith');
    expect(result.website_url).toEqual('https://janesmith.dev');
    expect(result.profile_image_url).toEqual('https://example.com/profile.jpg');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create record with defaults when no input provided', async () => {
    const result = await updateAboutMe({});

    expect(result.name).toEqual('John Doe');
    expect(result.title).toEqual('Software Developer');
    expect(result.bio).toEqual('Passionate developer building amazing things.');
    expect(result.email).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.linkedin_url).toBeNull();
    expect(result.website_url).toBeNull();
    expect(result.profile_image_url).toBeNull();
  });

  it('should update existing record', async () => {
    // Create initial record
    await updateAboutMe(testInput);

    // Update with new data
    const updateInput: UpdateAboutMeInput = {
      name: 'Jane Doe',
      title: 'Senior Developer',
      email: 'jane.doe@example.com'
    };

    const result = await updateAboutMe(updateInput);

    expect(result.name).toEqual('Jane Doe');
    expect(result.title).toEqual('Senior Developer');
    expect(result.email).toEqual('jane.doe@example.com');
    // Other fields should remain unchanged
    expect(result.bio).toEqual('Experienced developer with passion for clean code');
    expect(result.github_url).toEqual('https://github.com/janesmith');
  });

  it('should handle nullable fields correctly', async () => {
    // Create record with values
    await updateAboutMe(testInput);

    // Update with null values
    const updateInput: UpdateAboutMeInput = {
      email: null,
      github_url: null,
      website_url: null
    };

    const result = await updateAboutMe(updateInput);

    expect(result.email).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.website_url).toBeNull();
    // Non-updated fields should remain
    expect(result.name).toEqual('Jane Smith');
    expect(result.title).toEqual('Full Stack Developer');
  });

  it('should save record to database', async () => {
    const result = await updateAboutMe(testInput);

    const records = await db.select()
      .from(aboutMeTable)
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].id).toEqual(result.id);
    expect(records[0].name).toEqual('Jane Smith');
    expect(records[0].email).toEqual('jane@example.com');
    expect(records[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return existing record when no changes provided', async () => {
    // Create initial record
    const initial = await updateAboutMe(testInput);
    const initialUpdatedAt = initial.updated_at;

    // Update with empty input
    const result = await updateAboutMe({});

    expect(result.id).toEqual(initial.id);
    expect(result.name).toEqual(initial.name);
    expect(result.updated_at).toEqual(initialUpdatedAt);
  });

  it('should update timestamp when changes are made', async () => {
    // Create initial record
    const initial = await updateAboutMe(testInput);
    
    // Small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update with changes
    const result = await updateAboutMe({ name: 'Updated Name' });

    expect(result.updated_at.getTime()).toBeGreaterThan(initial.updated_at.getTime());
  });
});
