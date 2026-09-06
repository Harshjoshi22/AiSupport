import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatService } from '../../services/chat.service';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  Headphones,
  Bot,
  User,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  Send,
  MessageSquare,
} from 'lucide-react';

export const AgentConversation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('id');

  const { success, error: toastError } = useToast();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [filterMode, setFilterMode] = useState('all');

  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations({
        mode: filterMode !== 'all' ? filterMode : undefined,
      });
      setConversations(res.conversations || []);

      if (res.conversations?.length > 0 && !activeId) {
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
  }, [filterMode]);

  const selectConversation = async (id) => {
    setSearchParams({ id });
    setChatLoading(true);
    setAiSummary(null);

    try {
      const res = await chatService.getConversationById(id);
      setCurrentConversation(res.conversation);
      setMessages(res.messages || []);
    } catch (err) {
      toastError('Failed to load conversation');
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (activeId) {
      selectConversation(activeId);
    }
  }, [activeId]);

  const handleTakeOver = async () => {
    if (!currentConversation) return;
    try {
      const res = await chatService.takeOverConversation(currentConversation._id);
      setCurrentConversation(res.conversation);
      success('Conversation assigned to you. Live human support mode active.');
      fetchConversations();
    } catch (err) {
      toastError('Could not take over conversation');
    }
  };

  const handleGenerateSummary = async () => {
    if (!currentConversation) return;
    setLoadingSummary(true);
    try {
      const res = await chatService.summarizeChat(currentConversation._id);
      setAiSummary(res.summary);
      success('AI Conversation Summary generated');
    } catch (err) {
      toastError('Failed to generate summary');
    } finally {
      setLoadingSummary(false);
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
        <LoadingSpinner size="lg" text="Loading Live Support Desk..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-3">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Agent Live Chat Desk</h3>
            <p className="text-[11px] text-slate-400">Real-time customer-agent interactive chat with AI copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentConversation && currentConversation.mode === 'ai' && (
            <Button variant="primary" size="sm" icon={Headphones} onClick={handleTakeOver}>
              Take Over Conversation
            </Button>
          )}

          {currentConversation && (
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={handleGenerateSummary}
              loading={loadingSummary}
            >
              Generate AI Summary
            </Button>
          )}
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Side: Conversation Queue */}
        <div className="w-80 flex flex-col bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shrink-0 shadow-lg">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="human">Human Required</option>
              <option value="ai">AI Active</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {conversations.map((c) => {
              const isSelected = currentConversation?._id === c._id;
              const isResolved = c.status === 'RESOLVED';
              const isHuman = c.mode === 'human' || c.status === 'HUMAN_REQUIRED';
              return (
                <div
                  key={c._id}
                  onClick={() => selectConversation(c._id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
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
                        isResolved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : isHuman
                          ? 'bg-purple-950 text-purple-400 border border-purple-500/30'
                          : 'bg-brand-950 text-brand-400 border border-brand-500/30'
                      }`}
                    >
                      {isResolved ? 'RESOLVED' : isHuman ? 'HUMAN' : 'AI'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white truncate">{c.title || 'Support Chat'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{formatDate(c.updatedAt)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Chat Window & AI Summary Inspector */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* AI Summary Banner if generated */}
          {aiSummary && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/20 text-xs space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Conversation Summary
                </span>
                <button
                  onClick={() => setAiSummary(null)}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-slate-200 font-semibold">{aiSummary.shortSummary}</p>
              {aiSummary.suggestedAction && (
                <p className="text-[11px] text-brand-300">
                  <span className="font-bold">Suggested Action: </span>
                  {aiSummary.suggestedAction}
                </p>
              )}
            </div>
          )}

          {/* Chat Window */}
          <div className="flex-1 overflow-hidden">
            {chatLoading ? (
              <div className="h-full flex items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800">
                <LoadingSpinner size="md" text="Loading chat feed..." />
              </div>
            ) : (
              <ChatWindow
                conversation={currentConversation}
                messages={messages}
                onNewMessage={handleNewMessage}
                onConversationUpdated={setCurrentConversation}
                isAgentView={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
