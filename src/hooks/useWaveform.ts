import { useState } from 'react';
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

const useWaveform = () => {
  const [data, setData] = useState<number[]>([]);

  let audioContext: AudioContext;
  if (typeof window !== 'undefined') {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; //for safari browser
    audioContext = new AudioContext();
  }

  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        if (event.target) {
          const arrayBuffer = event.target.result as ArrayBuffer;
          resolve(arrayBuffer);
        }
      };

      reader.onerror = function (event) {
        event.target && reject(event.target.error);
      };

      reader.readAsArrayBuffer(file);
    });
  };
  const visualizeAudio = async (url: string | File) => {
    try {
      if (typeof url === 'string') {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        filterData(audioBuffer);
      } else {
        const arrayBuffer = await fileToArrayBuffer(url);
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        filterData(audioBuffer);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const filterData = (audioBuffer: AudioBuffer) => {
    const rawData = audioBuffer.getChannelData(0);
    const samples = 120;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }
    normalizeData(filteredData);
  };
  const normalizeData = (filteredData: number[]) => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return setData(filteredData.map((n: number) => n * multiplier));
  };

  return { data, visualizeAudio };
};

export default useWaveform;
