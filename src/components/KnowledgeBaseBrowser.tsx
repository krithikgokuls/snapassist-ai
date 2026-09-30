import React, { useState, useEffect } from 'react';
import { Search, BookOpen, AlertTriangle, Terminal, ChevronRight, Check } from 'lucide-react';

export interface DocChunk {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  source: string;
  commands?: {
    cmd: string;
    description: string;
    risk: 'Low' | 'Medium' | 'High';
    explanation: string;
  }[];
}

export default function KnowledgeBaseBrowser() {
  const [docs, setDocs] = useState<DocChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/docs');
      const data = await res.json();
      if (data.docs) {
        setDocs(data.docs);
      }
    } catch (err) {
      console.error("Failed to load local knowledge base", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filteredDocs = docs.filter(doc => {
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.keywords.some(k => k.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Local IT Knowledge Base</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Standard offline troubleshooting documents used by the RAG semantic search engine.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search local documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 focus:border-zinc-400 focus:outline-none rounded-lg text-xs bg-zinc-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50 border border-zinc-100 rounded-lg">
          <span className="text-xs text-zinc-400 font-medium">No matching local documentation found.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => {
            const isExpanded = expandedId === doc.id;
            return (
              <div
                key={doc.id}
                className={`bg-white border rounded-lg transition-all ${isExpanded ? 'border-zinc-300 shadow-sm' : 'border-zinc-100 hover:border-zinc-200'}`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-zinc-900">{doc.title}</h3>
                    {/* Clean unboxed metadata with dot separators */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{doc.category}</span>
                      <span aria-hidden="true" className="text-zinc-300">·</span>
                      <span>{doc.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span className="text-[10px] bg-zinc-50 px-2 py-0.5 border border-zinc-100 text-zinc-500 rounded font-mono uppercase tracking-wider">{doc.id}</span>
                    <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-50 space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Document Segment</span>
                      <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                        {doc.content}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Indexed Keywords</span>
                      <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                        {doc.keywords.map((kw, i) => (
                          <span key={i}>
                            {kw}{i < doc.keywords.length - 1 ? ' ·' : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {doc.commands && doc.commands.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Authorized Administrative Procedures</span>
                        <div className="space-y-3">
                          {doc.commands.map((cmd, idx) => (
                            <div key={idx} className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                                  {cmd.description}
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  cmd.risk === 'High' ? 'text-rose-600 bg-rose-50 border border-rose-100' :
                                  cmd.risk === 'Medium' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                                  'text-emerald-600 bg-emerald-50 border border-emerald-100'
                                }`}>
                                  Risk: {cmd.risk}
                                </span>
                              </div>
                              <div className="p-2 bg-zinc-900 text-zinc-100 rounded font-mono text-[11px] overflow-x-auto">
                                {cmd.cmd}
                              </div>
                              <p className="text-[11px] text-zinc-500">
                                <strong>Technical Explanation:</strong> {cmd.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
