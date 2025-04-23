'use client';

import React, {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {analyzeResumeAgainstJobDescription} from '@/ai/flows/ats-analysis';
import {getSkillRecommendations} from '@/ai/flows/skill-recommendations';
import {generateResumeImprovementSuggestions} from '@/ai/flows/resume-improvement-suggestions';
import {useToast} from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

const BouncingResume = () => {
  const [position, setPosition] = useState({y: 0});
  const [direction, setDirection] = useState(1); // 1 for down, -1 for up

  useEffect(() => {
    const animationFrame = () => {
      setPosition(prevPosition => {
        let newY = prevPosition.y + direction * 2; // Adjust speed here

        // Reverse direction when hitting top or bottom
        if (newY > 100) {
          setDirection(-1);
          newY = 100;
        } else if (newY < -20) {
          setDirection(1);
          newY = -20;
        }

        return { y: newY };
      });

      requestAnimationFrame(animationFrame);
    };

    const animationId = requestAnimationFrame(animationFrame);

    return () => cancelAnimationFrame(animationId);
  }, [direction]);

  return (
    <FileText
      size={60}
      style={{
        position: 'relative',
        top: `${position.y}px`,
        transition: 'top 0.1s ease-in-out',
        animation: 'shake 0.8s ease-in-out infinite',
      }}
    />
  );
};

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background relative overflow-hidden">
      <div className="mb-8 relative z-10">
        <h1 className="text-5xl font-bold text-center text-foreground drop-shadow-md">
          ResAce
        </h1>
      </div>

      <Card className="w-full max-w-md bg-card shadow-2xl rounded-2xl relative z-10">
        <CardContent className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="resume-upload"
              className="text-sm font-medium text-foreground"
            >
              Upload Resume (PDF):
            </label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="rounded-md shadow-sm bg-input text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="job-description"
              className="text-sm font-medium text-foreground"
            >
              Job Description:
            </label>
            <Textarea
              id="job-description"
              placeholder="Enter job description here"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="rounded-md shadow-sm bg-input text-foreground"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold rounded-md py-3 shadow-md hover:bg-primary/80"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <BouncingResume />
              </div>
            ) : (
              'Analyze'
            )}
          </Button>
        </CardContent>
      </Card>

      {atsScore !== null && (
        <Card className="w-full max-w-md mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl">ATS Compatibility Score</CardTitle>
            <CardDescription>
              Your resume's compatibility score with the job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{atsScore}%</p>
          </CardContent>
        </Card>
      )}

      {resumeMatchScore !== null && (
        <Card className="w-full max-w-md mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl">
              Resume to Job Description Match Score
            </CardTitle>
            <CardDescription>
              How well your resume matches the job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {resumeMatchScore}%
            </p>
          </CardContent>
        </Card>
      )}

      {improvementSuggestions.length > 0 && (
        <Card className="w-full max-w-md mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl">
              Resume Improvement Suggestions
            </CardTitle>
            <CardDescription>
              Suggestions to improve your resume's ATS compatibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="mb-2">
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {skillRecommendations.length > 0 && (
        <Card className="w-full max-w-md mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl">Skill Recommendations</CardTitle>
            <CardDescription>
              Skills you should acquire based on the job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {skillRecommendations.map((skill, index) => (
                <li key={index} className="mb-2">
                  {skill}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


