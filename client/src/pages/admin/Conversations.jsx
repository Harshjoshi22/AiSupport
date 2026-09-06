import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/chat.service';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { MessageSquare, Bot, Headphones, Search, Filter } from 'lucide-react';

export const AdminConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [modeFilter, setModeFilter] = useState('all');

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await chatService.getConversations({
        mode: modeFilter !== 'all' ? modeFilter : undefined,
      });
      setConversations(res.conversations || []);
      if (res.conversations?.length > 0 && !selectedConversation) {
        selectConversation(res.conversations[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [modeFilter]);

  const selectConversation = async (id) => {
    setChatLoading(true);
    try {
      const res = await chatService.getConversationById(id);
      setSelectedConversation(res.conversation);
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleNewMessage = (newMsg) => {
    setMessages((prev) => {
      if (prev.find((m) => m._id === newMsg._id)) return prev;
      return [...prev, newMsg];
    });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading Organization Conversations..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Support Conversation Logs</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review live and resolved dialogues between learners, AI, and human agents
        </p>
      </div>

      <div className="h-[calc(100vh-210px)] flex gap-4 overflow-hidden">
        {/* Left Side: Sessions List */}
        <div className="w-80 flex flex-col bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shrink-0 shadow-lg">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">All Sessions</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Modes</option>
              <option value="human">Human Support</option>
              <option value="ai">AI Handled</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {conversations.map((c) => {
              const isSelected = selectedConversation?._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => selectConversation(c._id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-brand-950/40 border-brand-500/40 text-white'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                      {c.customerId?.name || 'Customer'}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : c.mode === 'human' || c.status === 'HUMAN_REQUIRED'
                          ? 'bg-purple-950 text-purple-400 border border-purple-500/30'
                          : 'bg-brand-950 text-brand-400 border border-brand-500/30'
                      }`}
                    >
                      {c.status === 'RESOLVED' ? 'RESOLVED' : c.mode === 'human' || c.status === 'HUMAN_REQUIRED' ? 'HUMAN' : 'AI'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white truncate">{c.title || 'Support Chat'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{formatDate(c.updatedAt)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="flex-1 overflow-hidden">
          {chatLoading ? (
            <div className="h-full flex items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800">
              <LoadingSpinner size="md" text="Loading session messages..." />
            </div>
          ) : (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onNewMessage={handleNewMessage}
              onConversationUpdated={setSelectedConversation}
              isAgentView={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};
