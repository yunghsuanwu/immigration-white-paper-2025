
export const processingSteps = ['uploading', 'transcribing', 'preparing', 'completed'];

export type ProcessingStep = typeof processingSteps[number] | "error";

export interface AudioSubmission {
  id: string;
  contentType: string;
  status?: ProcessingStep;
  recording?: Blob;
  transcript?: string;
  greenpaper?: string;
  emotionalAnalysis?: string;
  email?: string;
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