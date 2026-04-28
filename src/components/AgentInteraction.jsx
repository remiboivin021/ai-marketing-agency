import React, { useState, useEffect } from 'react';
import { X, Send, User, Bot } from 'lucide-react';

// --- AGENT INTERACTION COMPONENT ---
function AgentInteraction({ agent, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Send message to agent API
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { 
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch(`/api/agents/${agent.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });
      
      if (response.ok) {
        const data = await response.json();
        const agentResponse = {
          id: data.id,
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, agentResponse]);
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      // Fallback response if API fails
      const fallbackResponse = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Error connecting to agent. Make sure backend is running.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0b0f1a] border border-white/10 rounded-xl w-[600px] h-[500px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2 rounded-lg">
              <Bot size={18} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold uppercase tracking-tight">{agent.name}</h2>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Agent Interaction</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Bot size={32} className="mb-2 opacity-50" />
              <p className="text-xs">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-100' 
                    : 'bg-white/5 border border-white/10 text-slate-300'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    <span className="text-[9px] text-slate-500 uppercase">{msg.role}</span>
                  </div>
                  <p className="text-xs">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot size={12} className="text-slate-400" />
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message to the agent..."
              disabled={loading}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-700 outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-cyan-950/40 border border-cyan-800 text-cyan-400 p-2 rounded-lg hover:bg-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentInteraction;