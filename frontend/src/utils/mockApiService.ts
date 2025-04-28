import { EmotionalAnalysisResult } from '../types';

// In a real implementation, these would be API calls to backend services
// For demo purposes, we'll simulate the AI processing with mock functions

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, return a mock transcript
  return `I'm really worried about these new proposals. The pathways to work green paper seems to be pushing people into work without understanding the barriers we face. I've been on PIP for three years due to my condition, and the idea that I might lose that support is terrifying. The government needs to listen to disabled people before making these changes.`;
};

export const analyzeEmotion = async (transcript: string): Promise<EmotionalAnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple keyword-based analysis for demo
  const lowerTranscript = transcript.toLowerCase();
  
  if (lowerTranscript.includes('worried') || lowerTranscript.includes('anxious') || lowerTranscript.includes('terrifying')) {
    return {
      emotion: 'anxious',
      confidence: 0.85,
      summary: 'Based on your submission, it seems you are feeling anxious about the proposed changes and how they might affect your support.'
    };
  } else if (lowerTranscript.includes('angry') || lowerTranscript.includes('unfair') || lowerTranscript.includes('outrageous')) {
    return {
      emotion: 'angry',
      confidence: 0.78,
      summary: 'Based on your submission, it seems you are feeling angry about the proposed changes and believe they are unfair.'
    };
  } else if (lowerTranscript.includes('hopeful') || lowerTranscript.includes('positive') || lowerTranscript.includes('better')) {
    return {
      emotion: 'hopeful',
      confidence: 0.67,
      summary: 'Based on your submission, it seems you are feeling somewhat hopeful about aspects of the proposed changes.'
    };
  } else {
    return {
      emotion: 'concerned',
      confidence: 0.72,
      summary: 'Based on your submission, it seems you are feeling concerned about how the Green Paper proposals might impact people receiving benefits.'
    };
  }
};

export const formatForConsultation = async (transcript: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo purposes, format the transcript into a structured response
  return `
Dear Department for Work and Pensions,

RE: Response to the Pathways to Work Green Paper

I am writing to provide my personal feedback on the recently published Green Paper.

${transcript}

I believe the government should prioritize the following actions:
1. Consult more widely with benefit recipients before implementing changes
2. Ensure any changes maintain adequate financial support for those who need it
3. Focus on removing barriers to work rather than simply cutting support
4. Provide better training and workplace accommodations

I hope you will take these concerns into account before finalizing your approach.

Yours sincerely,
[Name]
`;
};

export const filterAbusiveContent = async (text: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple filter for demo - in production this would use more sophisticated NLP
  const abusiveWords = ['damn', 'hell', 'idiot', 'stupid', 'bloody'];
  
  let filteredText = text;
  abusiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '[removed]');
  });
  
  return filteredText;
};