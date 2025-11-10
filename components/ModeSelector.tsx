import React from 'react';
import { AppMode } from '../types';
import { ImageIcon, EyeIcon, FileTextIcon, BellIcon, BotIcon } from './icons';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const ModeButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}> = ({ isActive, onClick, icon, label }) => {
    const baseClasses = "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100";
    const activeClasses = "bg-blue-600 text-white shadow-md";
    const inactiveClasses = "bg-white text-slate-600 hover:bg-slate-200 hover:text-slate-800";
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    )
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex justify-center items-center gap-2 p-1 bg-slate-200/70 rounded-xl">
      <ModeButton 
        isActive={currentMode === AppMode.Image}
        onClick={() => onModeChange(AppMode.Image)}
        icon={<ImageIcon className="w-5 h-5" />}
        label="Image Gen"
      />
      <ModeButton 
        isActive={currentMode === AppMode.Vision}
        onClick={() => onModeChange(AppMode.Vision)}
        icon={<EyeIcon className="w-5 h-5" />}
        label="Vision"
      />
       <ModeButton 
        isActive={currentMode === AppMode.File}
        onClick={() => onModeChange(AppMode.File)}
        icon={<FileTextIcon className="w-5 h-5" />}
        label="File Chat"
      />
       <ModeButton 
        isActive={currentMode === AppMode.Agent}
        onClick={() => onModeChange(AppMode.Agent)}
        icon={<BellIcon className="w-5 h-5" />}
        label="Agent"
      />
       <ModeButton 
        isActive={currentMode === AppMode.FineTuned}
        onClick={() => onModeChange(AppMode.FineTuned)}
        icon={<BotIcon className="w-5 h-5" />}
        label="Brand Bot"
      />
    </div>
  );
};

export default ModeSelector;