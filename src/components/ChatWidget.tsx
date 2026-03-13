import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Headset, Minimize2 } from 'lucide-react';
import { Message } from '../types';

interface ChatWidgetProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hasUnread: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ messages, onSendMessage, isOpen, setIsOpen, hasUnread }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-surface border border-zinc-800 w-[90vw] sm:w-[380px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-accentOrange/10 flex items-center justify-center text-accentOrange border border-accentOrange/20">
                  <Headset size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Priority Support</h3>
                <p className="text-xs text-zinc-400">Typical reply: &lt; 2 min</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50 scrollbar-thin scrollbar-thumb-zinc-700">
             <div className="flex justify-center my-2">
                <span className="text-[10px] text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                   Today
                </span>
             </div>
             
             {/* Default Welcome Message */}
             {messages.length === 0 && (
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-accentOrange/10 flex items-center justify-center text-accentOrange shrink-0 mt-1">
                      <Headset size={14} />
                   </div>
                   <div className="bg-zinc-800 border border-zinc-700/50 text-zinc-200 p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed max-w-[85%]">
                      Hello! How can we help you with your trading account today?
                   </div>
                </div>
             )}

             {messages.map((msg) => (
               <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.sender === 'admin' && (
                    <div className="w-8 h-8 rounded-full bg-accentOrange/10 flex items-center justify-center text-accentOrange shrink-0 mt-1">
                      <Headset size={14} />
                    </div>
                  )}
                  
                  <div className={`
                    p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] break-words
                    ${msg.sender === 'user' 
                      ? 'bg-accentGreen text-white rounded-tr-none shadow-lg shadow-green-900/10' 
                      : 'bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-tl-none'}
                  `}>
                    {msg.text}
                    <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-green-200/70' : 'text-zinc-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
               </div>
             ))}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
             <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accentOrange transition-colors placeholder:text-zinc-600"
             />
             <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-accentOrange text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/20"
             >
                <Send size={18} />
             </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-accentOrange hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl shadow-orange-900/40 transition-all hover:scale-105 active:scale-95 relative group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Notification Dot */}
        {hasUnread && !isOpen && (
           <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-zinc-900 rounded-full animate-pulse"></span>
        )}
        
        {!isOpen && (
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 pointer-events-none">
                Live Support
            </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;