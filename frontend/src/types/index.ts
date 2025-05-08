
export const processingSteps = ['transcribing', 'greenpaper', 'email', 'completed'];

export type ProcessingStep = typeof processingSteps[number] | "error";

export interface AudioSubmission {
  id: string;
  status: ProcessingStep;
  recording?: Blob;
  transcript?: string;
  emotionalAnalysis?: string;
  greenpaper?: string;
  email?: string;
  filteredResponse?: string;
  createdAt?: Date;
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