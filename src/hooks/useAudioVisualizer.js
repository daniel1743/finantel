import { useEffect, useRef, useState } from 'react';

/**
 * Hook para visualizar ondas de audio en tiempo real
 * Captura la amplitud del micrófono y genera datos para visualización
 */
export const useAudioVisualizer = (stream, isRecording) => {
  const [audioData, setAudioData] = useState(Array(32).fill(0));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Detener visualización
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioData(Array(32).fill(0));
      return;
    }

    // Crear contexto de audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64; // 32 barras de frecuencia
    analyser.smoothingTimeConstant = 0.8; // Suavizado

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    // Función de animación
    const updateAudioData = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Normalizar datos (0-1)
      const normalized = Array.from(dataArrayRef.current).map(value => value / 255);

      setAudioData(normalized);
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };

    updateAudioData();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isRecording]);

  return audioData;
};
