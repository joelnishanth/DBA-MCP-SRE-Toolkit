import React, { useState, useRef, useEffect, useCallback } from 'react';
import LiquidGlassCard from './LiquidGlassCard';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  context: 'executive' | 'inventory' | 'cost' | 'chargeback' | 'optimization';
  data?: any;
  onAction?: (action: string, params: any) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ context, data, onAction }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Debug logging
  console.log('AIAssistant props:', { context, data: !!data, onAction: !!onAction });

  const contextPrompts = {
    executive: {
      welcome: "👋 Hi! I'm your AI Executive Assistant. I can help you analyze costs, identify trends, and provide strategic insights. Try asking: 'What are our biggest cost drivers?' or 'Show me this month's spending trends'",
      placeholder: "Ask about costs, trends, or strategic insights..."
    },
    inventory: {
      welcome: "🗄️ Hi! I'm your Database Inventory AI. I can help you find databases, analyze configurations, and suggest optimizations. Try: 'Show me all PostgreSQL databases' or 'Which applications have the most databases?'",
      placeholder: "Ask about databases, applications, or configurations..."
    },
    cost: {
      welcome: "💰 Hi! I'm your Cost Analysis AI. I can analyze spending patterns, predict costs, and identify savings opportunities. Try: 'What's driving our costs up?' or 'Predict next month's spending'",
      placeholder: "Ask about costs, budgets, or savings opportunities..."
    },
    chargeback: {
      welcome: "📋 Hi! I'm your Chargeback AI. I can help allocate costs fairly, analyze team usage, and optimize billing models. Try: 'How should we allocate database costs?' or 'Which team uses the most resources?'",
      placeholder: "Ask about cost allocation, team usage, or billing..."
    },
    optimization: {
      welcome: "⚡ Hi! I'm your Optimization AI. I can analyze performance, suggest improvements, and calculate ROI. Try: 'What can we optimize?' or 'Show me underutilized resources'",
      placeholder: "Ask about performance, optimization, or resource usage..."
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: contextPrompts[context].welcome,
        timestamp: new Date()
      }]);
    }
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use dedicated infrastructure AI endpoint with Claude integration
      const botCoreUrl = import.meta.env.VITE_BOT_CORE_URL || 'http://localhost:6000';
      const response = await fetch(`${botCoreUrl}/infrastructure-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input,
          context: context,
          data: data
        })
      });

      const result = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.response || result.answer || result.message || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle any actions suggested by AI
      if (result.action && onAction) {
        onAction(result.action, result.params);
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble connecting to my AI services right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, context, data, onAction]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getContextIcon = () => {
    const icons = {
      executive: '📊',
      inventory: '🗄️',
      cost: '💰',
      chargeback: '📋',
      optimization: '⚡'
    };
    return icons[context];
  };

  const getContextColor = () => {
    const colors = {
      executive: 'from-purple-500 to-blue-500',
      inventory: 'from-green-500 to-teal-500',
      cost: 'from-yellow-500 to-orange-500',
      chargeback: 'from-blue-500 to-indigo-500',
      optimization: 'from-red-500 to-pink-500'
    };
    return colors[context];
  };

  console.log('AIAssistant render - isExpanded:', isExpanded, 'context:', context);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            console.log('AI Assistant button clicked, expanding...');
            setIsExpanded(true);
          }}
          className={`
            w-16 h-16 rounded-full bg-gradient-to-r ${getContextColor()} 
            text-white shadow-lg hover:shadow-xl transform hover:scale-110 
            transition-all duration-200 flex items-center justify-center text-2xl
          `}
        >
          {getContextIcon()}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px]">
      <LiquidGlassCard className="h-full flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getContextColor()} text-white p-4 rounded-t-lg flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getContextIcon()}</span>
            <span className="font-semibold">AI Assistant</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] p-3 rounded-lg text-sm
                  ${message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }
                `}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={contextPrompts[context].placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`
                px-4 py-2 bg-gradient-to-r ${getContextColor()} text-white rounded-lg 
                hover:shadow-md transition-all duration-200 disabled:opacity-50 
                disabled:cursor-not-allowed text-sm font-medium
              `}
            >
              Send
            </button>
          </div>
        </div>
      </LiquidGlassCard>
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .floating-chat-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .floating-chat-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .floating-chat-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }
        .floating-chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;