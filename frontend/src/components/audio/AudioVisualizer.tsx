import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  mediaRecorder: MediaRecorder | null;
  isRecording: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ mediaRecorder, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isRecording || !mediaRecorder || !mediaRecorder.stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clear canvas if we're not recording
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaRecorder.stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isRecording) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      
      if (!analyser || !dataArray || !ctx) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Gradient from blue to red based on frequency
        const hue = (i / bufferLength) * 220 + 180; // from 180 (blue) to 400 (red)
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, mediaRecorder]);

  return (
    <div className="w-full h-24 bg-slate-100 rounded-md overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={100} 
        className="w-full h-full"
      />
    </div>
  );
};

export default AudioVisualizer;