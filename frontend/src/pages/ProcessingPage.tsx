import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { AudioSubmission, ProcessingStep, processingSteps } from '../types';

const ProcessingPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('transcribing');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const pollStatus = useCallback(async (submissionId: string) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const response = await fetch(`${backendUrl}/status/${submissionId}`);
    if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  }, [submissionId]);

  useEffect(() => {
    if (!submissionId) {
      return;
    }
    let intervalId: number;

    const pollAndProcess = async () => {
      try {
          const submission = await pollStatus(submissionId) as AudioSubmission;
          updateSubmission(submission);
          
          // Update progress based on status
          switch (submission.status) {
            case 'transcribing': setProgress(25); break;
            case 'greenpaper': setProgress(50); break;
            case 'email': setProgress(75); break;
            case 'completed': setProgress(100); break;
            default: setProgress(0); // Or handle other statuses
          }

          // If completed or error, clear interval and navigate
          if (submission.status === 'completed' || submission.status === 'error') {
            clearInterval(intervalId);
            if (submission.status === 'completed') {
              // Automatically navigate to the submission page after a short delay
              setTimeout(() => {
                navigate(`/submission/${submissionId}`);
              }, 1500);
            }
          }
      } catch (e) {
        setError('Submission not found. Please try recording again.');
        setCurrentStep('error');
      }
    };

    intervalId = setInterval(pollAndProcess, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [submissionId]);
  
  const updateSubmission = (updatedSubmission: AudioSubmission) => {
    setCurrentStep(updatedSubmission.status);
    // Update in sessionStorage (without the blob)
    const storageVersion = {
      ...updatedSubmission,
      recording: null
    };
    sessionStorage.setItem(`submission_${submissionId}`, JSON.stringify(storageVersion));
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Processing Your Submission</h1>
        <p className="text-lg text-slate-600">
          We're turning your audio recording into structured responses. This may take a moment.
        </p>
      </div>
      
      <Card>
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${currentStep === 'error' ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="space-y-6">
              <ProcessingStepItem 
                title="Transcribing your audio" 
                status={getStepStatus('transcribing', currentStep)}
                icon={<Loader2 className="h-6 w-6 animate-spin" />}
                completedIcon={<CheckCircle className="h-6 w-6 text-green-500" />}
              />
              
              <ProcessingStepItem 
                title="Preparing greenpaper submission" 
                status={getStepStatus('greenpaper', currentStep)}
                icon={<Loader2 className="h-6 w-6 animate-spin" />}
                completedIcon={<CheckCircle className="h-6 w-6 text-green-500" />}
              />
              
              <ProcessingStepItem 
                title="Preparing email to MP" 
                status={getStepStatus('email', currentStep)}
                icon={<Loader2 className="h-6 w-6 animate-spin" />}
                completedIcon={<CheckCircle className="h-6 w-6 text-green-500" />}
              />
              
            </div>
            
            {currentStep === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-red-800 font-medium">Processing Error</h3>
                    <p className="text-red-700 mt-1">{error || 'An unexpected error occurred.'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center animate-fadeIn">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-green-800 font-medium text-lg">Processing Complete!</h3>
                <p className="text-green-700 mt-1">
                  Your submission has been successfully processed. Redirecting you to your results...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProcessingStepItemProps {
  title: string;
  status: 'waiting' | 'in-progress' | 'completed';
  icon: React.ReactNode;
  completedIcon: React.ReactNode;
}

const ProcessingStepItem: React.FC<ProcessingStepItemProps> = ({ 
  title, 
  status, 
  icon, 
  completedIcon 
}) => {
  return (
    <div className="flex items-center">
      <div className="mr-4">
        {status === 'completed' ? completedIcon : status === 'in-progress' ? icon : (
          <div className="h-6 w-6 rounded-full border-2 border-slate-300"></div>
        )}
      </div>
      <span className={`
        font-medium
        ${status === 'waiting' ? 'text-slate-400' : ''}
        ${status === 'in-progress' ? 'text-blue-700' : ''}
        ${status === 'completed' ? 'text-slate-800' : ''}
      `}>
        {title}
      </span>
    </div>
  );
};

function getStepStatus(
  step: ProcessingStep, 
  currentStep: ProcessingStep
): 'waiting' | 'in-progress' | 'completed' {
  
  const stepIndex = processingSteps.indexOf(step);
  const currentIndex = processingSteps.indexOf(currentStep);
  
  if (stepIndex < currentIndex) {
    return 'completed';
  } else if (stepIndex === currentIndex) {
    return 'in-progress';
  } else {
    return 'waiting';
  }
}

export default ProcessingPage;