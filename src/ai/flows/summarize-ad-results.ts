'use server';

/**
 * @fileOverview Summarizes ad performance data and suggests improvements.
 *
 * - summarizeAdResults - A function that handles the ad results summarization process.
 * - SummarizeAdResultsInput - The input type for the summarizeAdResults function.
 * - SummarizeAdResultsOutput - The return type for the summarizeAdResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAdResultsInputSchema = z.object({
  adPerformanceData: z
    .string()
    .describe('The ad performance data in CSV or JSON format.'),
});

export type SummarizeAdResultsInput = z.infer<typeof SummarizeAdResultsInputSchema>;

const SummarizeAdResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key findings from the ad performance data.'),
  suggestions: z
    .string()
    .describe('Suggestions for areas of improvement based on the ad performance data.'),
});

export type SummarizeAdResultsOutput = z.infer<typeof SummarizeAdResultsOutputSchema>;

export async function summarizeAdResults(input: SummarizeAdResultsInput): Promise<SummarizeAdResultsOutput> {
  return summarizeAdResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAdResultsPrompt',
  input: {schema: SummarizeAdResultsInputSchema},
  output: {schema: SummarizeAdResultsOutputSchema},
  prompt: `You are a marketing analyst. Summarize the key findings from the ad performance data below and suggest areas for improvement.

Ad Performance Data:
{{{adPerformanceData}}}`,
});

const summarizeAdResultsFlow = ai.defineFlow(
  {
    name: 'summarizeAdResultsFlow',
    inputSchema: SummarizeAdResultsInputSchema,
    outputSchema: SummarizeAdResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
