import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { chatService } from '../../services/chat.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const CustomerChat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('id');

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const sampleQuestions = [
    'What is the price of the MERN Stack course?',
    'What is SkillUp Academy\'s refund policy?',
    'Can I get a refund after 20 days?',
    'What are your customer support working hours?',
    'I paid for Python course but it is locked in dashboard.',
  ];

  const loadConversation = async (id = null) => {
    setLoading(true);
    try {
      if (id) {
        // Specific conversation requested via query param
        const res = await chatService.getConversationById(id);
        setConversation(res.conversation);
        setMessages(res.messages || []);
      } else {
        // No ID param -> Check if customer has an existing active conversation (OPEN or HUMAN_REQUIRED)
        const res = await chatService.getConversations();
        const active = (res.conversations || []).find(
          (c) => (c.status || '').toUpperCase() !== 'RESOLVED'
        );

        if (active) {
          const fullRes = await chatService.getConversationById(active._id);
          setConversation(fullRes.conversation);
          setMessages(fullRes.messages || []);
          setSearchParams({ id: active._id }, { replace: true });
        } else {
          // No active conversation exists -> DO NOT create one automatically
          setConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error loading conversation', err);
      setConversation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation(conversationIdParam);
  }, [conversationIdParam]);

  // Explicitly triggered ONLY when customer clicks "New Session"
  const handleStartNewChat = async () => {
    setLoading(true);
    try {
      const res = await chatService.startConversation();
      setConversation(res.conversation);
      setMessages(res.messages || []);
      setSearchParams({ id: res.conversation._id });
    } catch (err) {
      console.error('Error starting new session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (newMsg) => {
    setMessages((prev) => {
      if (prev.find((m) => m._id === newMsg._id)) return prev;
      return [...prev, newMsg];
    });
  };

  const handleQuestionClick = async (question) => {
    try {
      let currentConv = conversation;
      if (!currentConv) {
        setLoading(true);
        const startRes = await chatService.startConversation();
        currentConv = startRes.conversation;
        setConversation(currentConv);
        setMessages(startRes.messages || []);
        setSearchParams({ id: currentConv._id });
        setLoading(false);
      }
      const res = await chatService.sendMessage(currentConv._id, question);
      if (res.customerMessage) handleNewMessage(res.customerMessage);
      if (res.aiMessage) handleNewMessage(res.aiMessage);
    } catch (err) {
      console.error('Error sending question:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading AI Assistant..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-3">
      {/* Top Banner with Quick Starters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Inquiries:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuestionClick(q)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white transition-all text-left truncate max-w-xs"
            >
              {q}
            </button>
          ))}
        </div>

        <Button variant="secondary" size="sm" icon={PlusCircle} onClick={handleStartNewChat}>
          New Session
        </Button>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          conversation={conversation}
          messages={messages}
          onNewMessage={handleNewMessage}
          onConversationUpdated={setConversation}
          onStartNewChat={handleStartNewChat}
        />
      </div>
    </div>
  );
};
