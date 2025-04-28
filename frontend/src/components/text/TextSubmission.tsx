import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

interface TextSubmissionProps {
  onSubmit: (text: string) => void;
}

const TextSubmission: React.FC<TextSubmissionProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const maxWords = 3000;

  const countWords = (str: string) => {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = () => {
    const wordCount = countWords(text);
    if (wordCount > maxWords) {
      setError(`Please limit your submission to ${maxWords} words. Current count: ${wordCount}`);
      return;
    }
    onSubmit(text);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const wordCount = countWords(newText);
    if (wordCount > maxWords) {
      setError(`Word limit exceeded. Please remove ${wordCount - maxWords} words.`);
    } else {
      setError(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <textarea
          className="w-full h-64 p-4 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Type your submission here..."
          value={text}
          onChange={handleChange}
        />
        <div className="mt-2 flex justify-between items-center text-sm text-slate-600">
          <span>Word count: {countWords(text)} / {maxWords}</span>
          {error && (
            <span className="text-red-600">{error}</span>
          )}
        </div>
      </div>

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!!error || text.trim().length === 0}
        fullWidth
      >
        Submit Text
      </Button>
    </div>
  );
};

export default TextSubmission;