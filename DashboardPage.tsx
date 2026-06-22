import { useCallback } from 'react';
import { Sparkles, AlertCircle, Key } from 'lucide-react';
import { useStore } from '../store';
import { MediaPreview } from '../components/MediaPreview';
import { AnalysisCard } from '../components/AnalysisCard';
import { analysisSections } from '../types';
import { analyzeMedia } from '../services/gemini';
import { extractVideoMetadata } from '../services/videoUtils';

interface DashboardPageProps {
  darkMode: boolean;
}

export function DashboardPage({ darkMode }: DashboardPageProps) {
  const {
    currentAnalysis,
    setCurrentAnalysis,
    addAnalysis,
    setIsAnalyzing,
    setAnalysisProgress,
    setError,
    setSuccess,
    isAnalyzing,
    geminiApiKey,
  } = useStore();

  const handleFileSelect = useCallback(async (file: File) => {
    if (isAnalyzing) return;

    if (!geminiApiKey) {
      setError('Please configure your Gemini API key in Settings before analyzing media.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      const isVideo = file.type.startsWith('video/');
      let videoMetadata = null;

      if (isVideo) {
        try {
          videoMetadata = await extractVideoMetadata(file);
        } catch (e) {
          console.error('Failed to extract video metadata:', e);
        }
      }

      const analysis = await analyzeMedia(file, geminiApiKey, setAnalysisProgress, videoMetadata || undefined);

      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          analysis.dimensions = `${img.naturalWidth} x ${img.naturalHeight}`;
        };
        img.src = analysis.fileUrl;
      } else if (videoMetadata) {
        analysis.dimensions = `${videoMetadata.width} x ${videoMetadata.height}`;
      }

      setCurrentAnalysis(analysis);
      addAnalysis(analysis);
      setSuccess('Analysis completed successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze media. Please try again.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [isAnalyzing, geminiApiKey, setIsAnalyzing, setAnalysisProgress, setCurrentAnalysis, addAnalysis, setError, setSuccess]);

  const showApiKeyWarning = !geminiApiKey;

  return (
    <div className="space-y-6">
      {showApiKeyWarning && (
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          darkMode ? 'bg-amber-600/10 border-amber-600/30' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            darkMode ? 'bg-amber-600/20' : 'bg-amber-100'
          }`}>
            <Key className={`w-6 h-6 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              API Key Required
            </h3>
            <p className={`text-sm ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>
              Please add your Gemini API key in Settings to analyze images and videos.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <MediaPreview
            analysis={currentAnalysis}
            darkMode={darkMode}
            onFileSelect={handleFileSelect}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="space-y-4">
          {currentAnalysis ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Analysis Results
                  </h2>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click any section to expand or collapse. Use the copy button to copy content.
                </p>
              </div>

              <div className="grid gap-4">
                {analysisSections.map((section) => {
                  const content = currentAnalysis[section.key];
                  return (
                    <AnalysisCard
                      key={section.key}
                      section={section}
                      content={content}
                      darkMode={darkMode}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium mb-1">No analysis yet</p>
              <p className="text-sm max-w-sm">
                Upload an image or video to generate AI-powered analysis including SEO content, social media captions, and more.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
