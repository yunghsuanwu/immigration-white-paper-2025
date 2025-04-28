import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Mic, Upload, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import AudioRecorder from '../components/audio/AudioRecorder';
import AudioUploader from '../components/audio/AudioUploader';
import TextSubmission from '../components/text/TextSubmission';
import { AudioSubmission } from '../types';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'text'>('record');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRecordingComplete = async (recording: Blob) => {
    setIsSubmitting(true);
    try {
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
      
      sessionStorage.setItem(`submission_${submissionId}`, JSON.stringify({
        ...newSubmission,
        recording: null
      }));
      (window as any).submissionBlob = recording;
      navigate(`/processing/${submissionId}`);
    } catch (error) {
      console.error('Error processing recording:', error);
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsSubmitting(true);
    try {
      const submissionId = uuidv4();
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
      
      sessionStorage.setItem(`submission_${submissionId}`, JSON.stringify({
        ...newSubmission,
        recording: null
      }));
      (window as any).submissionBlob = fileBlob;
      navigate(`/processing/${submissionId}`);
    } catch (error) {
      console.error('Error processing file upload:', error);
      setIsSubmitting(false);
    }
  };

  const handleTextSubmit = (text: string) => {
    // Handle text submission similar to audio
    console.log('Text submitted:', text);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-purple-900 text-white rounded-xl overflow-hidden shadow-xl animate-fadeIn">
        <div className="relative px-6 py-12 sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-purple-800 opacity-50"></div>
          <div className="relative max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Have Your Say on the UK's Pathways to Work Green Paper
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              Your voice matters. The government's proposed changes to health and disability benefits could affect millions. Share your experience and help shape the future.
            </p>
          </div>
        </div>
      </section>

      {/* Submission Section */}
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
            <Button 
              variant={activeTab === 'text' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('text')}
              icon={<HelpCircle className="h-5 w-5" />}
            >
              Text Submission
            </Button>
          </div>
          
          {activeTab === 'record' && (
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          )}
          
          {activeTab === 'upload' && (
            <AudioUploader onFileUpload={handleFileUpload} />
          )}
          
          {activeTab === 'text' && (
            <TextSubmission onSubmit={handleTextSubmit} />
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-4">
        <div className="shrink-0">
          <HelpCircle className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h3 className="font-medium text-purple-800 mb-1">Tips for a great submission</h3>
          <ul className="list-disc list-inside text-purple-700 space-y-1 text-sm">
            <li>Speak clearly and at a normal pace</li>
            <li>Share your personal experiences with the benefits system</li>
            <li>Explain how the proposed changes would affect you</li>
            <li>Mention any alternatives that you think would work better</li>
            <li>Keep your recording under 5 minutes for best results</li>
          </ul>
        </div>
      </div>

      {/* Note: The following sections can be manually modified in the code */}
      {/* Important Questions to Consider: Lines 280-310 */}
      {/* How It Works: Lines 313-359 */}
      {/* Why Speaking Up Matters: Lines 362-386 */}
    </div>
  );
};

export default HomePage;