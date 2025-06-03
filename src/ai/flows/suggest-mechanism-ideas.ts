'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting unique mechanisms behind a product.
 *
 * The flow takes a product description as input and returns a list of suggested mechanisms.
 * - suggestMechanismIdeas - A function that calls suggestMechanismIdeasFlow to get mechanism suggestions.
 * - SuggestMechanismIdeasInput - The input type for the suggestMechanismIdeas function.
 * - SuggestMechanismIdeasOutput - The return type for the suggestMechanismIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMechanismIdeasInputSchema = z.object({
  productDescription: z
    .string()
    .describe('A detailed description of the product, its features, and benefits.'),
});
export type SuggestMechanismIdeasInput = z.infer<typeof SuggestMechanismIdeasInputSchema>;

const SuggestMechanismIdeasOutputSchema = z.object({
  suggestedMechanisms: z
    .array(z.string())
    .describe('A list of suggested unique mechanisms behind the product.'),
});
export type SuggestMechanismIdeasOutput = z.infer<typeof SuggestMechanismIdeasOutputSchema>;

export async function suggestMechanismIdeas(input: SuggestMechanismIdeasInput): Promise<SuggestMechanismIdeasOutput> {
  return suggestMechanismIdeasFlow(input);
}

const suggestMechanismIdeasPrompt = ai.definePrompt({
  name: 'suggestMechanismIdeasPrompt',
  input: {schema: SuggestMechanismIdeasInputSchema},
  output: {schema: SuggestMechanismIdeasOutputSchema},
  prompt: `You are an expert marketing strategist specializing in identifying the unique mechanisms behind products.

  Given the following product description, suggest a list of unique mechanisms that explain how the product delivers its benefits.
  Each mechanism should be a concise and compelling statement.

  Product Description: {{{productDescription}}}

  Suggested Mechanisms:`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestMechanismIdeasFlow = ai.defineFlow(
  {
    name: 'suggestMechanismIdeasFlow',
    inputSchema: SuggestMechanismIdeasInputSchema,
    outputSchema: SuggestMechanismIdeasOutputSchema,
  },
  async input => {
    const {output} = await suggestMechanismIdeasPrompt(input);
    return output!;
  }
);
