import React from 'react';
import { GitBranch, Wifi, Zap, AlertCircle } from 'lucide-react';

interface StatusBarProps {
  activeFile: string | null;
  linesCount: number;
  language: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ activeFile, linesCount, language }) => {
  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'js':
      case 'jsx':
        return 'text-yellow-400';
      case 'ts':
      case 'tsx':
        return 'text-blue-400';
      case 'py':
        return 'text-green-400';
      case 'html':
        return 'text-orange-400';
      case 'css':
        return 'text-purple-400';
      case 'json':
        return 'text-gray-400';
      case 'md':
        return 'text-blue-300';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="h-6 bg-blue-600 text-white text-xs flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Zap className="w-3 h-3" />
          <span>AI Ready</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {activeFile && (
          <>
            <span className="flex items-center space-x-1">
              <span className={getLanguageColor(language)}>●</span>
              <span>{language.toUpperCase()}</span>
            </span>
            
            <span>{linesCount} lines</span>
            
            <span className="truncate max-w-xs">
              {activeFile}
            </span>
          </>
        )}
        
        <div className="flex items-center space-x-1">
          <span>Ln 1, Col 1</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>Spaces: 2</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;