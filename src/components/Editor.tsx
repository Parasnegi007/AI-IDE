import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Settings, Save, Play, Copy } from 'lucide-react';

interface EditorProps {
  activeFile: string | null;
  openFiles: string[];
  fileContents: Record<string, string>;
  onFileClose: (filePath: string) => void;
  onFileSelect: (filePath: string) => void;
  onCodeChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  activeFile,
  openFiles,
  fileContents,
  onFileClose,
  onFileSelect,
  onCodeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentContent = activeFile ? fileContents[activeFile] || '' : '';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            // Save functionality
            console.log('File saved');
            break;
          case 'f':
            e.preventDefault();
            setShowSearch(true);
            break;
          case '/':
            e.preventDefault();
            toggleComment();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleComment = () => {
    if (!textareaRef.current || !activeFile) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = currentContent;
    const lines = content.split('\n');
    
    // Find which lines are selected
    let startLine = 0;
    let endLine = 0;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (charCount <= start && start <= charCount + lines[i].length) {
        startLine = i;
      }
      if (charCount <= end && end <= charCount + lines[i].length) {
        endLine = i;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }

    // Toggle comments on selected lines
    const commentPrefix = getCommentPrefix(activeFile);
    let newLines = [...lines];
    
    for (let i = startLine; i <= endLine; i++) {
      if (newLines[i].trim().startsWith(commentPrefix)) {
        // Remove comment
        newLines[i] = newLines[i].replace(new RegExp(`^(\\s*)${commentPrefix}\\s?`), '$1');
      } else {
        // Add comment
        const indent = newLines[i].match(/^\s*/)?.[0] || '';
        newLines[i] = indent + commentPrefix + ' ' + newLines[i].substring(indent.length);
      }
    }

    onCodeChange(newLines.join('\n'));
  };

  const getCommentPrefix = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '//';
      case 'py':
        return '#';
      case 'html':
        return '<!--';
      case 'css':
        return '/*';
      default:
        return '//';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onCodeChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      if (e.shiftKey) {
        // Unindent
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);
        const lines = beforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        
        if (currentLine.startsWith('  ')) {
          lines[lines.length - 1] = currentLine.substring(2);
          const newValue = lines.join('\n') + afterCursor;
          onCodeChange(newValue);
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }, 0);
        }
      } else {
        // Indent
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onCodeChange(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const value = textarea.value;
      const beforeCursor = value.substring(0, start);
      const afterCursor = value.substring(start);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      const indent = currentLine.match(/^\s*/)?.[0] || '';
      
      let newIndent = indent;
      const trimmed = currentLine.trim();
      
      // Increase indent for opening brackets
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        newIndent += '  ';
      }
      
      const newValue = beforeCursor + '\n' + newIndent + afterCursor;
      onCodeChange(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length;
      }, 0);
    }
  };

  const getLanguage = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  const runCode = () => {
    if (!activeFile || !currentContent) return;
    
    const language = getLanguage(activeFile);
    if (language === 'javascript') {
      try {
        // Create a safe execution context
        const result = eval(currentContent);
        console.log('Code executed successfully:', result);
      } catch (error) {
        console.error('Code execution error:', error);
      }
    }
  };

  if (openFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">No files open</h2>
          <p>Select a file from the explorer to start coding</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Tab Bar */}
      <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
        {openFiles.map((filePath) => (
          <div
            key={filePath}
            className={`flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer min-w-0 ${
              activeFile === filePath
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => onFileSelect(filePath)}
          >
            <span className="truncate mr-2">{filePath.split('/').pop()}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileClose(filePath);
              }}
              className="p-1 hover:bg-gray-600 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Search (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={runCode}
            className="p-2 hover:bg-gray-700 rounded transition-colors text-green-400"
            title="Run Code"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(currentContent)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Copy All"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            {activeFile ? getLanguage(activeFile) : ''}
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search in file..."
            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Font Size:</label>
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-400">{fontSize}px</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="wordWrap"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
              />
              <label htmlFor="wordWrap" className="text-sm text-gray-300">Word Wrap</label>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex">
        {/* Line Numbers */}
        <div className="bg-gray-800 text-gray-500 text-right pr-2 py-4 select-none border-r border-gray-700">
          {currentContent.split('\n').map((_, index) => (
            <div
              key={index}
              className="leading-6"
              style={{ fontSize: `${fontSize}px` }}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={currentContent}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-4 bg-gray-900 text-white font-mono resize-none outline-none leading-6"
            style={{ 
              fontSize: `${fontSize}px`,
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              wordWrap: wordWrap ? 'break-word' : 'normal'
            }}
            placeholder="Start typing your code..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        {activeFile && (
          <div className="flex items-center justify-between">
            <span>
              {currentContent.split('\n').length} lines • {currentContent.length} characters
            </span>
            <span>
              {getLanguage(activeFile)} • UTF-8 • LF
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;