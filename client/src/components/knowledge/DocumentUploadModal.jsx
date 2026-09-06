import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { KNOWLEDGE_CATEGORIES } from '../../utils/constants';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

export const DocumentUploadModal = ({ isOpen, onClose, onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('category', category);
    formData.append('tags', tags);

    onUpload(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Knowledge Document (RAG)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop area */}
        <div className="relative border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-6 text-center transition-colors bg-slate-900/40">
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileChange}
            required
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            {file ? (
              <div>
                <p className="text-sm font-bold text-brand-300">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-white">Click or drag document to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT, MD (Max 15MB)</p>
              </div>
            )}
          </div>
        </div>

        <Input
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. SkillUp Academy Course Catalog 2025"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500"
            >
              {KNOWLEDGE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="syllabus, pricing, terms"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <span>
            Uploaded documents are parsed, chunked, and embedded into vector search. The AI support assistant will reference this document automatically.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!file} icon={UploadCloud}>
            Upload & Process RAG
          </Button>
        </div>
      </form>
    </Modal>
  );
};
