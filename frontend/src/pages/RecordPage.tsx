import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Mic, Upload, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import AudioRecorder from '../components/audio/AudioRecorder';
import AudioUploader from '../components/audio/AudioUploader';
import { AudioSubmission } from '../types';

const RecordPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleRecordingComplete = async (recording: Blob) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would upload the recording to a server
      // For demo purposes, we'll just generate a unique ID and store in sessionStorage
      const submissionId = uuidv4();
      
      const newSubmission: AudioSubmission = {
        id: submissionId,
        recording,
        transcript: '',
        emotionalAnalysis: '',
        formattedResponse: '',
        filteredResponse: '',
        createdAt: new Date()
      };
      
      // Store the blob in sessionStorage (in a real app, this would go to a server)
      sessionStorage.setItem(`submission_${submissionId}`, JSON.stringify({
        ...newSubmission,
        recording: null // We can't store the blob directly in sessionStorage
      }));
      
      // Store the actual blob in a global variable (in a real app, this would go to a server)
      (window as any).submissionBlob = recording;
      
      // Navigate to the processing page
      navigate(`/processing/${submissionId}`);
    } catch (error) {
      console.error('Error processing recording:', error);
      setIsSubmitting(false);
      // Handle error (show error message, etc.)
    }
  };
  
  const handleFileUpload = async (file: File) => {
    setIsSubmitting(true);
    
    try {
      // Similar to handleRecordingComplete, but with an uploaded file
      const submissionId = uuidv4();
      
      // Convert File to Blob
      const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      const newSubmission: AudioSubmission = {
        id: submissionId,
        recording: fileBlob,
        transcript: '',
        emotionalAnalysis: '',
        formattedResponse: '',
        filteredResponse: '',
        createdAt: new Date()
      };
      
      // Store the submission in sessionStorage
      sessionStorage.setItem(`submission_${submissionId}`, JSON.stringify({
        ...newSubmission,
        recording: null
      }));
      
      // Store the actual blob
      (window as any).submissionBlob = fileBlob;
      
      // Navigate to the processing page
      navigate(`/processing/${submissionId}`);
    } catch (error) {
      console.error('Error processing file upload:', error);
      setIsSubmitting(false);
      // Handle error
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Share Your Voice</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Record or upload your thoughts about the UK's 'Pathways to Work' Green Paper. 
          Your voice will be transcribed and formatted into a structured response suitable for 
          the official government consultation.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>How would you like to contribute?</CardTitle>
          <CardDescription>Choose the method that works best for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              variant={activeTab === 'record' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('record')}
              icon={<Mic className="h-5 w-5" />}
            >
              Record Directly
            </Button>
            <Button 
              variant={activeTab === 'upload' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('upload')}
              icon={<Upload className="h-5 w-5" />}
            >
              Upload Audio File
            </Button>
          </div>
          
          {activeTab === 'record' ? (
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          ) : (
            <AudioUploader onFileUpload={handleFileUpload} />
          )}
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-4">
        <div className="shrink-0">
          <HelpCircle className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 className="font-medium text-blue-800 mb-1">Tips for a great submission</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
            <li>Speak clearly and at a normal pace</li>
            <li>Share your personal experiences with the benefits system</li>
            <li>Explain how the proposed changes would affect you</li>
            <li>Mention any alternatives that you think would work better</li>
            <li>Keep your recording under 5 minutes for best results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;