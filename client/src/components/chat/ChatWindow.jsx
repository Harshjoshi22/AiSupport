import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { EscalationModal } from './EscalationModal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../services/chat.service';
import { useToast } from '../../context/ToastContext';
import {
  Bot,
  Headphones,
  Sparkles,
  CheckCircle,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';

export const ChatWindow = ({
  conversation,
  messages = [],
  onNewMessage,
  onConversationUpdated,
  onStartNewChat,
  isAgentView = false,
}) => {
  const { user, isCustomer } = useAuth();
  const { success, error: toastError } = useToast();
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const messagesEndRef = useRef(null);

  const { socket, typingUsers, startTyping, stopTyping } = useSocket(conversation?._id);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  // Listen to incoming socket messages in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (onNewMessage) {
        onNewMessage(newMsg);
      }
      setIsAiTyping(false);
    };

    const handleEscalated = (data) => {
      success('Conversation escalated to human agent queue!');
      if (onConversationUpdated) {
        onConversationUpdated(data.conversation || { ...conversation, status: 'HUMAN_REQUIRED', mode: 'human' });
      }
    };

    const handleResolved = (data) => {
      success('Conversation marked as resolved.');
      if (onConversationUpdated) {
        onConversationUpdated(data.conversation || { ...conversation, status: 'RESOLVED' });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_escalated', handleEscalated);
    socket.on('conversation_resolved', handleResolved);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_escalated', handleEscalated);
      socket.off('conversation_resolved', handleResolved);
    };
  }, [socket, conversation, onNewMessage, onConversationUpdated, success]);

  const handleSend = async (content) => {
    if (!conversation) return;

    if (isCustomer && conversation.mode === 'ai') {
      setIsAiTyping(true);
    }

    try {
      const response = await chatService.sendMessage(conversation._id, content);
      if (response.customerMessage && onNewMessage) {
        onNewMessage(response.customerMessage);
      }
      if (response.aiMessage && onNewMessage) {
        onNewMessage(response.aiMessage);
      }
      if (response.message && onNewMessage) {
        onNewMessage(response.message);
      }
      if (response.resolved && onConversationUpdated) {
        onConversationUpdated({ ...conversation, status: 'RESOLVED' });
        success('Issue resolved! Session marked as completed.');
      } else if (response.escalated && onConversationUpdated) {
        onConversationUpdated({ ...conversation, status: 'HUMAN_REQUIRED', mode: 'human' });
        success('Conversation transferred to human support agent!');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleEscalateConfirm = async (reason) => {
    setIsEscalating(true);
    try {
      const res = await chatService.escalateConversation(conversation._id, reason);
      success('Transferred to human support queue.');
      setIsEscalateOpen(false);
      if (onConversationUpdated) {
        onConversationUpdated(res.conversation);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to request human support');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleResolve = async () => {
    if (!conversation) return;
    setIsResolving(true);
    try {
      const res = await chatService.resolveConversation(conversation._id);
      success('Ticket & conversation resolved successfully.');
      if (onConversationUpdated) {
        onConversationUpdated(res.conversation);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to resolve ticket');
    } finally {
      setIsResolving(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <Bot className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="text-lg font-bold text-white">AI Customer Support</h4>
          <p className="text-xs text-slate-400">
            Get instant answers to your questions, search our course catalog & policies, or connect with a support agent.
          </p>
        </div>
        {onStartNewChat && (
          <Button variant="primary" size="md" onClick={onStartNewChat}>
            Start New Session
          </Button>
        )}
      </div>
    );
  }

  const isResolved = (conversation.status || '').toUpperCase() === 'RESOLVED';
  const isHumanMode = conversation.mode === 'human' || (conversation.status || '').toUpperCase() === 'HUMAN_REQUIRED';

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isResolved
                ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400'
                : isHumanMode
                ? 'bg-purple-950/80 border border-purple-500/30 text-purple-400'
                : 'bg-brand-950/80 border border-brand-500/30 text-brand-400'
            }`}
          >
            {isResolved ? (
              <CheckCheck className="w-5 h-5" />
            ) : isHumanMode ? (
              <Headphones className="w-5 h-5" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base leading-snug truncate">
                {conversation.title || 'Support Session'}
              </h3>
              {isResolved ? (
                <Badge variant="success" size="sm">Resolved</Badge>
              ) : isHumanMode ? (
                <Badge variant="purple" size="sm">Human Support</Badge>
              ) : (
                <Badge variant="brand" size="sm">AI Assistant</Badge>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {isResolved
                ? 'Issue completed & resolved'
                : isHumanMode
                ? conversation.assignedAgentId
                  ? `Agent: ${conversation.assignedAgentId.name || 'Support Agent'}`
                  : 'Assigned to Human Support Queue'
                : 'AI Support powered by Company Knowledge Base'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isCustomer && !isResolved && !isHumanMode && (
            <Button
              variant="secondary"
              size="sm"
              icon={Headphones}
              onClick={() => setIsEscalateOpen(true)}
              className="text-xs"
            >
              Request Human
            </Button>
          )}

          {isAgentView && !isResolved && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle}
              onClick={handleResolve}
              loading={isResolving}
              className="bg-emerald-600 hover:bg-emerald-500 text-xs"
            >
              Resolve Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Resolved Notification Banner for Customer */}
      {isResolved && (
        <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            This conversation is marked as resolved. You can click "New Session" anytime to start fresh.
          </span>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} currentUserId={user?._id} />

      {/* Typing Indicator */}
      <TypingIndicator isAiTyping={isAiTyping} typingUsers={typingUsers} />

      <div ref={messagesEndRef} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSend}
        onTyping={(isTyping) => (isTyping ? startTyping() : stopTyping())}
        placeholder={
          isResolved
            ? 'Type a message to reopen or ask a follow-up...'
            : isHumanMode
            ? 'Type a message to the support agent...'
            : 'Ask a question or describe your issue...'
        }
      />

      {/* Escalation Modal */}
      <EscalationModal
        isOpen={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        onEscalate={handleEscalateConfirm}
        loading={isEscalating}
      />
    </div>
  );
};
