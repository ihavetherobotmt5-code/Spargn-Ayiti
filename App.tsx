import { useState, useEffect } from 'react';
import { Sidebar, MobileMenuButton } from './components/Sidebar';
import { Notifications, LoadingOverlay } from './components/Notifications';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { useStore } from './store';
import type { Analysis } from './types';

type Page = 'dashboard' | 'history' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, isAnalyzing, analysisProgress, setCurrentAnalysis } = useStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleReopen = (analysis: Analysis) => {
    setCurrentAnalysis(analysis);
    setCurrentPage('dashboard');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-slate-50 via-white to-teal-50'
    }`}>
      <div className="flex h-screen">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <header className={`sticky top-0 z-10 backdrop-blur-md border-b transition-colors duration-300 ${
            darkMode
              ? 'bg-gray-900/80 border-gray-800'
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center justify-between px-4 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                <MobileMenuButton
                  onClick={() => setSidebarOpen(true)}
                  darkMode={darkMode}
                />
                <div>
                  <h1 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentPage === 'dashboard' && 'Dashboard'}
                    {currentPage === 'history' && 'History'}
                    {currentPage === 'settings' && 'Settings'}
                  </h1>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {currentPage === 'dashboard' && 'Analyze images & videos with AI'}
                    {currentPage === 'history' && 'View and manage past analyses'}
                    {currentPage === 'settings' && 'Configure your preferences'}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {currentPage === 'dashboard' && (
                <DashboardPage darkMode={darkMode} />
              )}
              {currentPage === 'history' && (
                <HistoryPage darkMode={darkMode} onReopen={handleReopen} />
              )}
              {currentPage === 'settings' && (
                <SettingsPage darkMode={darkMode} />
              )}
            </div>
          </main>
        </div>
      </div>

      <Notifications />
      {isAnalyzing && <LoadingOverlay progress={analysisProgress} darkMode={darkMode} />}
    </div>
  );
}

function SettingsPage({ darkMode }: { darkMode: boolean }) {
  const { toggleDarkMode, geminiApiKey, setGeminiApiKey, googleClientId, setGoogleClientId, savedGoogleFolder, setSavedGoogleFolder } = useStore();
  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [inputClientId, setInputClientId] = useState(googleClientId);
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [clientIdSaved, setClientIdSaved] = useState(false);

  const handleSaveKey = () => {
    setGeminiApiKey(inputKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleClearKey = () => {
    setInputKey('');
    setGeminiApiKey('');
  };

  const handleSaveClientId = () => {
    setGoogleClientId(inputClientId.trim());
    setClientIdSaved(true);
    setTimeout(() => setClientIdSaved(false), 2000);
  };

  const handleClearClientId = () => {
    setInputClientId('');
    setGoogleClientId('');
  };

  const handleClearSavedFolder = () => {
    setSavedGoogleFolder(null);
  };

  const isValidKey = inputKey.trim().length >= 10;
  const isValidClientId = inputClientId.trim().length >= 10;

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-600/20' : 'bg-teal-100'}`}>
            <svg className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Gemini API Key
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Required to analyze images and videos with AI
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className={`w-full px-4 py-3 rounded-xl border transition-colors pr-24 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal-500'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                  }`}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Get your API key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${darkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'}`}
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveKey}
              disabled={!isValidKey}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                keySaved
                  ? 'bg-emerald-500 text-white'
                  : isValidKey
                    ? darkMode
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {keySaved ? 'Saved!' : 'Save API Key'}
            </button>
            {geminiApiKey && (
              <button
                onClick={handleClearKey}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  darkMode
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                Clear
              </button>
            )}
          </div>

          {geminiApiKey && (
            <div className={`p-3 rounded-xl flex items-center gap-2 ${
              darkMode ? 'bg-emerald-600/10 border border-emerald-600/30' : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                API key configured and ready to use
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
            <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Google Drive Integration
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure Google Drive access to browse and analyze files
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Google OAuth Client ID
            </label>
            <input
              type="text"
              value={inputClientId}
              onChange={(e) => setInputClientId(e.target.value)}
              placeholder="e.g., 123456789.apps.googleusercontent.com"
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Get your Client ID from{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Google Cloud Console
              </a>
              {' '}(create an OAuth 2.0 Client ID for Web Application)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveClientId}
              disabled={!isValidClientId}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                clientIdSaved
                  ? 'bg-emerald-500 text-white'
                  : isValidClientId
                    ? darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {clientIdSaved ? 'Saved!' : 'Save Client ID'}
            </button>
            {googleClientId && (
              <button
                onClick={handleClearClientId}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  darkMode
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                Clear
              </button>
            )}
          </div>

          {googleClientId && (
            <div className={`p-3 rounded-xl flex items-center gap-2 ${
              darkMode ? 'bg-emerald-600/10 border border-emerald-600/30' : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Google Drive configured
              </span>
            </div>
          )}

          {savedGoogleFolder && (
            <div className={`p-3 rounded-xl flex items-center justify-between ${
              darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Saved folder: <strong>{savedGoogleFolder.name}</strong>
                </span>
              </div>
              <button
                onClick={handleClearSavedFolder}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-600/10'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dark Mode
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              darkMode ? 'bg-teal-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          About
        </h2>
        <div className="space-y-3">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            AI Media Analyzer uses Google Gemini AI to analyze your images and videos,
            generating optimized content for SEO, social media, and e-commerce platforms.
          </p>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Version: 1.0.0</p>
            <p>Your API key and all analysis data are stored locally in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
