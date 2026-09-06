import React from 'react';
import { Bot, User, Shield, Headphones, CheckCircle, Info, BookOpen } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const MessageList = ({ messages = [], currentUserId }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {messages.map((msg) => {
        const isCustomer = msg.senderType === 'customer';
        const isAi = msg.senderType === 'ai';
        const isAgent = msg.senderType === 'agent';
        const isSystem = msg.senderType === 'system';
        const isMe = msg.senderId?._id === currentUserId || msg.senderId === currentUserId;

        if (isSystem) {
          return (
            <div key={msg._id} className="flex justify-center my-3">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-brand-300 font-medium shadow-sm">
                <Info className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>{msg.content}</span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={msg._id}
            className={`flex items-start gap-3 max-w-[85%] ${
              isCustomer ? (isMe ? 'ml-auto flex-row-reverse' : 'mr-auto') : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                isAi
                  ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white'
                  : isAgent
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}
            >
              {isAi ? (
                <Bot className="w-4 h-4" />
              ) : isAgent ? (
                <Headphones className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-bold text-slate-400">
                  {isAi
                    ? 'AI Assistant'
                    : isAgent
                    ? `${msg.senderId?.name || 'Support Agent'} (Support)`
                    : msg.senderId?.name || 'Customer'}
                </span>
                <span className="text-[10px] text-slate-500">{formatRelativeTime(msg.createdAt)}</span>
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                  isCustomer
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : isAgent
                    ? 'bg-purple-950/60 border border-purple-500/30 text-purple-100 rounded-tl-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none glass-panel'
                }`}
              >
                {msg.content}

                {/* Sources Used Citation Badge for AI */}
                {isAi && msg.metadata?.sourcesUsed && msg.metadata.sourcesUsed.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-brand-400 font-semibold">
                      <BookOpen className="w-3 h-3" /> Verified Knowledge:
                    </span>
                    {msg.metadata.sourcesUsed.map((source, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
