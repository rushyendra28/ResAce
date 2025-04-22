// SkillRecommendations.ts
'use server';

/**
 * @fileOverview Provides a list of skills the user should acquire based on the job description.
 *
 * - getSkillRecommendations - A function that generates skill recommendations based on a job description.
 * - SkillRecommendationsInput - The input type for the getSkillRecommendations function.
 * - SkillRecommendationsOutput - The return type for the getSkillRecommendations function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SkillRecommendationsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to analyze for skill recommendations.'),
});
export type SkillRecommendationsInput = z.infer<
  typeof SkillRecommendationsInputSchema
>;

const SkillRecommendationsOutputSchema = z.object({
  skills: z
    .array(z.string())
    .describe(
      'A list of skills the user should acquire based on the job description.'
    ),
});
export type SkillRecommendationsOutput = z.infer<
  typeof SkillRecommendationsOutputSchema
>;

export async function getSkillRecommendations(
  input: SkillRecommendationsInput
): Promise<SkillRecommendationsOutput> {
  return skillRecommendationsFlow(input);
}

const skillRecommendationsPrompt = ai.definePrompt({
  name: 'skillRecommendationsPrompt',
  input: {
    schema: z.object({
      jobDescription: z
        .string()
        .describe('The job description to analyze for skill recommendations.'),
    }),
  },
  output: {
    schema: z.object({
      skills: z
        .array(z.string())
        .describe(
          'A list of skills the user should acquire based on the job description.'
        ),
    }),
  },
  prompt: `You are an AI resume expert. Analyze the following job description and provide a list of skills the user should acquire to be a stronger candidate for the job.

Job Description: {{{jobDescription}}}

Skills:`,
});

const skillRecommendationsFlow = ai.defineFlow<
  typeof SkillRecommendationsInputSchema,
  typeof SkillRecommendationsOutputSchema
>({
  name: 'skillRecommendationsFlow',
  inputSchema: SkillRecommendationsInputSchema,
  outputSchema: SkillRecommendationsOutputSchema,
},
async input => {
  const {output} = await skillRecommendationsPrompt(input);
  return output!;
});

