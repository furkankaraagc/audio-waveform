'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Props {
  data: number[];
  url: string;
  name?: string;
}

const AudioPlayer = ({ data, url, name }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const columnWidth = canvas.width / data.length;
    const maxDataValue = Math.max(...data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach((value: number, index: number) => {
      const columnHeight = (value / maxDataValue) * canvas.height;
      const x = index * columnWidth;
      const y = canvas.height - columnHeight;

      // ctx.fillRect(x, y, columnWidth, columnHeight);
      ctx.fillStyle = index < progress ? '#FF4700' : 'gray';
      ctx.fillRect(x, y, 3, columnHeight);
    });
  }, [data, progress]);

  useEffect(() => {
    if (audioRef.current?.duration) {
      const duration0 = audioRef.current.duration;
      setDuration(duration0);
    }

    const observer = new ResizeObserver((entries) => {});

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [audioRef]);
  const calculateProgress = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const divWidth = (event.target as HTMLCanvasElement).offsetWidth;
    const clickPosition =
      event.clientX -
      (event.target as HTMLCanvasElement).getBoundingClientRect().left;
    const newProgress = (clickPosition * 100) / divWidth;
    if (audioRef.current) {
      const newCurrentTime = Math.floor((newProgress / 100) * duration);
      setProgress(newProgress);
      setCurrentTime(newCurrentTime);
      audioRef.current.currentTime = newCurrentTime;
    }
  };
  useEffect(() => {
    let intervalVar: NodeJS.Timeout;

    if (isPlaying && progress <= 100) {
      intervalVar = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 5 / duration; // cursor speed
          audioRef.current && setCurrentTime(audioRef.current.currentTime);

          if (audioRef.current?.currentTime === duration) {
            setIsPlaying(false);
          }

          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 50);
    }

    return () => {
      clearInterval(intervalVar);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying && audioRef.current) {
      setIsPlaying(true);

      audioRef.current.play();
    }
    setDragging(true);
    calculateProgress(event);
  };
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging) {
      calculateProgress(event);
    }
  };
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  const calculateTime = (value: number) => {
    const minutes = Math.floor(value / 60);
    const minutes0 = minutes < 10 ? `0${minutes}` : minutes;
    const seconds = Math.floor(value % 60);
    const seconds0 = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes0}:${seconds0}`;
  };
  const handleLoadedMetadata = (
    event: React.SyntheticEvent<HTMLAudioElement>,
  ) => {
    const audioElement = event.currentTarget;
    if (audioElement instanceof HTMLAudioElement) {
      const duration0 = audioElement.duration;
      setDuration(duration0);
    }
  };

  return (
    <div className='border p-4 rounded-lg '>
      <h1 className='pb-4 text-lg font-normal'>{name ? name : 'Demo'}</h1>
      <div className='flex'>
        <button
          className='border w-[60px] h-[60px] p-4 rounded-full   hover:opacity-90 ease-in-out transition-all '
          type='button'
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Image
              className=''
              src={'/pause.png'}
              alt=''
              width={50}
              height={50}
            />
          ) : (
            <Image src={'/play.png'} alt='' width={50} height={50} />
          )}
        </button>
        <div className='flex'>
          <div className=' mt-auto w-[50px] pr-2'>
            {calculateTime(currentTime)}
          </div>
          <div className=' relative w-[500px]'>
            <canvas
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              ref={canvasRef}
              width='500'
              height='100'
              className='border-b-2'
            />

            <div
              style={{ left: `${progress}%`, top: 0 }}
              className='cursor bg-black w-[1px] h-[100px] absolute pointer-events-none'
            ></div>
          </div>

          <div className='mt-auto w-[50px] pl-2'>
            {duration && !isNaN(duration) && calculateTime(duration)}
          </div>
        </div>

        <audio
          onLoadedMetadata={handleLoadedMetadata}
          preload='metadata'
          ref={audioRef}
          src={url}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
