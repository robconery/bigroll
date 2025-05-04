import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    offers: defineCollection({
      type: 'page',
      source: 'offers/*.md',
      schema: z.object({
        title: z.string(),
        offer: z.string(),
        price: z.number(),
        stripe: z.string(),
      })
    }),
    books: defineCollection({
      type: 'page',
      source: 'books/*.md',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        summary: z.string(),
        image: z.string(),
        price: z.number(),
        link: z.string(),
      })
    }),
    courses: defineCollection({
      type: 'page',
      source: 'courses/*.md',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        summary: z.string(),
        image: z.string(),
        price: z.number().default(0),
        videoCount: z.number(),
        access: z.string(),
        duration: z.string()
      })
    }),
    lessons: defineCollection({
      type: 'page',
      source: 'lessons/**/*.md',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        summary: z.string(),
        course: z.string(),
        vimeo: z.string(),
        category: z.string(),
        gist: z.string(),
        image: z.string(),
        duration: z.number().default(0),
        free: z.boolean().default(false)
      })
    }),
  }
});
