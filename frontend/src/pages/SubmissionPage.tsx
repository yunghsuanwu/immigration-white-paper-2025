import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Copy,
  CheckCheck,
  Download,
  Send,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { AudioSubmission } from "../types";

const SubmissionPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<AudioSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the submission from sessionStorage
    const storedSubmission = sessionStorage.getItem(
      `submission_${submissionId}`
    );
    if (!storedSubmission) {
      setError("Submission not found. Please try recording again.");
      return;
    }

    try {
      const parsedSubmission = JSON.parse(storedSubmission) as AudioSubmission;
      setSubmission(parsedSubmission);

      // Parse the emotional analysis
      if (parsedSubmission.emotionalAnalysis) {
        setEmotion(parsedSubmission.emotionalAnalysis);
      }
    } catch (err) {
      console.error("Error loading submission:", err);
      setError("Error loading your submission. Please try recording again.");
    }
  }, [submissionId]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <Link to="/record">
                <Button variant="primary" className="mt-4">
                  Try Again
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-3xl mx-auto text-center p-8">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Loading your submission...</p>
      </div>
    );
  }

  const __getEmotionColor = (emotionType: string | undefined) => {
    switch (emotionType) {
      case "anxious":
        return "text-purple-600";
      case "angry":
        return "text-red-600";
      case "concerned":
        return "text-amber-600";
      case "hopeful":
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  const __getEmotionBgColor = (emotionType: string | undefined) => {
    switch (emotionType) {
      case "anxious":
        return "bg-purple-50 border-purple-100";
      case "angry":
        return "bg-red-50 border-red-100";
      case "concerned":
        return "bg-amber-50 border-amber-100";
      case "hopeful":
        return "bg-green-50 border-green-100";
      default:
        return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Your Response</h1>
        <p className="text-lg text-slate-600">
          We've processed your recording and formatted it into a response
          suitable for the official consultation.
        </p>
      </div>

      {emotion && (
        <Card className="border">
          <CardContent className="p-6">
            <h2 className={`text-xl font-semibold mb-2`}>Emotional Analysis</h2>
            <p className="text-slate-700">{emotion}</p>
          </CardContent>
        </Card>
      )}

      <SummaryCard
        title="Your Greenpaper Response"
        description="This is your response formatted for submission to the government consultation"
        summary={submission.greenpaper}
        downloadFilename="pathways-to-work.txt"
        buttonText="Go to Official Consultation"
        buttonUrl="https://www.gov.uk/government/consultations/pathways-to-work-health-and-disability-green-paper/responding-to-this-consultation"
      />

      <SummaryCard
        title="Your Email to your MP"
        description="This is an email you can send to your MP"
        summary={submission.email}
        downloadFilename="email-to-mp.txt"
        buttonText="Write your MP"
        buttonUrl="https://www.writetothem.com/?a=westminstermp"
      />

      <Card>
        <CardHeader>
          <CardTitle>Original Transcript</CardTitle>
          <CardDescription>
            This is what we transcribed from your audio recording
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            {submission.transcript}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <FileText className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-medium text-blue-800">
              Need to record again?
            </h3>
            <p className="text-blue-700">
              You can make another recording at any time.
            </p>
          </div>
        </div>
        <Link to="/record">
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Make New Recording
          </Button>
        </Link>
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  description,
  summary,
  downloadFilename,
  buttonText,
  buttonUrl,
}: {
  title: string;
  description: string;
  summary?: string;
  downloadFilename: string;
  buttonText: string;
  buttonUrl: string;
}) => {
  if (!summary) {
    return <div />;
  }

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([summary], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description} </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 whitespace-pre-line">
          {summary}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={copyToClipboard}
          icon={
            copied ? (
              <CheckCheck className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )
          }
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </Button>

        <Button
          variant="outline"
          onClick={downloadAsText}
          icon={<Download className="h-5 w-5" />}
        >
          Download as Text
        </Button>

        <Button
          variant="primary"
          icon={<Send className="h-5 w-5" />}
          onClick={() => window.open(buttonUrl, "_blank")}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubmissionPage;
