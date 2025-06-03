'use server';
/**
 * @fileOverview Generates ad copy variations based on an initial ad concept.
 *
 * - generateAdCopyVariations - A function that generates ad copy variations.
 * - GenerateAdCopyVariationsInput - The input type for the generateAdCopyVariations function.
 * - GenerateAdCopyVariationsOutput - The return type for the generateAdCopyVariations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdCopyVariationsInputSchema = z.object({
  adConcept: z.string().describe('The initial ad concept.'),
  productDescription: z.string().describe('The description of the product.'),
  desiredEmotion: z.string().describe('The emotion the ad should evoke.'),
  targetAudience: z.string().describe('The target audience for the ad.'),
  numberOfVariations: z.number().default(3).describe('The number of ad copy variations to generate.'),
});
export type GenerateAdCopyVariationsInput = z.infer<typeof GenerateAdCopyVariationsInputSchema>;

const AdCopyVariationSchema = z.object({
  headline: z.string().describe('The generated headline for the ad.'),
  bodyCopy: z.string().describe('The generated body copy for the ad.'),
  callToAction: z.string().describe('The generated call to action for the ad.'),
});

const GenerateAdCopyVariationsOutputSchema = z.object({
  variations: z.array(AdCopyVariationSchema).describe('The generated ad copy variations.'),
});

export type GenerateAdCopyVariationsOutput = z.infer<typeof GenerateAdCopyVariationsOutputSchema>;

export async function generateAdCopyVariations(input: GenerateAdCopyVariationsInput): Promise<GenerateAdCopyVariationsOutput> {
  return generateAdCopyVariationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdCopyVariationsPrompt',
  input: {
    schema: GenerateAdCopyVariationsInputSchema,
  },
  output: {
    schema: GenerateAdCopyVariationsOutputSchema,
  },
  prompt: `You are an expert advertising copywriter. Generate {{numberOfVariations}} variations of ad copy based on the following ad concept, product description, desired emotion, and target audience.\n\nAd Concept: {{{adConcept}}}\nProduct Description: {{{productDescription}}}\nDesired Emotion: {{{desiredEmotion}}}\nTarget Audience: {{{targetAudience}}}\n\nEach variation should include a headline, body copy, and call to action. Be creative and think outside the box.\n\nOutput should be in JSON format.\n`,
});

const generateAdCopyVariationsFlow = ai.defineFlow(
  {
    name: 'generateAdCopyVariationsFlow',
    inputSchema: GenerateAdCopyVariationsInputSchema,
    outputSchema: GenerateAdCopyVariationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
