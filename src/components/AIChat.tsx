import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Lightbulb, Zap, Copy, Brain, Sparkles, FileCode, Cpu, Upload, FolderOpen, File, Download, RefreshCw, MessageSquare, Search, BookOpen, Settings, Wand2 } from 'lucide-react';
import { ChatMessage, CodeSuggestion } from '../types';
import AIService from '../services/AIService';

interface AIChatProps {
  activeFile: string | null;
  currentCode: string;
  onCodeSuggestion: (code: string) => void;
}

const AIChat: React.FC<AIChatProps> = ({ activeFile, currentCode, onCodeSuggestion }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 **Hello! I'm Claude, your AI coding companion**\n\nI'm here to help you with:\n\n🔍 **Code Analysis & Debugging**\n• Find and fix bugs in your code\n• Explain complex algorithms and patterns\n• Review code quality and suggest improvements\n\n💡 **General Programming Help**\n• Answer questions about any programming language\n• Explain concepts, frameworks, and libraries\n• Help with architecture and design decisions\n• Provide best practices and coding standards\n\n🚀 **Code Generation & Refactoring**\n• Generate functions, classes, and components\n• Refactor existing code for better performance\n• Create tests and documentation\n• Convert between programming languages\n\n📚 **Learning & Guidance**\n• Explain programming concepts step-by-step\n• Recommend learning resources and tutorials\n• Help with project planning and structure\n• Career advice and technical interviews\n\n**Just ask me anything! I can help with coding questions, explain concepts, debug issues, or even chat about technology trends.**",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [conversationMode, setConversationMode] = useState<'coding' | 'general' | 'learning'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      let aiResponse;
      
      // Determine conversation type and respond accordingly
      if (isCodeRelated(currentInput)) {
        setConversationMode('coding');
        aiResponse = await handleCodingQuery(currentInput);
      } else if (isLearningRelated(currentInput)) {
        setConversationMode('learning');
        aiResponse = await handleLearningQuery(currentInput);
      } else {
        setConversationMode('general');
        aiResponse = await handleGeneralQuery(currentInput);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConfidence(aiResponse.confidence);

    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize for the technical hiccup! I'm still here to help you with:\n\n• **Coding questions** - debugging, optimization, best practices\n• **General programming** - concepts, frameworks, languages\n• **Project guidance** - architecture, planning, code review\n• **Learning support** - explanations, tutorials, career advice\n\nWhat would you like to work on together?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeRelated = (input: string): boolean => {
    const codeKeywords = ['code', 'function', 'bug', 'error', 'debug', 'optimize', 'refactor', 'algorithm', 'syntax', 'compile', 'variable', 'class', 'method', 'api', 'database', 'framework'];
    return codeKeywords.some(keyword => input.toLowerCase().includes(keyword)) || 
           input.includes('```') || 
           /\b(if|for|while|function|class|import|export|const|let|var)\b/.test(input);
  };

  const isLearningRelated = (input: string): boolean => {
    const learningKeywords = ['learn', 'tutorial', 'explain', 'how to', 'what is', 'difference between', 'best way', 'recommend', 'guide', 'course', 'book'];
    return learningKeywords.some(keyword => input.toLowerCase().includes(keyword));
  };

  const handleCodingQuery = async (query: string) => {
    const language = activeFile ? activeFile.split('.').pop() || 'javascript' : 'javascript';
    
    if (query.toLowerCase().includes('analyze') || query.toLowerCase().includes('review')) {
      return await AIService.analyzeCode(currentCode, language);
    } else if (query.toLowerCase().includes('optimize') || query.toLowerCase().includes('improve')) {
      return await AIService.optimizeCode(currentCode, language);
    } else if (query.toLowerCase().includes('explain') && currentCode) {
      return await AIService.explainCode(currentCode, language);
    } else {
      return await AIService.generateCode(query, language, currentCode);
    }
  };

  const handleLearningQuery = async (query: string) => {
    // Simulate educational AI responses
    return {
      content: generateLearningResponse(query),
      confidence: 0.9,
      reasoning: 'Educational content based on programming knowledge base'
    };
  };

  const handleGeneralQuery = async (query: string) => {
    // Simulate general AI conversation
    return {
      content: generateGeneralResponse(query),
      confidence: 0.85,
      reasoning: 'General AI assistant response'
    };
  };

  const generateLearningResponse = (query: string): string => {
    const responses = {
      'javascript': `## JavaScript Fundamentals

JavaScript is a versatile programming language that's essential for web development. Here's what you should know:

### Core Concepts:
• **Variables**: \`let\`, \`const\`, \`var\` - use \`const\` by default, \`let\` when reassigning
• **Functions**: Regular functions, arrow functions, and async functions
• **Objects & Arrays**: Data structures for organizing information
• **DOM Manipulation**: Interacting with web page elements
• **Async Programming**: Promises, async/await for handling asynchronous operations

### Best Practices:
• Use strict mode (\`'use strict'\`)
• Prefer \`const\` and \`let\` over \`var\`
• Use meaningful variable names
• Handle errors with try/catch blocks
• Write modular, reusable code

Would you like me to explain any specific JavaScript concept in detail?`,

      'react': `## React Development Guide

React is a powerful library for building user interfaces. Here's your learning path:

### Core Concepts:
• **Components**: Functional and class components
• **JSX**: JavaScript XML syntax for describing UI
• **Props**: Passing data between components
• **State**: Managing component data with \`useState\`
• **Effects**: Side effects with \`useEffect\`
• **Context**: Sharing state across components

### Modern React Patterns:
• **Hooks**: useState, useEffect, useContext, custom hooks
• **Component Composition**: Building complex UIs from simple components
• **Conditional Rendering**: Showing/hiding elements based on state
• **Lists & Keys**: Rendering dynamic content efficiently

### Development Tools:
• React DevTools browser extension
• Create React App for quick setup
• Vite for faster development builds

What specific React topic would you like to dive deeper into?`,

      'default': `I'd be happy to help you learn! Here are some ways I can assist:

### Programming Concepts:
• **Fundamentals**: Variables, functions, loops, conditionals
• **Data Structures**: Arrays, objects, maps, sets
• **Algorithms**: Sorting, searching, optimization
• **Design Patterns**: Common solutions to programming problems

### Web Development:
• **Frontend**: HTML, CSS, JavaScript, React, Vue
• **Backend**: Node.js, Python, databases, APIs
• **Full-Stack**: Connecting frontend and backend

### Best Practices:
• **Clean Code**: Writing readable, maintainable code
• **Testing**: Unit tests, integration tests
• **Version Control**: Git workflows and collaboration
• **Deployment**: Getting your code live

What specific topic interests you most? I can provide detailed explanations, examples, and learning resources!`
    };

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('javascript') || lowerQuery.includes('js')) {
      return responses.javascript;
    } else if (lowerQuery.includes('react')) {
      return responses.react;
    } else {
      return responses.default;
    }
  };

  const generateGeneralResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return "Hello! 👋 I'm Claude, your AI coding companion. I'm here to help with programming questions, code review, debugging, learning new technologies, or just having a conversation about development. What's on your mind today?";
    }
    
    if (lowerQuery.includes('help')) {
      return `I'm here to help! Here's what I can do for you:

🔧 **Coding Assistance**
• Debug and fix code issues
• Optimize performance and code quality
• Generate functions, components, and scripts
• Code reviews and best practices

💡 **Learning Support**
• Explain programming concepts
• Recommend learning resources
• Help with project planning
• Career guidance and interview prep

💬 **General Conversation**
• Discuss technology trends
• Architecture and design decisions
• Tool and framework recommendations
• Problem-solving strategies

Just ask me anything! I'm designed to be helpful, harmless, and honest in all our interactions.`;
    }
    
    if (lowerQuery.includes('project') || lowerQuery.includes('build')) {
      return `Great! I love helping with projects. Here's how we can work together:

### Project Planning:
• **Requirements Analysis**: What features do you need?
• **Technology Stack**: Choosing the right tools and frameworks
• **Architecture Design**: Structuring your application
• **Timeline & Milestones**: Breaking down the work

### Development Support:
• **Code Generation**: Creating boilerplate and components
• **Problem Solving**: Debugging and optimization
• **Code Review**: Ensuring quality and best practices
• **Testing Strategy**: Unit tests and integration tests

### Deployment & Maintenance:
• **Build Process**: Setting up CI/CD pipelines
• **Performance Optimization**: Making your app fast
• **Security**: Protecting against vulnerabilities
• **Monitoring**: Tracking performance and errors

What kind of project are you working on? I'd love to help you succeed!`;
    }
    
    return `That's an interesting question! I'm Claude, an AI assistant created by Anthropic to be helpful, harmless, and honest. 

I can help you with a wide range of programming and development tasks:
• Writing and debugging code
• Explaining complex concepts
• Reviewing and optimizing code
• Planning software architecture
• Learning new technologies
• General programming discussions

I aim to provide accurate, helpful responses while being conversational and easy to work with. What would you like to explore together?`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const message: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: `📁 **Uploaded file: ${file.name}**\n\n\`\`\`\n${content.substring(0, 1000)}${content.length > 1000 ? '...\n[File truncated for display]' : ''}\n\`\`\`\n\nPlease analyze this file and let me know what you think!`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, message]);
          
          // Auto-analyze the uploaded file
          setTimeout(() => {
            const analysisMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: `## File Analysis: ${file.name}

I've analyzed your uploaded file. Here's what I found:

### File Details:
• **Size**: ${(file.size / 1024).toFixed(2)} KB
• **Type**: ${file.type || 'Unknown'}
• **Lines**: ~${content.split('\n').length}

### Quick Assessment:
${getFileAnalysis(file.name, content)}

Would you like me to:
• Provide detailed code review and suggestions?
• Explain specific parts of the code?
• Help optimize or refactor sections?
• Generate tests for this code?

Just let me know how I can help!`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, analysisMessage]);
          }, 1000);
        };
        reader.readAsText(file);
      });
    }
  };

  const getFileAnalysis = (filename: string, content: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const lines = content.split('\n').length;
    const hasComments = content.includes('//') || content.includes('/*') || content.includes('#');
    const hasFunctions = content.includes('function') || content.includes('=>') || content.includes('def ');
    
    let analysis = '';
    
    if (extension === 'js' || extension === 'jsx' || extension === 'ts' || extension === 'tsx') {
      analysis = `This appears to be a ${extension.toUpperCase()} file with ${lines} lines. `;
      if (hasFunctions) analysis += 'I can see function definitions. ';
      if (hasComments) analysis += 'Good documentation with comments. ';
      analysis += 'The code structure looks organized.';
    } else if (extension === 'py') {
      analysis = `This is a Python file with ${lines} lines. `;
      if (content.includes('import ')) analysis += 'Uses external libraries. ';
      if (content.includes('class ')) analysis += 'Contains class definitions. ';
      if (hasComments) analysis += 'Well-documented code. ';
    } else {
      analysis = `This is a ${extension || 'text'} file with ${lines} lines. The content appears to be well-structured.`;
    }
    
    return analysis;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { 
      icon: <MessageSquare className="w-4 h-4" />, 
      text: "General Help", 
      prompt: "Hi! Can you help me with my programming project?",
      mode: 'general'
    },
    { 
      icon: <Brain className="w-4 h-4" />, 
      text: "Code Review", 
      prompt: "Please review my current code and suggest improvements.",
      mode: 'coding'
    },
    { 
      icon: <BookOpen className="w-4 h-4" />, 
      text: "Learn Concept", 
      prompt: "Can you explain how React hooks work with examples?",
      mode: 'learning'
    },
    { 
      icon: <Wand2 className="w-4 h-4" />, 
      text: "Generate Code", 
      prompt: "Help me create a responsive navigation component in React.",
      mode: 'coding'
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'coding': return 'from-blue-500 to-purple-600';
      case 'learning': return 'from-green-500 to-blue-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  const getModeIcon = () => {
    switch (conversationMode) {
      case 'coding': return <Code className="w-4 h-4" />;
      case 'learning': return <BookOpen className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 bg-gradient-to-br ${getModeColor(conversationMode)} rounded-lg flex items-center justify-center`}>
            {getModeIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Claude AI Assistant</h3>
            <p className="text-xs text-gray-400 capitalize">{conversationMode} mode • Always helpful</p>
          </div>
          {confidence > 0 && (
            <div className="ml-auto">
              <div className="text-xs text-gray-400">Confidence</div>
              <div className="text-sm font-medium text-green-400">{Math.round(confidence * 100)}%</div>
            </div>
          )}
        </div>
        {activeFile && (
          <p className="text-xs text-gray-400 mt-1">
            📁 Context: {activeFile} • {currentCode.split('\n').length} lines
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-4'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 mr-4'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'assistant' && (
                  <div className={`w-6 h-6 bg-gradient-to-br ${getModeColor(conversationMode)} rounded-full flex items-center justify-center mt-0.5 flex-shrink-0`}>
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                )}
                {message.type === 'user' && (
                  <User className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0 order-last" />
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    {message.type === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 rounded-lg p-3 max-w-[85%]">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${getModeColor(conversationMode)} rounded-full flex items-center justify-center`}>
                  <Brain className="w-3 h-3 text-white animate-pulse" />
                </div>
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 bg-gradient-to-r ${getModeColor(conversationMode)} rounded-full animate-bounce`} />
                  <div className={`w-2 h-2 bg-gradient-to-r ${getModeColor(conversationMode)} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }} />
                  <div className={`w-2 h-2 bg-gradient-to-r ${getModeColor(conversationMode)} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-sm text-gray-300">Claude is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-3">🚀 Quick Start:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(prompt.prompt);
                  setConversationMode(prompt.mode as any);
                }}
                className={`flex items-center space-x-2 p-3 bg-gradient-to-r ${getModeColor(prompt.mode)} hover:opacity-90 rounded-lg text-sm text-left transition-all duration-200 transform hover:scale-105 text-white`}
              >
                <div>{prompt.icon}</div>
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="px-4 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <FolderOpen className="w-3 h-3" />
            <span>Upload files for analysis</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded text-xs transition-all"
          >
            <Upload className="w-3 h-3" />
            <span>Upload</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.md,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Cpu className="w-3 h-3" />
            <span>Claude AI • Context-aware • Helpful & Honest</span>
          </div>
          {currentCode && (
            <div className="text-xs text-gray-400">
              {currentCode.split('\n').length} lines in context
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about coding, or just say hello..."
            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`px-6 py-3 bg-gradient-to-r ${getModeColor(conversationMode)} hover:opacity-90 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;