import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    date:        z.string(),
    description: z.string(),
    image:       z.string().optional(),
    categories:  z.array(z.string()).optional().default([]),
  }),
});

export const collections = { blog };
