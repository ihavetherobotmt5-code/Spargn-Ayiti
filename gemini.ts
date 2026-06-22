import type { Analysis } from '../types';
import {
  extractKeyFrames,
  shouldCompressVideo,
  type VideoMetadata
} from './videoUtils';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const MAX_VIDEO_DIRECT_UPLOAD = 20 * 1024 * 1024;

const getMimeType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
  };
  return mimeTypes[extension || ''] || file.type;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const SYSTEM_PROMPT = `You are an expert media analyst specializing in content creation, SEO optimization, and social media marketing. Analyze the provided image or video and generate a comprehensive content package.

You MUST respond with ONLY a valid JSON object with NO markdown formatting, NO code blocks, NO additional text before or after. The JSON must have this exact structure:

{
  "imageDescription": "A detailed description of the visual content",
  "seoTitle": "SEO-optimized title (max 60 characters)",
  "seoDescription": "SEO meta description (max 160 characters)",
  "keywords": ["keyword1", "keyword2", ...],
  "hashtags": ["hashtag1", "hashtag2", ...],
  "instagramCaption": "Engaging Instagram caption with emojis and hashtags",
  "tiktokCaption": "Short, catchy TikTok caption with trending hashtags",
  "facebookCaption": "Facebook post with engaging hook and call to action",
  "pinterestDescription": "Pinterest-optimized description with keywords",
  "xPost": "Twitter/X post (max 280 characters)",
  "redditPost": "Reddit-style post with title and body text",
  "youtubeTitle": "YouTube video title (max 100 characters)",
  "youtubeDescription": "YouTube description with timestamps and CTAs",
  "redbubbleTitle": "Redbubble product title (max 50 characters)",
  "etsyTitle": "Etsy listing title (max 140 characters)",
  "aiRecreationPrompt": "Detailed prompt to recreate this image using AI image generation"
}

Requirements:
- keywords: 15 relevant keywords
- hashtags: exactly 20 hashtags (without # symbol, just the words)
- All content should be optimized for maximum engagement and discoverability
- For videos, describe the key visual elements and action
- The aiRecreationPrompt should be detailed enough to generate a similar image using tools like Midjourney, DALL-E, or Stable Diffusion`;

async function analyzeWithFrames(
  frames: { dataUrl: string; timestamp: number }[],
  apiKey: string,
  _onProgress: (progress: number) => void
): Promise<Record<string, unknown>> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: SYSTEM_PROMPT },
  ];

  for (const frame of frames) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frame.dataUrl,
      },
    });
    parts.push({
      text: `Frame at ${frame.timestamp.toFixed(1)} seconds`,
    });
  }

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;

    if (response.status === 400) {
      throw new Error('Invalid request. Please check your API key and try again.');
    } else if (response.status === 403) {
      throw new Error('API key is invalid or has insufficient permissions. Please check your Gemini API key.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (response.status >= 500) {
      throw new Error('Gemini API is currently unavailable. Please try again later.');
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API. Please try again.');
  }

  const responseText = data.candidates[0].content.parts[0].text;

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

async function analyzeWithVideo(
  file: File,
  apiKey: string,
  _onProgress: (progress: number) => void
): Promise<Record<string, unknown>> {
  const base64Data = await fileToBase64(file);
  const mimeType = getMimeType(file);

  const requestBody = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;

    if (response.status === 400) {
      throw new Error('Invalid request. Please check your API key and try again.');
    } else if (response.status === 403) {
      throw new Error('API key is invalid or has insufficient permissions. Please check your Gemini API key.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (response.status >= 500) {
      throw new Error('Gemini API is currently unavailable. Please try again later.');
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API. Please try again.');
  }

  const responseText = data.candidates[0].content.parts[0].text;

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export async function analyzeMedia(
  file: File,
  apiKey: string,
  onProgress: (progress: number) => void,
  videoMetadata?: VideoMetadata
): Promise<Analysis> {
  try {
    onProgress(10);

    const isVideo = file.type.startsWith('video/');
    let parsedResponse: Record<string, unknown>;

    if (isVideo) {
      if (shouldCompressVideo(file)) {
        onProgress(15);
        const frames = await extractKeyFrames(file);
        onProgress(30);

        parsedResponse = await analyzeWithFrames(frames, apiKey, onProgress);
        onProgress(80);
      } else if (file.size > MAX_VIDEO_DIRECT_UPLOAD) {
        onProgress(15);
        const frames = await extractKeyFrames(file);
        onProgress(30);

        parsedResponse = await analyzeWithFrames(frames, apiKey, onProgress);
        onProgress(80);
      } else {
        onProgress(20);
        parsedResponse = await analyzeWithVideo(file, apiKey, onProgress);
        onProgress(80);
      }
    } else {
      const base64Data = await fileToBase64(file);
      const mimeType = getMimeType(file);

      onProgress(20);

      const requestBody = {
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      };

      onProgress(30);

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      onProgress(50);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;

        if (response.status === 400) {
          throw new Error('Invalid request. Please check your API key and try again.');
        } else if (response.status === 403) {
          throw new Error('API key is invalid or has insufficient permissions. Please check your Gemini API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error('Gemini API is currently unavailable. Please try again later.');
        }

        throw new Error(errorMessage);
      }

      onProgress(70);

      const data = await response.json();

      onProgress(80);

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API. Please try again.');
      }

      const responseText = data.candidates[0].content.parts[0].text;

      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        throw new Error('Failed to parse AI response. Please try again.');
      }
    }

    onProgress(90);

    const id = crypto.randomUUID();
    const fileUrl = URL.createObjectURL(file);

    const analysis: Analysis = {
      id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl,
      createdAt: new Date().toISOString(),
      imageDescription: parsedResponse.imageDescription as string || '',
      seoTitle: parsedResponse.seoTitle as string || '',
      seoDescription: parsedResponse.seoDescription as string || '',
      keywords: parsedResponse.keywords as string[] || [],
      hashtags: parsedResponse.hashtags as string[] || [],
      instagramCaption: parsedResponse.instagramCaption as string || '',
      tiktokCaption: parsedResponse.tiktokCaption as string || '',
      facebookCaption: parsedResponse.facebookCaption as string || '',
      pinterestDescription: parsedResponse.pinterestDescription as string || '',
      xPost: parsedResponse.xPost as string || '',
      redditPost: parsedResponse.redditPost as string || '',
      youtubeTitle: parsedResponse.youtubeTitle as string || '',
      youtubeDescription: parsedResponse.youtubeDescription as string || '',
      redbubbleTitle: parsedResponse.redbubbleTitle as string || '',
      etsyTitle: parsedResponse.etsyTitle as string || '',
      aiRecreationPrompt: parsedResponse.aiRecreationPrompt as string || '',
    };

    if (videoMetadata) {
      analysis.duration = videoMetadata.duration;
      analysis.frameRate = videoMetadata.frameRate;
    }

    onProgress(100);

    return analysis;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
