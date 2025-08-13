import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Lightbulb, Zap, Copy, Brain, Sparkles, FileCode, Cpu } from 'lucide-react';
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
      content: "🚀 **Claude-4-Professional AI Assistant** ready!\n\nI'm your advanced coding companion with capabilities including:\n\n🔍 **Advanced Code Analysis**\n• Real-time bug detection and fixes\n• Performance optimization suggestions\n• Security vulnerability scanning\n• Code complexity analysis\n\n⚡ **Intelligent Code Generation**\n• Context-aware completions\n• Full function/component generation\n• Test case creation\n• Documentation generation\n\n🧠 **Expert Knowledge**\n• Best practices for 20+ languages\n• Architecture and design patterns\n• Performance optimization techniques\n• Modern development workflows\n\n**Ready to elevate your code?** Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setInput('');
    setIsLoading(true);

    try {
      let aiResponse;
      const language = activeFile ? activeFile.split('.').pop() || 'javascript' : 'javascript';
      
      // Determine the type of request
      if (input.toLowerCase().includes('analyze') || input.toLowerCase().includes('review')) {
        aiResponse = await AIService.analyzeCode(currentCode, language);
        const analysisMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: formatAnalysisResponse(aiResponse),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, analysisMessage]);
      } else if (input.toLowerCase().includes('optimize') || input.toLowerCase().includes('improve')) {
        aiResponse = await AIService.optimizeCode(currentCode, language);
        const optimizeMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, optimizeMessage]);
        setConfidence(aiResponse.confidence);
      } else if (input.toLowerCase().includes('explain')) {
        aiResponse = await AIService.explainCode(currentCode, language);
        const explainMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, explainMessage]);
        setConfidence(aiResponse.confidence);
      } else {
        // General code generation or assistance
        aiResponse = await AIService.generateCode(input, language, currentCode);
        const generateMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, generateMessage]);
        setConfidence(aiResponse.confidence);
        
        // If there's generated code, offer to apply it
        if (aiResponse.codeBlocks && aiResponse.codeBlocks.length > 0) {
          setTimeout(() => {
            const applyMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              type: 'assistant',
              content: `Would you like me to apply this code to your editor?\n\n**Generated Code:**\n\`\`\`${aiResponse.codeBlocks![0].language}\n${aiResponse.codeBlocks![0].code}\n\`\`\``,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, applyMessage]);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('AI request failed:', error);
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I encountered an error processing your request. However, I can still help you with:\n\n• Code analysis and debugging\n• Performance optimization\n• Best practices and patterns\n• Architecture suggestions\n\nPlease try rephrasing your question or ask about a specific coding challenge!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnalysisResponse = (analysis: any): string => {
    return `## 🔍 Code Analysis Complete

### Quality Metrics:
• **Complexity Score**: ${analysis.complexity}/10 ${analysis.complexity <= 3 ? '✅ Excellent' : analysis.complexity <= 6 ? '⚠️ Moderate' : '❌ High'}
• **Maintainability**: ${analysis.maintainability}% ${analysis.maintainability >= 80 ? '✅ Excellent' : analysis.maintainability >= 60 ? '⚠️ Good' : '❌ Needs Work'}
• **Performance Score**: ${analysis.performance}% ${analysis.performance >= 80 ? '✅ Optimized' : analysis.performance >= 60 ? '⚠️ Acceptable' : '❌ Needs Optimization'}

### Issues Detected:
${analysis.issues.length > 0 ? 
  analysis.issues.map((issue: any) => `• **Line ${issue.line}**: ${issue.message} ${issue.fixable ? '🔧 *Fixable*' : ''}`).join('\n') : 
  '✅ No major issues found!'}

### Optimization Suggestions:
${analysis.suggestions.length > 0 ? 
  analysis.suggestions.map((suggestion: any) => `• **${suggestion.type}**: ${suggestion.description}`).join('\n') : 
  '✅ Code follows good practices!'}

Would you like me to apply any of these optimizations or explain any specific issues?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { icon: <Brain className="w-4 h-4" />, text: "Analyze Code", prompt: "Please analyze my current code for issues, complexity, and quality metrics." },
    { icon: <Sparkles className="w-4 h-4" />, text: "Optimize Performance", prompt: "Optimize this code for better performance and maintainability." },
    { icon: <FileCode className="w-4 h-4" />, text: "Explain Code", prompt: "Explain how this code works and its key components." },
    { icon: <Cpu className="w-4 h-4" />, text: "Generate Tests", prompt: "Generate comprehensive unit tests for this code." },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Claude-4-Professional</h3>
            <p className="text-xs text-gray-400">Advanced AI Coding Assistant</p>
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
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
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
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Brain className="w-3 h-3 text-white animate-pulse" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-sm text-gray-300">Analyzing with Claude-4...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-3">🚀 Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt.prompt)}
                className="flex items-center space-x-2 p-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg text-sm text-left transition-all duration-200 transform hover:scale-105"
              >
                <div className="text-blue-400">{prompt.icon}</div>
                <span className="text-gray-200">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Cpu className="w-3 h-3" />
            <span>Claude-4-Professional • Context-aware • Real-time analysis</span>
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
            placeholder="Ask Claude-4 anything about your code..."
            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
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