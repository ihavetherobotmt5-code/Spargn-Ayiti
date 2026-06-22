export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  fileSize: number;
}

export interface ExtractedFrame {
  dataUrl: string;
  timestamp: number;
}

const MAX_VIDEO_SIZE_FOR_DIRECT_UPLOAD = 20 * 1024 * 1024;
const MAX_FRAMES_TO_EXTRACT = 8;
const COMPRESSION_QUALITY = 0.8;

export function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;

      let frameRate = 30;
      if ('getVideoPlaybackQuality' in video) {
        const quality = (video as HTMLVideoElement & { getVideoPlaybackQuality: () => { totalVideoFrames: number } }).getVideoPlaybackQuality();
        const totalFrames = quality.totalVideoFrames || 0;
        if (duration > 0 && totalFrames > 0) {
          frameRate = Math.round(totalFrames / duration);
        }
      }

      URL.revokeObjectURL(video.src);

      resolve({
        duration,
        width,
        height,
        frameRate,
        fileSize: file.size,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function extractKeyFrames(file: File): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const frames: ExtractedFrame[] = [];
    const canvas = document.createElement('canvas');

    video.onloadedmetadata = () => {
      const duration = video.duration;

      if (duration <= 0) {
        URL.revokeObjectURL(video.src);
        resolve([]);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const frameCount = Math.min(MAX_FRAMES_TO_EXTRACT, Math.ceil(duration / 2));
      const timestamps: number[] = [];

      for (let i = 0; i < frameCount; i++) {
        const timestamp = (duration / (frameCount + 1)) * (i + 1);
        timestamps.push(timestamp);
      }

      let currentFrameIndex = 0;

      const captureFrame = () => {
        if (currentFrameIndex >= timestamps.length) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }

        video.currentTime = timestamps[currentFrameIndex];
      };

      const onSeeked = () => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);

          const base64Data = dataUrl.split(',')[1];
          frames.push({
            dataUrl: base64Data,
            timestamp: video.currentTime,
          });
        }

        currentFrameIndex++;
        captureFrame();
      };

      video.addEventListener('seeked', onSeeked);

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to extract frames from video'));
      };

      captureFrame();
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for frame extraction'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export function shouldCompressVideo(file: File): boolean {
  return file.size > MAX_VIDEO_SIZE_FOR_DIRECT_UPLOAD;
}

export async function compressVideo(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        URL.revokeObjectURL(video.src);
        return;
      }

      const maxWidth = 1280;
      const maxHeight = 720;
      let targetWidth = video.videoWidth;
      let targetHeight = video.videoHeight;

      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.floor(targetWidth * ratio);
        targetHeight = Math.floor(targetHeight * ratio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const mediaRecorderOptions: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000,
      };

      if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType!)) {
        mediaRecorderOptions.mimeType = 'video/webm';
      }

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
          type: 'video/webm',
        });
        URL.revokeObjectURL(video.src);
        resolve(compressedFile);
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      };

      video.play();
      mediaRecorder.start();

      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          requestAnimationFrame(drawFrame);
        }
      };

      drawFrame();

      video.onended = () => {
        mediaRecorder.stop();
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to compress video'));
    };

    video.src = URL.createObjectURL(file);
  });
}
