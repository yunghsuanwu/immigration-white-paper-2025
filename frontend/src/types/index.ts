export interface AudioSubmission {
  id: string;
  recording: Blob | null;
  transcript: string;
  emotionalAnalysis: string;
  formattedResponse: string;
  filteredResponse: string;
  createdAt: Date;
}

export interface AudioRecorderProps {
  onRecordingComplete: (recording: Blob) => void;
}

export interface AudioUploaderProps {
  onFileUpload: (file: File) => void;
}

export interface EmotionalAnalysisResult {
  emotion: 'anxious' | 'hopeful' | 'angry' | 'concerned' | 'mixed' | 'neutral';
  confidence: number;
  summary: string;
}