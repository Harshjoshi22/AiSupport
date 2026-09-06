import React, { useState, useEffect } from 'react';
import { knowledgeService } from '../../services/knowledge.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  BookOpen,
  Search,
  Building2,
  FileText,
  HelpCircle,
  Tag,
  Eye,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const AgentKnowledge = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const orgName = user?.organization?.name || 'Company';

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await knowledgeService.getKnowledge({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined,
      });
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to load knowledge documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchKnowledge();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">{orgName} Knowledge Base</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              Read-Only Access
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse company policies, troubleshooting guides, FAQs, and product documentation to assist customers
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glass-panel flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company knowledge articles and policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="Courses">Courses</option>
            <option value="Pricing">Pricing</option>
            <option value="Refund Policy">Refund Policy</option>
            <option value="Account">Account</option>
            <option value="Technical">Technical</option>
            <option value="FAQ">FAQ</option>
          </select>

          <Button variant="primary" size="sm" onClick={fetchKnowledge} loading={loading}>
            Search
          </Button>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="md" text="Loading company knowledge..." />
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-base font-bold text-white">No Knowledge Articles Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No company knowledge documents matched your search filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => setSelectedDoc(doc)}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/40 shadow-xl transition-all glass-panel cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[11px] font-semibold">
                    {doc.category || 'General'}
                  </span>
                  <span className="text-[10px] text-slate-500">{formatDate(doc.updatedAt)}</span>
                </div>

                <h3 className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors line-clamp-1">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {doc.rawContent || 'No preview available.'}
                </p>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 text-[10px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-brand-400 font-semibold">
                <span>Read Full Article</span>
                <Eye className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ARTICLE DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || 'Knowledge Article'}
        size="lg"
      >
        {selectedDoc && (
          <div className="space-y-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="sm">
                  {selectedDoc.category}
                </Badge>
                <span className="text-slate-400">Indexed for {orgName} AI Support</span>
              </div>
              <span className="text-slate-500">Updated {formatDate(selectedDoc.updatedAt)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {selectedDoc.rawContent}
            </div>

            {selectedDoc.tags && selectedDoc.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
