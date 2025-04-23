'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {analyzeResumeAgainstJobDescription} from '@/ai/flows/ats-analysis';
import {getSkillRecommendations} from '@/ai/flows/skill-recommendations';
import {generateResumeImprovementSuggestions} from '@/ai/flows/resume-improvement-suggestions';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {Info} from "lucide-react"

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [resumeMatchScore, setResumeMatchScore] = useState<number | null>(null);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [skillRecommendations, setSkillRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setResumeFile(event.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast({
        title: 'Error',
        description: 'Please upload a resume.',
        variant: 'destructive',
      });
      return;
    }
    if (!jobDescription) {
      toast({
        title: 'Error',
        description: 'Please enter a job description.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const atsAnalysisResult = await analyzeResumeAgainstJobDescription({
        resume: resumeFile,
        jobDescription: jobDescription,
      });

      setAtsScore(atsAnalysisResult.atsCompatibilityScore);
      setResumeMatchScore(atsAnalysisResult.resumeToJobDescriptionMatchScore);
      setImprovementSuggestions(atsAnalysisResult.resumeImprovementSuggestions);

      const skillRecommendationsResult = await getSkillRecommendations({
        jobDescription: jobDescription,
      });
      setSkillRecommendations(skillRecommendationsResult.skills);
      toast({
        title: 'Success',
        description: 'Analysis complete!',
      });
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Error',
        description: 'Analysis failed. Please try again. ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-4 text-center">ResumeAce</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Resume Analysis</CardTitle>
          <CardDescription>Upload your resume and paste the job description to get an ATS compatibility score and improvement suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="resume-upload" className="text-sm font-medium">
              Upload Resume (PDF):
            </label>
            <Input id="resume-upload" type="file" accept=".pdf" onChange={handleResumeUpload} className="rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="job-description" className="text-sm font-medium">
              Job Description:
            </label>
            <Textarea
              id="job-description"
              placeholder="Paste job description here"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="rounded-md"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="bg-teal-500 hover:bg-teal-700 text-white font-bold rounded-md py-2 px-4">
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </CardContent>
      </Card>

      {atsScore !== null && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>ATS Compatibility Score</CardTitle>
            <CardDescription>Your resume's compatibility score with the job description.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-500">{atsScore}%</p>
          </CardContent>
        </Card>
      )}

        {resumeMatchScore !== null && (
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Resume to Job Description Match Score</CardTitle>
                    <CardDescription>How well your resume matches the job description.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-teal-500">{resumeMatchScore}%</p>
                </CardContent>
            </Card>
        )}

      {improvementSuggestions.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Resume Improvement Suggestions</CardTitle>
            <CardDescription>Suggestions to improve your resume's ATS compatibility.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="mb-2">{suggestion}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {skillRecommendations.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Skill Recommendations</CardTitle>
            <CardDescription>Skills you should acquire based on the job description.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {skillRecommendations.map((skill, index) => (
                <li key={index} className="mb-2">{skill}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
        <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Disclaimer</AlertTitle>
            <AlertDescription>
                This tool provides an estimate based on AI analysis. It should not be considered as definitive advice.
            </AlertDescription>
        </Alert>
    </div>
  );
}
