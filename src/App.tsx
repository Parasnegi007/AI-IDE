import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import AIChat from './components/AIChat';
import Terminal from './components/Terminal';
import StatusBar from './components/StatusBar';
import { FileTree, FileContent } from './types';

function App() {
  const [activeFile, setActiveFile] = useState<string | null>('src/main.js');
  const [openFiles, setOpenFiles] = useState<string[]>(['src/main.js']);
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'src/main.js': `// Welcome to AI IDE
console.log('Hello, World!');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate first 10 fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`fibonacci(\${i}) = \${fibonacci(i)}\`);
}`,
    'README.md': `# My Project

Welcome to your new project! This AI IDE provides:

- 🚀 Intelligent code completion
- 🤖 AI-powered coding assistant
- 📁 File management
- 💻 Integrated terminal
- 🎨 Syntax highlighting

## Getting Started

1. Edit your code in the editor
2. Ask the AI assistant for help
3. Use the terminal for commands
4. Save and run your project

Happy coding!`,
    'package.json': `{
  "name": "ai-ide-project",
  "version": "1.0.0",
  "description": "A project created with AI IDE",
  "main": "src/main.js",
  "scripts": {
    "start": "node src/main.js",
    "dev": "nodemon src/main.js"
  },
  "dependencies": {},
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}`
  });

  const [showAIChat, setShowAIChat] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [chatWidth, setChatWidth] = useState(350);

  const fileTree: FileTree = {
    'src': {
      type: 'folder',
      children: {
        'main.js': { type: 'file' },
        'utils.js': { type: 'file' },
        'components': {
          type: 'folder',
          children: {
            'App.js': { type: 'file' },
            'Header.js': { type: 'file' }
          }
        }
      }
    },
    'README.md': { type: 'file' },
    'package.json': { type: 'file' },
    '.gitignore': { type: 'file' }
  };

  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath);
    if (!openFiles.includes(filePath)) {
      setOpenFiles([...openFiles, filePath]);
    }
    
    // Generate default content for new files
    if (!fileContents[filePath]) {
      let defaultContent = '';
      const extension = filePath.split('.').pop();
      
      switch (extension) {
        case 'js':
          defaultContent = `// ${filePath}\n\n`;
          break;
        case 'py':
          defaultContent = `# ${filePath}\n\n`;
          break;
        case 'html':
          defaultContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>`;
          break;
        case 'css':
          defaultContent = `/* ${filePath} */\n\n`;
          break;
        default:
          defaultContent = `// ${filePath}\n\n`;
      }
      
      setFileContents(prev => ({
        ...prev,
        [filePath]: defaultContent
      }));
    }
  };

  const handleFileClose = (filePath: string) => {
    const newOpenFiles = openFiles.filter(file => file !== filePath);
    setOpenFiles(newOpenFiles);
    
    if (activeFile === filePath) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const handleCodeChange = (value: string) => {
    if (activeFile) {
      setFileContents(prev => ({
        ...prev,
        [activeFile]: value
      }));
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-xs font-bold">AI</span>
            </div>
            <span className="font-semibold">AI IDE</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              showAIChat 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              showTerminal 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Terminal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div 
          className="bg-gray-800 border-r border-gray-700 flex-shrink-0"
          style={{ width: `${sidebarWidth}px` }}
        >
          <Sidebar
            fileTree={fileTree}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Resize Handle for Sidebar */}
        <div
          className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = sidebarWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(200, Math.min(600, startWidth + (e.clientX - startX)));
              setSidebarWidth(newWidth);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          <Editor
            activeFile={activeFile}
            openFiles={openFiles}
            fileContents={fileContents}
            onFileClose={handleFileClose}
            onFileSelect={setActiveFile}
            onCodeChange={handleCodeChange}
          />
          
          {/* Terminal */}
          {showTerminal && (
            <div className="h-64 border-t border-gray-700">
              <Terminal />
            </div>
          )}
        </div>

        {/* AI Chat */}
        {showAIChat && (
          <>
            {/* Resize Handle for Chat */}
            <div
              className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = chatWidth;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newWidth = Math.max(300, Math.min(600, startWidth - (e.clientX - startX)));
                  setChatWidth(newWidth);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            <div 
              className="bg-gray-800 border-l border-gray-700 flex-shrink-0"
              style={{ width: `${chatWidth}px` }}
            >
              <AIChat 
                activeFile={activeFile}
                currentCode={activeFile ? fileContents[activeFile] : ''}
                onCodeSuggestion={handleCodeChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar
        activeFile={activeFile}
        linesCount={activeFile ? fileContents[activeFile]?.split('\n').length || 0 : 0}
        language={activeFile ? activeFile.split('.').pop() || 'text' : 'text'}
      />
    </div>
  );
}

export default App;