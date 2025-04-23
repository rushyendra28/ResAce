'use server';

/**
 * @fileOverview Analyzes a resume against a job description to provide an ATS compatibility score, a resume to job description match score, and recommendations.
 *
 * - analyzeResumeAgainstJobDescription - A function that analyzes the resume and job description.
 * - ATSAnalysisInput - The input type for the analyzeResumeAgainstJobDescription function.
 * - ATSAnalysisOutput - The return type for the analyzeResumeAgainstJobDescription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {PdfContent, parsePdf} from '@/services/pdf-parser';

const ATSAnalysisInputSchema = z.object({
  resume: z.instanceof(File).describe('The resume file in PDF format.'),
  jobDescription: z.string().describe('The job description text.'),
});
export type ATSAnalysisInput = z.infer<typeof ATSAnalysisInputSchema>;

const ATSAnalysisOutputSchema = z.object({
  atsCompatibilityScore: z.number().describe('The ATS compatibility score (0-100) indicating how well the resume is parsed by ATS systems.'),
  resumeToJobDescriptionMatchScore: z.number().describe('The score (0-100) representing how well the resume matches the job description.'),
  resumeImprovementSuggestions: z.array(z.string()).describe('Suggestions for resume improvements to better match the job description.'),
});
export type ATSAnalysisOutput = z.infer<typeof ATSAnalysisOutputSchema>;

export async function analyzeResumeAgainstJobDescription(
  input: ATSAnalysisInput
): Promise<ATSAnalysisOutput> {
  return atsAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'atsAnalysisPrompt',
  input: {
    schema: z.object({
      resumeText: z.string().describe('The text content of the resume.'),
      jobDescription: z.string().describe('The job description text.'),
    }),
  },
  output: {
    schema: z.object({
      atsCompatibilityScore: z.number().describe('The ATS compatibility score (0-100) indicating how well the resume is parsed by ATS systems.'),
      resumeToJobDescriptionMatchScore: z.number().describe('The score (0-100) representing how well the resume matches the job description. Base the score on presence of keywords, skills, and experiences mentioned in the job description'),
      resumeImprovementSuggestions: z.array(z.string()).describe('Suggestions for resume improvements to better match the job description.'),
    }),
  },
  prompt: `You are an expert in Applicant Tracking Systems (ATS) and resume optimization.

Analyze the following resume against the job description to provide an ATS compatibility score, a resume to job description match score, and suggestions for improvement.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}

Provide the ATS compatibility score as a number between 0 and 100. This score indicates how well the resume is parsed by ATS systems. Consider factors such as the resume's formatting, use of standard section headings, and avoidance of unusual characters or elements that may confuse the parser. A higher score indicates better compatibility.

Provide the resume to job description match score as a number between 0 and 100. This score represents how well the resume matches the job description. Base the score on presence of keywords, skills, and experiences mentioned in the job description. A higher score indicates a better match.

Provide the resume improvement suggestions as a list of strings. These suggestions should be specific and actionable, aimed at improving the resume's match to the job description. Focus on areas where the resume is lacking in terms of keywords, skills, or experience.
`,
});

const atsAnalysisFlow = ai.defineFlow<
  typeof ATSAnalysisInputSchema,
  typeof ATSAnalysisOutputSchema
>(
  {
    name: 'atsAnalysisFlow',
    inputSchema: ATSAnalysisInputSchema,
    outputSchema: ATSAnalysisOutputSchema,
  },
  async input => {
    const pdfContent: PdfContent = await parsePdf(input.resume);
    const {output} = await prompt({
      resumeText: pdfContent.textContent,
      jobDescription: input.jobDescription,
    });
    return output!;
  }
);
