import React, { useState, useCallback, useEffect } from 'react';
import { generatePrompt, generateImage } from './services/geminiService';
import { PromptStyle, HistoryItem } from './types';

// --- Helper Components ---

const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.587 2.052a2.5 2.5 0 0 1 4.826 0l.217.434a1.25 1.25 0 0 0 1.636 1.007l.47-.179a2.5 2.5 0 0 1 3.242 3.242l-.18.47a1.25 1.25 0 0 0 1.006 1.636l.434.217a2.5 2.5 0 0 1 0 4.826l-.434.217a1.25 1.25 0 0 0-1.006 1.636l.18.47a2.5 2.5 0 0 1-3.242 3.242l-.47-.18a1.25 1.25 0 0 0-1.636 1.006l-.217.434a2.5 2.5 0 0 1-4.826 0l-.217-.434a1.25 1.25 0 0 0-1.636-1.006l-.47.18a2.5 2.5 0 0 1-3.242-3.242l.18-.47a1.25 1.25 0 0 0-1.006-1.636l-.434-.217a2.5 2.5 0 0 1 0-4.826l.434-.217a1.25 1.25 0 0 0 1.006-1.636l-.18-.47a2.5 2.5 0 0 1 3.242-3.242l.47.18a1.25 1.25 0 0 0 1.636-1.007l.217-.434ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
  </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06l2.75-2.75a.75.75 0 0 1 1.06 0l3.72 3.72a.75.75 0 0 0 1.06 0l3.97-3.97a.75.75 0 0 1 1.06 0l2.39 2.39V6H3v10.06ZM12 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" clipRule="evenodd" />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.16 12.84 9 12 9H5.625c-.84 0-1.5-.66-1.5-1.5V3.375Z" />
    <path d="M12.938 12.75a2.25 2.25 0 0 0-2.25 2.25v4.5A2.25 2.25 0 0 0 12.938 21.75h4.5a2.25 2.25 0 0 0 2.25-2.25v-4.5a2.25 2.25 0 0 0-2.25-2.25h-4.5Z" />
    <path d="M3.375 12.938a2.25 2.25 0 0 0 2.25-2.25v-1.5c0-.84.66-1.5 1.5-1.5h1.5a.75.75 0 0 0 0-1.5H8.625c-1.875 0-3.375 1.5-3.375 3.375v1.5a2.25 2.25 0 0 0 2.25 2.25h1.5a.75.75 0 0 0 0-1.5H5.625Z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
  </svg>
);

const BroomIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12.964 2.276a.75.75 0 0 1 .536.704v4.023c0 .414.336.75.75.75h2.47a.75.75 0 0 1 .728.981l-2.022 4.043a.75.75 0 0 0 .67.977h3.018a.75.75 0 0 1 .728.981l-2.022 4.043a.75.75 0 0 0 .67.977h.06a.75.75 0 0 1 .75.75v.358a3 3 0 0 1-3 3H8.625a3 3 0 0 1-3-3v-.358a.75.75 0 0 1 .75-.75h.06a.75.75 0 0 0 .67-.977L5.083 14.5a.75.75 0 0 1 .728-.981h3.018a.75.75 0 0 0 .67-.977L7.478 8.5a.75.75 0 0 1 .728-.981h2.47a.75.75 0 0 0 .75-.75V2.98a.75.75 0 0 1 .536-.704ZM9.75 18a.75.75 0 0 1 .75.75v.358a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5v-.358a.75.75 0 0 1 1.5 0v.358a3 3 0 0 1-3 3h-1.5a3 3 0 0 1-3-3v-.358a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 0 1-.749.722H9.794a.75.75 0 0 1-.75-.722L8.04 6.662l-.21.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.347-9Zm5.244 0a.75.75 0 1 0-1.5-.058l-.347 9a.75.75 0 1 0 1.499.058l.347-9Z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// --- Main App Component ---

const HISTORY_KEY = 'promptGeneratorHistory';
type Tab = 'prompt' | 'image';

