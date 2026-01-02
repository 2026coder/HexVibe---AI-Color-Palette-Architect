import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, History, Github, ExternalLink, Trash2, Moon, Sun, Download, Youtube, Music } from 'lucide-react';
import { ColorInfo, Palette } from './types';
import { generateRandomHex, downloadJson, generateHarmony } from './utils/colorUtils';
import ColorCard from './components/ColorCard';
import { getAIPalette } from './services/geminiService';

const App: React.FC = () => {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [history, setHistory] = useState<Palette[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('hexvibe_theme') === 'dark';
  });

  // Handle Dark Mode switching
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hexvibe_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hexvibe_theme', 'light');
    }
  }, [isDarkMode]);

  // Initialize colors - Using 6 colors for a cleaner 3x2 grid
  useEffect(() => {
    const initialColors = Array.from({ length: 6 }, () => ({
      hex: generateRandomHex(),
      locked: false
    }));
    setColors(initialColors);

    // Load history
    const saved = localStorage.getItem('hexvibe_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const generateNewColors = useCallback(() => {
    setColors(prev => prev.map(c => c.locked ? c : { ...c, hex: generateRandomHex() }));
  }, []);

  const handleHarmonyClick = (type: 'ANALOGOUS' | 'COMPLEMENTARY' | 'MONOCHROMATIC' | 'TRIADIC') => {
    const baseColor = colors.find(c => c.locked)?.hex || colors[0].hex;
    const harmonyHexes = generateHarmony(baseColor, type);
    
    setColors(prev => prev.map((c, i) => ({
      ...c,
      hex: harmonyHexes[i] || generateRandomHex(),
      locked: i === 0 ? c.locked : false
    })));
  };

  const handleToggleLock = (index: number) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleExportJson = () => {
    const paletteData = {
      name: `HexVibe Palette ${new Date().toLocaleDateString()}`,
      exportedAt: new Date().toISOString(),
      colors: colors.map(c => c.hex)
    };
    downloadJson(paletteData, 'hexvibe-palette');
  };

  const savePalette = () => {
    const newPalette: Palette = {
      id: Date.now().toString(),
      name: `Palette ${history.length + 1}`,
      colors: colors.map(c => c.hex),
      timestamp: Date.now()
    };
    const updatedHistory = [newPalette, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('hexvibe_history', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (palette: Palette) => {
    setColors(palette.colors.map(hex => ({ hex, locked: false })));
    setShowHistory(false);
  };

  const deleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(p => p.id !== id);
    setHistory(updated);
    localStorage.setItem('hexvibe_history', JSON.stringify(updated));
  };

  const handleAiGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const newHexes = await getAIPalette(aiPrompt);
      if (newHexes.length > 0) {
        setColors(prev => prev.map((c, i) => ({
          ...c,
          hex: newHexes[i] || generateRandomHex(),
          locked: false
        })));
        savePalette();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
      setAiPrompt('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        generateNewColors();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateNewColors]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-slate-950">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              HexVibe
            </h1>
          </div>

          <nav className="flex items-center space-x-1 md:space-x-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
            >
              <History size={20} className="text-slate-600 dark:text-slate-400" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
            <a 
              href="https://github.com/2026coder" 
              target="_blank" 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block"
            >
              <Github size={20} className="text-slate-600 dark:text-slate-400" />
            </a>
            <button 
              onClick={savePalette}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-100 dark:shadow-none"
            >
              <span className="hidden xs:inline">Save Palette</span>
              <span className="xs:hidden">+</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-8 max-w-[1600px] mx-auto w-full">
        {/* Color Palette Display */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {colors.map((color, idx) => (
              <ColorCard 
                key={idx}
                hex={color.hex}
                isLocked={color.locked}
                onToggleLock={() => handleToggleLock(idx)}
                onCopy={handleCopy}
                isCopied={copiedHex === color.hex}
              />
            ))}
          </div>
        </div>

        {/* Sidebar / Controls */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={18} className="text-amber-500" />
              <h2 className="font-bold text-slate-800 dark:text-white">AI Generator</h2>
            </div>
            <form onSubmit={handleAiGeneration} className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 'Nordic winter forest'"
                className="w-full h-24 p-4 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              />
              <button 
                type="submit"
                disabled={isAiLoading || !aiPrompt.trim()}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                  isAiLoading 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isAiLoading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate AI Palette</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 dark:text-white">Pro Controls</h2>
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded">Tools</span>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={generateNewColors}
                className="w-full group py-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Shuffle (Space)</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleHarmonyClick('COMPLEMENTARY')}
                  className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Complementary
                </button>
                <button 
                  onClick={() => handleHarmonyClick('TRIADIC')}
                  className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Triadic
                </button>
                <button 
                  onClick={() => handleHarmonyClick('ANALOGOUS')}
                  className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Analogous
                </button>
                <button 
                  onClick={() => handleHarmonyClick('MONOCHROMATIC')}
                  className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Monochrome
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={handleExportJson}
                className="w-full py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center space-x-2 hover:underline"
              >
                <Download size={14} />
                <span>Export JSON Palette</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-fade-in border-l dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Saved Palettes</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <Trash2 size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <History size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">No palettes saved yet.</p>
                </div>
              ) : (
                history.map((palette) => (
                  <div 
                    key={palette.id}
                    onClick={() => loadFromHistory(palette)}
                    className="group bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{palette.name}</span>
                      <button 
                        onClick={(e) => deleteFromHistory(e, palette.id)}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex h-12 rounded-lg overflow-hidden border border-white/50 dark:border-slate-700">
                      {palette.colors.map((hex, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer with Social Links and New Date */}
      <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Built on 2 January 2026</span>
            <span className="hidden md:block text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center space-x-1">
              <Sparkles size={12} className="text-indigo-500" />
              <span>AI Powered by Gemini</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <a 
              href="https://www.tiktok.com/@my365journeycode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center space-x-1.5 group"
            >
              <Music size={14} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">TikTok</span>
            </a>
            <a 
              href="https://www.youtube.com/@365Jurney" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center space-x-1.5 group"
            >
              <Youtube size={14} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">YouTube</span>
            </a>
            <a 
              href="https://github.com/2026coder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-all flex items-center space-x-1.5 group"
            >
              <Github size={14} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;