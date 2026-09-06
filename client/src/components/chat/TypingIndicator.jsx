import React from 'react';
import { Bot, User } from 'lucide-react';

export const TypingIndicator = ({ typingUsers = [], isAiTyping = false }) => {
  if (!isAiTyping && (!typingUsers || typingUsers.length === 0)) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-xs text-slate-400">
      <div className="w-7 h-7 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
        {isAiTyping ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
        <span className="font-medium">
          {isAiTyping
            ? 'AI Assistant is thinking...'
            : `${typingUsers.map((u) => u.userName).join(', ')} is typing...`}
        </span>
        <div className="flex items-center gap-1 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
