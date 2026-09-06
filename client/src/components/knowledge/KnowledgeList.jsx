import React from 'react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { BookOpen, FileText, HelpCircle, Trash2, Edit3, Layers, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const KnowledgeList = ({ documents = [], onEdit, onDelete, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
        <BookOpen className="w-12 h-12 text-slate-600 mb-2" />
        <h4 className="text-base font-bold text-slate-300">No Knowledge Articles</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Add your company FAQs, refund policies, or upload documentation so the AI can answer customer inquiries accurately.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3 h-3" /> Indexed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 animate-spin" /> Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="danger" size="sm">
            <AlertCircle className="w-3 h-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="default" size="sm">Pending</Badge>;
    }
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case 'faq':
        return <HelpCircle className="w-5 h-5 text-amber-400" />;
      case 'upload':
        return <FileText className="w-5 h-5 text-purple-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-sm space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shrink-0">
                {getSourceIcon(doc.sourceType)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-white tracking-tight">{doc.title}</h4>
                  <Badge variant="brand" size="sm">{doc.category}</Badge>
                  {getStatusBadge(doc.processingStatus)}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-brand-400" />
                    {doc.chunkCount || 0} Vector Chunks
                  </span>
                  <span>•</span>
                  <span>Type: {doc.fileType.toUpperCase()}</span>
                  <span>•</span>
                  <span>Added {formatDate(doc.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {onEdit && (
                <button
                  onClick={() => onEdit(doc)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit Knowledge"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(doc._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Delete Knowledge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Snippet */}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 font-mono">
            {doc.rawContent}
          </p>

          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {doc.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 border border-slate-800"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
