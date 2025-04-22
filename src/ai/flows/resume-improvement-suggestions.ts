'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating resume improvement suggestions based on a job description.
 *
 * - generateResumeImprovementSuggestions - A function that generates resume improvement suggestions.
 * - ResumeImprovementSuggestionsInput - The input type for the generateResumeImprovementSuggestions function.
 * - ResumeImprovementSuggestionsOutput - The return type for the generateResumeImprovementSuggestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ResumeImprovementSuggestionsInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description text.'),
});
export type ResumeImprovementSuggestionsInput = z.infer<
  typeof ResumeImprovementSuggestionsInputSchema
>;

const ResumeImprovementSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(
      z.string().describe('A suggestion for improving the resume based on the job description.')
    )
    .describe('A list of suggestions for improving the resume.'),
});
export type ResumeImprovementSuggestionsOutput = z.infer<
  typeof ResumeImprovementSuggestionsOutputSchema
>;

export async function generateResumeImprovementSuggestions(
  input: ResumeImprovementSuggestionsInput
): Promise<ResumeImprovementSuggestionsOutput> {
  return resumeImprovementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeImprovementSuggestionsPrompt',
  input: {
    schema: z.object({
      resumeText: z.string().describe('The text content of the resume.'),
      jobDescription: z.string().describe('The job description text.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions:
        z.array(z.string().describe('A suggestion for improving the resume based on the job description.')).describe('A list of suggestions for improving the resume based on the job description.'),
    }),
  },
  prompt: `You are an expert resume writer. You will be provided with a resume and a job description. Your goal is to provide a list of suggestions for improving the resume so that it is a better fit for the job description. The suggestions should be specific and actionable.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Suggestions:
`,
});

const resumeImprovementSuggestionsFlow = ai.defineFlow<
  typeof ResumeImprovementSuggestionsInputSchema,
  typeof ResumeImprovementSuggestionsOutputSchema
>({
  name: 'resumeImprovementSuggestionsFlow',
  inputSchema: ResumeImprovementSuggestionsInputSchema,
  outputSchema: ResumeImprovementSuggestionsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
    return output!;
});
