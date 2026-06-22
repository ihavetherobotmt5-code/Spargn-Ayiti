import { useState, useMemo } from 'react';
import { Search, Trash2, Eye, Download, FileJson, FileSpreadsheet, FileText, X, Image, Video } from 'lucide-react';
import { useStore } from '../store';
import type { Analysis } from '../types';

interface HistoryPageProps {
  darkMode: boolean;
  onReopen: (analysis: Analysis) => void;
}

export function HistoryPage({ darkMode, onReopen }: HistoryPageProps) {
  const [search, setSearch] = useState('');
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'csv' | 'json'>('json');
  const { analyses, deleteAnalysis } = useStore();

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) =>
      a.fileName.toLowerCase().includes(search.toLowerCase()) ||
      a.imageDescription?.toLowerCase().includes(search.toLowerCase())
    );
  }, [analyses, search]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSelectAll = () => {
    if (selectedAnalyses.length === filteredAnalyses.length) {
      setSelectedAnalyses([]);
    } else {
      setSelectedAnalyses(filteredAnalyses.map((a) => a.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedAnalyses((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    selectedAnalyses.forEach((id) => deleteAnalysis(id));
    setSelectedAnalyses([]);
  };

  const handleExport = () => {
    const selected = analyses.filter((a) => selectedAnalyses.includes(a.id));

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'json': {
        content = JSON.stringify(selected, null, 2);
        filename = `analyses-export-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      }
      case 'csv': {
        const headers = 'ID,Filename,Size,Type,Date,Description\n';
        const rows = selected
          .map(
            (a) =>
              `"${a.id}","${a.fileName}","${a.fileSize}","${a.fileType}","${a.createdAt}","${(a.imageDescription || '').replace(/"/g, '""')}"`
          )
          .join('\n');
        content = headers + rows;
        filename = `analyses-export-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      }
      case 'txt': {
        content = selected
          .map((a, idx) => {
            return `--- Analysis ${idx + 1} ---\nFilename: ${a.fileName}\nSize: ${formatFileSize(a.fileSize)}\nType: ${a.fileType}\nDate: ${formatDate(a.createdAt)}\n\nDescription: ${a.imageDescription || 'No description'}\n\nSEO Title: ${a.seoTitle || 'N/A'}\nSEO Description: ${a.seoDescription || 'N/A'}\n\nKeywords: ${(a.keywords || []).join(', ')}\nHashtags: ${(a.hashtags || []).join(', ')}\n\nInstagram: ${a.instagramCaption || 'N/A'}\nTikTok: ${a.tiktokCaption || 'N/A'}\nFacebook: ${a.facebookCaption || 'N/A'}\nPinterest: ${a.pinterestDescription || 'N/A'}\nX Post: ${a.xPost || 'N/A'}\nReddit: ${a.redditPost || 'N/A'}\nYouTube Title: ${a.youtubeTitle || 'N/A'}\nYouTube Description: ${a.youtubeDescription || 'N/A'}\nRedbubble: ${a.redbubbleTitle || 'N/A'}\nEtsy: ${a.etsyTitle || 'N/A'}\nAI Prompt: ${a.aiRecreationPrompt || 'N/A'}\n`;
          })
          .join('\n');
        filename = `analyses-export-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
      }
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    setSelectedAnalyses([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search analyses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors
              ${darkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-teal-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedAnalyses.length > 0 && (
            <>
              <button
                onClick={() => setShowExportModal(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors
                  ${darkMode
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }`}
              >
                <Download className="w-4 h-4" />
                Export ({selectedAnalyses.length})
              </button>
              <button
                onClick={handleDeleteSelected}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors
                  ${darkMode
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedAnalyses.length})
              </button>
            </>
          )}
        </div>
      </div>

      {filteredAnalyses.length === 0 ? (
        <div className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Search className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium mb-1">No analyses found</p>
          <p className="text-sm">
            {search ? 'Try a different search term' : 'Upload media to create your first analysis'}
          </p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex items-center px-4 py-3 border-b ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
            <input
              type="checkbox"
              checked={selectedAnalyses.length === filteredAnalyses.length && filteredAnalyses.length > 0}
              onChange={handleSelectAll}
              className={`w-4 h-4 rounded border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} text-teal-500 focus:ring-teal-500`}
            />
            <span className={`ml-3 text-xs font-medium uppercase ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {filteredAnalyses.length} analyses
            </span>
          </div>

          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {filteredAnalyses.map((analysis) => {
              const isVideo = analysis.fileType.startsWith('video/');
              return (
                <div
                  key={analysis.id}
                  className={`flex items-center gap-4 p-4 transition-colors cursor-pointer
                    ${darkMode
                      ? 'hover:bg-gray-800/50'
                      : 'hover:bg-gray-50'
                    }`}
                  onClick={() => handleSelect(analysis.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedAnalyses.includes(analysis.id)}
                    onChange={() => handleSelect(analysis.id)}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-4 h-4 rounded border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} text-teal-500 focus:ring-teal-500`}
                  />

                  <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {analysis.thumbnailUrl || analysis.fileUrl ? (
                      <img
                        src={analysis.thumbnailUrl || analysis.fileUrl}
                        alt={analysis.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isVideo ? (
                          <Video className={`w-6 h-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        ) : (
                          <Image className={`w-6 h-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {analysis.fileName}
                    </p>
                    <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {analysis.imageDescription || 'No description'}
                    </p>
                    <div className={`flex items-center gap-3 mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>{formatFileSize(analysis.fileSize)}</span>
                      <span>{formatDate(analysis.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReopen(analysis);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-teal-400'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-teal-600'
                      }`}
                      title="Reopen analysis"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnalysis(analysis.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400'
                          : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                      }`}
                      title="Delete analysis"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md mx-4 p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Export Analyses
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Export {selectedAnalyses.length} selected analyses to:
            </p>

            <div className="space-y-3 mb-6">
              {(['json', 'csv', 'txt'] as const).map((format) => {
                const Icon = format === 'json' ? FileJson : format === 'csv' ? FileSpreadsheet : FileText;
                return (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all
                      ${exportFormat === format
                        ? darkMode
                          ? 'border-teal-400 bg-teal-600/10'
                          : 'border-teal-500 bg-teal-50'
                        : darkMode
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${exportFormat === format ? 'text-teal-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {format.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleExport}
              className={`w-full py-3 rounded-xl font-medium transition-colors
                ${darkMode
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
            >
              Download Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
