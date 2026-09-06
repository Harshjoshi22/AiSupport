import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatService } from '../../services/chat.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { MessageSquare, Bot, Headphones, ChevronRight, Clock } from 'lucide-react';

export const CustomerConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await chatService.getConversations();
        setConversations(res.conversations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading conversations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Support Conversations</h2>
        <p className="text-xs text-slate-400 mt-1">Review past AI dialogues and human agent support chats</p>
      </div>

      <div className="space-y-3">
        {conversations.length > 0 ? (
          conversations.map((c) => (
            <Link
              key={c._id}
              to={`/chat?id=${c._id}`}
              className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all duration-200 group block glass-panel shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    c.mode === 'human'
                      ? 'bg-purple-950/80 border border-purple-500/30 text-purple-400'
                      : 'bg-brand-950/80 border border-brand-500/30 text-brand-400'
                  }`}
                >
                  {c.mode === 'human' ? <Headphones className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-300 transition-colors">
                      {c.title || 'Support Session'}
                    </h4>
                    {c.status === 'RESOLVED' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-950/80 border-emerald-500/30 text-emerald-400">
                        RESOLVED
                      </span>
                    ) : c.mode === 'human' || c.status === 'HUMAN_REQUIRED' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-purple-950/80 border-purple-500/30 text-purple-400">
                        HUMAN SUPPORT
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-brand-950/80 border-brand-500/30 text-brand-400">
                        AI ASSISTANT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Last activity {formatDate(c.updatedAt)}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </Link>
          ))
        ) : (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-300">No conversations yet</h4>
            <p className="text-xs text-slate-500 mt-1">Start a conversation with our AI customer support assistant.</p>
          </div>
        )}
      </div>
    </div>
  );
};
