'use client';

import AudioPlayer from '@/containers/AudioPlayer';
import ExampleAudio from '@/containers/ExampleAudio';
import useWaveform from '@/hooks/useWaveform';
import React, { useState } from 'react';

export default function Home() {
  const { visualizeAudio, data } = useWaveform();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState('');
  const [name, setName] = useState('');

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files;
    if (selectedFile && selectedFile[0]) {
      setName(selectedFile[0].name);
      setSelectedFile(selectedFile[0]);
      visualizeAudio(selectedFile[0]);
      const newURL = URL.createObjectURL(selectedFile[0]);
      setAudioURL(newURL);
    }
  };
  return (
    <div className='flex flex-col gap-20 m-20 max-w-[800px] justify-center'>
      <ExampleAudio />
      <fieldset>
        <label
          className=' rounded-lg p-3 bg-[#FF4700] text-white cursor-pointer hover:opacity-90 ease-in-out transition-all'
          htmlFor='upload-audio'
        >
          Upload Audio
        </label>

        <input
          type='file'
          name='player'
          id='upload-audio'
          accept='audio/*'
          onChange={onChangeHandler}
          style={{ display: 'none' }}
        />
      </fieldset>
      {selectedFile && <AudioPlayer data={data} url={audioURL} name={name} />}
    </div>
  );
}
