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
import {Progress} from '@/components/ui/progress';

const XPProgressBar = () => (
  <div className="xp-loader-container">
    <div className="xp-bar">
      <div className="xp-progress"></div>
    </div>
  </div>
);


const LoadingBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 5;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500"
        style={{width: `${progress}%`}}
      ></div>
    </div>
  );
};

const AnimatedText = ({text}: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prevText => prevText + text[index]);
        setIndex(prevIndex => prevIndex + 1);
      }, 50);

      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayText('');
        setIndex(0);
      }, 2000);

      return () => clearTimeout(resetTimeout);
    }
  }, [index, text]);

  return <span className="font-bold text-foreground">{displayText}</span>;
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center">
    <LoadingBar />
    <AnimatedText text="Analyzing..." />
  </div>
);

const AnalyzingProgressBar = ({progress}: { progress: number }) => (
  <div className="flex flex-col items-center">
    <Progress value={progress} className="w-full max-w-md mb-2" />
    <p className="text-sm text-muted-foreground">Analyzing... {progress}%</p>
  </div>
);

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [resumeMatchScore, setResumeMatchScore] = useState<number | null>(null);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [skillRecommendations, setSkillRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0); // New state for analysis progress
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
      setAnalysisProgress(0); // Reset progress on new analysis
    try {
      // Simulate analysis progress
      const interval = setInterval(() => {
        setAnalysisProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

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
         clearInterval(interval);
        setAnalysisProgress(100); // Ensure it reaches 100%
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Error',
        description: 'Analysis failed. Please try again. ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
         setAnalysisProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 relative overflow-hidden">
      <div className="mb-8 relative z-10">
        <h1 className="text-5xl font-bold text-center text-foreground drop-shadow-md" style={{ fontFamily: 'Nova Mono, monospace' }}>
          ResAce
        </h1>
      </div>

      <Card className="w-full max-w-3xl bg-card shadow-2xl rounded-2xl relative z-10">
        <CardContent className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="resume-upload"
              className="text-lg font-medium text-foreground"
            >
              Upload Resume (PDF):
            </label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="rounded-md shadow-sm bg-input text-foreground text-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="job-description"
              className="text-lg font-medium text-foreground"
            >
              Job Description:
            </label>
            <Textarea
              id="job-description"
              placeholder="Enter job description here"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="rounded-md shadow-sm bg-input text-foreground text-lg"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="button bg-primary text-primary-foreground font-bold rounded-md py-3 shadow-md hover:bg-primary/80 text-lg transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <AnalyzingProgressBar progress={analysisProgress} />
              </div>
            ) : (
              'Analyze'
            )}
          </Button>
        </CardContent>
      </Card>

      {atsScore !== null && (
        <Card className="w-full max-w-3xl mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-3xl">ATS Compatibility Score</CardTitle>
            <CardDescription className="text-lg">
              Your resume's compatibility score with the job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{atsScore}%</p>
          </CardContent>
        </Card>
      )}

      {resumeMatchScore !== null && (
        <Card className="w-full max-w-3xl mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-3xl">
              Resume to Job Description Match Score
            </CardTitle>
            <CardDescription className="text-lg">
              How well your resume matches the job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {resumeMatchScore}%
            </p>
          </CardContent>
        </Card>
      )}

      {improvementSuggestions.length > 0 && (
        <Card className="w-full max-w-3xl mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-3xl">
              Resume Improvement Suggestions
            </CardTitle>
            <CardDescription className="text-lg">
              Suggestions to improve your resume's ATS compatibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="mb-2 text-lg">
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {skillRecommendations.length > 0 && (
        <Card className="w-full max-w-3xl mt-8 bg-card shadow-2xl rounded-2xl relative z-10">
          <CardHeader>
            <CardTitle className="text-3xl">Skill Recommendations</CardTitle>
            <CardDescription className="text-lg">
              Skills you should acquire based on the job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {skillRecommendations.map((skill, index) => (
                <li key={index} className="mb-2 text-lg">
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
