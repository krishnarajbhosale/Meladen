import { useEffect, useRef } from 'react';

interface VideoSource {
  src: string;
  type?: string;
}

interface AutoplayVideoProps {
  sources: VideoSource[];
  className?: string;
  poster?: string;
}

export default function AutoplayVideo({ sources, className, poster }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {});
    };

    tryPlay();

    const frameId = window.requestAnimationFrame(tryPlay);
    const timeoutId = window.setTimeout(tryPlay, 250);

    video.addEventListener('loadedmetadata', tryPlay);
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('canplaythrough', tryPlay);
    document.addEventListener('visibilitychange', tryPlay);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      video.removeEventListener('loadedmetadata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('canplaythrough', tryPlay);
      document.removeEventListener('visibilitychange', tryPlay);
    };
  }, [sources]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
      disableRemotePlayback
      disablePictureInPicture
      className={className}
      onLoadedData={(e) => {
        e.currentTarget.muted = true;
        e.currentTarget.defaultMuted = true;
        void e.currentTarget.play().catch(() => {});
      }}
    >
      {sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
}
