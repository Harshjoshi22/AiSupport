import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQViewer = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors glass-panel"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full p-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-brand-300"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{faq.question || faq.title}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isOpen && (
              <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                {faq.answer || faq.rawContent}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
