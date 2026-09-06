import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const MessageInput = ({ onSendMessage, onTyping, disabled = false, placeholder = 'Type your question or message...' }) => {
  const [content, setContent] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSendMessage(content.trim());
    setContent('');

    if (onTyping) {
      onTyping(false);
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-800">
      <textarea
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={placeholder}
        className="flex-1 max-h-32 min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={!content.trim() || disabled}
        className="h-[44px] px-4 shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
