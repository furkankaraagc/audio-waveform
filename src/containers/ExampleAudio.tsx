'use client';
import useWaveform from '@/hooks/useWaveform';
import { useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

const ExampleAudio = () => {
  const url = 'sound.mp3';

  const { visualizeAudio, data } = useWaveform();
  useEffect(() => {
    visualizeAudio(url);
  }, []);

  return <AudioPlayer data={data} url={url} />;
};

export default ExampleAudio;
