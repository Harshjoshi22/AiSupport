import React, { useState, useEffect } from 'react';
import { knowledgeService } from '../../services/knowledge.service';
import { KnowledgeList } from '../../components/knowledge/KnowledgeList';
import { AddKnowledgeModal } from '../../components/knowledge/AddKnowledgeModal';
import { DocumentUploadModal } from '../../components/knowledge/DocumentUploadModal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { KNOWLEDGE_CATEGORIES } from '../../utils/constants';
import {
  BookOpen,
  Plus,
  UploadCloud,
  Search,
  Sparkles,
  Layers,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';

export const AdminKnowledgeBase = () => {
  const { success, error: toastError } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Search Test Sandbox
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testingSearch, setTestingSearch] = useState(false);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await knowledgeService.getKnowledge({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined,
      });
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [categoryFilter]);

  const handleSaveArticle = async (data) => {
    setModalLoading(true);
    try {
      await knowledgeService.createKnowledge(data);
      success('Article added and queued for semantic indexing!');
      setIsAddOpen(false);
      fetchKnowledge();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create article');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUploadDocument = async (formData) => {
    setModalLoading(true);
    try {
      await knowledgeService.uploadDocument(formData);
      success('Document uploaded and RAG chunking initiated!');
      setIsUploadOpen(false);
      fetchKnowledge();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge document?')) return;
    try {
      await knowledgeService.deleteKnowledge(id);
      success('Document and vector embeddings deleted.');
      fetchKnowledge();
    } catch (err) {
      toastError('Failed to delete document');
    }
  };

  const handleRunSearchTest = async (e) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    setTestingSearch(true);
    try {
      const res = await knowledgeService.testSearch(testQuery.trim());
      setTestResults(res.results || []);
    } catch (err) {
      toastError('Failed to run vector test search');
    } finally {
      setTestingSearch(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Organization Knowledge Base (RAG)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Ground the AI support assistant in verified SkillUp Academy policies, course details, and FAQs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="md" icon={UploadCloud} onClick={() => setIsUploadOpen(true)}>
            Upload Document (PDF/DOCX)
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add Article / FAQ
          </Button>
        </div>
      </div>

      {/* Vector RAG Search Tester Sandbox */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-brand-400" />
          <h3 className="font-bold text-white text-sm">RAG Semantic Retrieval Sandbox</h3>
        </div>

        <form onSubmit={handleRunSearchTest} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type a test customer query to check vector similarity (e.g. Can I get a refund after 5 days?)"
            className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Button type="submit" variant="primary" size="md" loading={testingSearch} icon={Search}>
            Test Retrieval
          </Button>
        </form>

        {testResults && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Retrieved {testResults.length} Relevant Knowledge Chunks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testResults.map((res, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-brand-500/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-brand-300 font-bold">
                    <span>{res.metadata?.title || 'Knowledge Chunk'}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-500/30 text-[10px]">
                      Match Score: {(res.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed line-clamp-3">
                    {res.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchKnowledge()}
            placeholder="Search knowledge by title or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Categories</option>
          {KNOWLEDGE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Document List */}
      <KnowledgeList documents={documents} onDelete={handleDelete} loading={loading} />

      {/* Modals */}
      <AddKnowledgeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveArticle}
        loading={modalLoading}
      />

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadDocument}
        loading={modalLoading}
      />
    </div>
  );
};
