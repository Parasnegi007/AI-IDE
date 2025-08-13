import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X } from 'lucide-react';

interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

const Terminal: React.FC = () => {
  const [output, setOutput] = useState<TerminalOutput[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to AI IDE Terminal v1.0.0',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const executeCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    
    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Add input to output
    const inputOutput: TerminalOutput = {
      id: Date.now().toString(),
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date()
    };

    let responseOutput: TerminalOutput;

    switch (cmd) {
      case 'help':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: `Available commands:
  help          - Show this help message
  clear         - Clear terminal output
  ls            - List files and directories
  pwd           - Print working directory
  date          - Show current date and time
  whoami        - Display current user
  echo [text]   - Display text
  node --version - Show Node.js version
  npm --version  - Show npm version
  git --version  - Show Git version`,
          timestamp: new Date()
        };
        break;

      case 'clear':
        setOutput([]);
        return;

      case 'ls':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: `src/
  main.js
  utils.js
  components/
    App.js
    Header.js
README.md
package.json
.gitignore`,
          timestamp: new Date()
        };
        break;

      case 'pwd':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: '/home/project',
          timestamp: new Date()
        };
        break;

      case 'date':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: new Date().toString(),
          timestamp: new Date()
        };
        break;

      case 'whoami':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: 'developer',
          timestamp: new Date()
        };
        break;

      case 'node --version':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: 'v18.17.0',
          timestamp: new Date()
        };
        break;

      case 'npm --version':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: '9.6.7',
          timestamp: new Date()
        };
        break;

      case 'git --version':
        responseOutput = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          content: 'git version 2.41.0',
          timestamp: new Date()
        };
        break;

      default:
        if (cmd.startsWith('echo ')) {
          const text = command.substring(5);
          responseOutput = {
            id: (Date.now() + 1).toString(),
            type: 'output',
            content: text,
            timestamp: new Date()
          };
        } else {
          responseOutput = {
            id: (Date.now() + 1).toString(),
            type: 'error',
            content: `Command not found: ${command}. Type 'help' for available commands.`,
            timestamp: new Date()
          };
        }
        break;
    }

    setOutput(prev => [...prev, inputOutput, responseOutput]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        executeCommand(input);
      }
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  return (
    <div className="h-full bg-black text-green-400 flex flex-col font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-gray-300">Terminal</span>
        </div>
        <button
          onClick={clearTerminal}
          className="p-1 hover:bg-gray-700 text-gray-400 rounded transition-colors"
          title="Clear terminal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 p-4 overflow-y-auto">
        {output.map((line) => (
          <div
            key={line.id}
            className={`mb-1 ${
              line.type === 'input' 
                ? 'text-white' 
                : line.type === 'error' 
                ? 'text-red-400' 
                : 'text-green-400'
            }`}
          >
            <pre className="whitespace-pre-wrap break-words">{line.content}</pre>
          </div>
        ))}
        <div ref={outputRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-2 border-t border-gray-700">
        <div className="flex items-center">
          <span className="text-green-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;