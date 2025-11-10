import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppMode, ResultData, ChatMessage } from './types';
import * as geminiService from './services/geminiService';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import PromptInput from './components/PromptInput';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Image);
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textFile, setTextFile] = useState<File | null>(null);

  const [result, setResult] = useState<ResultData | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat on new message
    if (mainContentRef.current) {
        mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
    }
  }, [chatHistory, result, isLoading]);


  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    clearInputs();
    setResult(null);
    setChatHistory([]);
  };
  
  const clearInputs = () => {
      setPrompt('');
      setImageFile(null);
      setTextFile(null);
  }

  const handleSubmit = useCallback(async () => {
    if (isLoading || !prompt) return;

    setIsLoading(true);
    
    // For chat modes, add user prompt to history immediately
    if (mode === AppMode.Agent || mode === AppMode.FineTuned) {
        setChatHistory(prev => [...prev, { role: 'user', content: prompt }]);
    } else {
        setResult(null);
    }
    
    const currentPrompt = prompt;
    setPrompt(''); // Clear input after submission

    try {
      let response: ResultData | ChatMessage | null = null;
      switch (mode) {
        case AppMode.Image:
          response = await geminiService.generateImage(currentPrompt);
          setResult(response);
          break;
        case AppMode.Vision:
          if (!imageFile) throw new Error('Please upload an image to analyze.');
          response = await geminiService.getVisionResponse(currentPrompt, imageFile);
          setResult(response);
          break;
        case AppMode.File:
          if (!textFile) throw new Error('Please upload a file to chat with.');
          response = await geminiService.chatWithFile(currentPrompt, textFile);
          setResult(response);
          break;
        case AppMode.Agent:
            response = await geminiService.runAgentInteraction(currentPrompt);
            setChatHistory(prev => [...prev, response as ChatMessage]);
            break;
        case AppMode.FineTuned:
            response = await geminiService.chatWithFineTunedModel(currentPrompt, chatHistory);
            setChatHistory(prev => [...prev, response as ChatMessage]);
            break;
        default:
          throw new Error('Invalid application mode selected.');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      if (mode === AppMode.Agent || mode === AppMode.FineTuned) {
          setChatHistory(prev => [...prev, { role: 'model', content: `Error: ${errorMessage}` }]);
      } else {
          setResult({ type: 'error', content: errorMessage });
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, mode, imageFile, textFile, isLoading, chatHistory]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans">
      <Header />
      <main ref={mainContentRef} className="flex-grow overflow-y-auto p-4 md:p-6">
        <ResultDisplay 
            isLoading={isLoading} 
            result={result} 
            chatHistory={chatHistory} 
            mode={mode}
        />
      </main>
      <footer className="bg-slate-100/80 backdrop-blur-sm border-t border-slate-300 p-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
          <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
          <PromptInput
            mode={mode}
            prompt={prompt}
            setPrompt={setPrompt}
            imageFile={imageFile}
            setImageFile={setImageFile}
            textFile={textFile}
            setTextFile={setTextFile}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        </div>
      </footer>
    </div>
  );
};

export default App;