export default function App() {
  // Prompt Generator State
  const [idea, setIdea] = useState<string>('');
  const [style, setStyle] = useState<PromptStyle>(PromptStyle.DETAILED);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Image Generator State
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('prompt');


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error("Failed to load history from localStorage:", err);
    }
  }, []);

  const handleGeneratePrompt = useCallback(async () => {
    if (!idea.trim()) {
      setError('Please enter a prompt idea.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    setIsCopied(false);

    try {
      const prompt = await generatePrompt(idea, style);
      setGeneratedPrompt(prompt);

      const newHistoryItem: HistoryItem = { id: Date.now(), idea, style, generatedPrompt: prompt };
      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50); // Keep last 50
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (err) {
          console.error("Failed to save history to localStorage:", err);
        }
        return updatedHistory;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [idea, style]);

  const handleGenerateImage = useCallback(async () => {
    if (!imagePrompt.trim()) {
      setImageError('Please enter an image description.');
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImageUrl(null);

    try {
      const imageUrl = await generateImage(imagePrompt, aspectRatio);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
        setImageError(err instanceof Error ? err.message : 'An unknown error occurred while generating the image.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [imagePrompt, aspectRatio]);


  const handleCopy = useCallback(() => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [generatedPrompt]);

  const handleDownload = useCallback(() => {
    if (!generatedPrompt) return;
    const safeIdea = idea.trim().slice(0, 30).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `prompt_${safeIdea || 'generated'}.txt`;
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedPrompt, idea]);
  
  const handleDownloadImage = useCallback(() => {
    if (!generatedImageUrl) return;
    const safePrompt = imagePrompt.trim().slice(0, 30).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `image_${safePrompt || 'generated'}.jpeg`;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [generatedImageUrl, imagePrompt]);

  const handleClearAll = useCallback(() => {
    setIdea('');
    setGeneratedPrompt('');
    setError(null);
    setIsCopied(false);
  }, []);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setIdea(item.idea);
    setStyle(item.style);
    setGeneratedPrompt(item.generatedPrompt);
    setError(null);
    setIsCopied(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (err) {
      console.error("Failed to clear history from localStorage:", err);
    }
  }, []);
  
  const tabBaseClasses = "flex-1 text-center px-4 py-3 text-sm sm:text-base font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-t-lg flex items-center justify-center gap-2";
  const activeTabClasses = "bg-white dark:bg-gray-800/50 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500";
  const inactiveTabClasses = "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 sm:py-12 p-4 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">
            AI Content Generator
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Create powerful prompts and stunning images from your ideas.
          </p>
        </header>
        
        <div className="flex">
          <button onClick={() => setActiveTab('prompt')} className={`${tabBaseClasses} ${activeTab === 'prompt' ? activeTabClasses : inactiveTabClasses}`} role="tab" aria-selected={activeTab === 'prompt'}>
            <MagicWandIcon className="w-5 h-5"/> Prompt Generator
          </button>
          <button onClick={() => setActiveTab('image')} className={`${tabBaseClasses} ${activeTab === 'image' ? activeTabClasses : inactiveTabClasses}`} role="tab" aria-selected={activeTab === 'image'}>
            <ImageIcon className="w-5 h-5"/> Image Generator
          </button>
        </div>

        {activeTab === 'prompt' && (
           <main className="bg-white dark:bg-gray-800/50 rounded-b-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm border-x border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label htmlFor="prompt-idea" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  1. Enter your core idea
                </label>
                <textarea
                  id="prompt-idea"
                  rows={4}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g., a logo for a sustainable coffee brand"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label htmlFor="prompt-style" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  2. Choose a generation style
                </label>
                <select
                  id="prompt-style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as PromptStyle)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 dark:text-gray-100"
                >
                  <option value={PromptStyle.DETAILED}>Detailed & Specific</option>
                  <option value={PromptStyle.CREATIVE}>Creative & Evocative</option>
                  <option value={PromptStyle.TECHNICAL}>Technical & Precise</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={handleGeneratePrompt}
                  disabled={isLoading}
                  className="sm:col-span-2 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? <LoadingSpinner /> : <><MagicWandIcon className="w-5 h-5" /><span>Generate Prompt</span></>}
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={!idea && !generatedPrompt && !error}
                  className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  aria-label="Clear all inputs and results"
                  >
                  <BroomIcon className="w-5 h-5" /><span>Clear</span>
                </button>
              </div>
            </div>
            {error && <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-lg text-sm"><p>{error}</p></div>}
            {generatedPrompt && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Generated Prompt</h2>
                <div className="relative p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">{generatedPrompt}</p>
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button onClick={handleDownload} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Download prompt"><DownloadIcon className="w-5 h-5" /></button>
                    <button onClick={handleCopy} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Copy prompt">{isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {activeTab === 'image' && (
           <main className="bg-white dark:bg-gray-800/50 rounded-b-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm border-x border-b border-gray-200 dark:border-gray-700">
             <div className="space-y-6">
                <div>
                  <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    1. Describe the image you want to create
                  </label>
                  <textarea id="image-prompt" rows={4} value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="e.g., an astronaut riding a horse on Mars, photorealistic" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    2. Choose an aspect ratio
                  </label>
                  <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 dark:text-gray-100">
                    <option value="1:1">Square (1:1)</option>
                    <option value="16:9">Landscape (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                    <option value="4:3">Landscape (4:3)</option>
                    <option value="3:4">Portrait (3:4)</option>
                  </select>
                </div>
                <button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  {isGeneratingImage ? <LoadingSpinner /> : <><ImageIcon className="w-5 h-5" /><span>Generate Image</span></>}
                </button>
              </div>
              {imageError && <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-lg text-sm"><p>{imageError}</p></div>}
              {(isGeneratingImage || generatedImageUrl) && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Generated Image</h2>
                  <div className="relative p-4 bg-gray-100 dark:bg-gray-900 rounded-lg aspect-auto flex justify-center items-center">
                    {isGeneratingImage && (
                      <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-900/50 z-10">
                        <LoadingSpinner />
                        <p className="text-white mt-2 text-sm">Generating your image...</p>
                      </div>
                    )}
                    {generatedImageUrl ? (
                      <img src={generatedImageUrl} alt="Generated by AI" className="rounded-md max-w-full max-h-[60vh] object-contain shadow-lg" />
                    ) : (
                      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}
                    {generatedImageUrl && !isGeneratingImage && (
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button onClick={handleDownloadImage} className="p-2 rounded-md bg-gray-200/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors backdrop-blur-sm" aria-label="Download image"><DownloadIcon className="w-5 h-5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              )}
           </main>
        )}


        {activeTab === 'prompt' && history.length > 0 && (
          <section className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Generation History</h2>
              <button onClick={handleClearHistory} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Clear history">
                <TrashIcon className="w-4 h-4" /><span>Clear History</span>
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {history.map(item => (
                  <li key={item.id}>
                    <button onClick={() => handleSelectHistoryItem(item)} className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-gray-700 ring-1 ring-inset ring-gray-200 dark:ring-gray-700/50 hover:ring-indigo-300 dark:hover:ring-indigo-600 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.idea}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="inline-block bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5 font-medium text-gray-600 dark:text-gray-300">{item.style}</span>
                        <span className="text-gray-400 dark:text-gray-500">{new Date(item.id).toLocaleString()}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
