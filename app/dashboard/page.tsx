'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ActionItem = {
  task: string;
  owner: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  quote: string;
  notes?: string;
};

type Meta = {
  model?: string;
  latencyMs?: number;
  itemCount?: number;
  rateLimitRemaining?: number;
};

const FREE_LIMIT = 5;
const STORAGE_KEY = 'actionforge_usage';

function getUsage(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    // Reset daily for demo purposes
    const today = new Date().toDateString();
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch {
    return 0;
  }
}

function incrementUsage() {
  if (typeof window === 'undefined') return;
  const today = new Date().toDateString();
  const current = getUsage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: current + 1 }));
}

export default function DashboardPage() {
  const [transcript, setTranscript] = useState('');
  const [meetingType, setMeetingType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ActionItem[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    setUsage(getUsage());
  }, []);

  const remaining = Math.max(0, FREE_LIMIT - usage);

  async function handleGenerate() {
    if (!transcript.trim()) {
      setError('Please paste a transcript or notes first.');
      return;
    }
    if (remaining <= 0) {
      setError('Free tier limit reached (5 meetings). Upgrade to Pro for unlimited generations.');
      return;
    }

    setLoading(true);
    setError(null);
    setItems(null);
    setMeta(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, meetingType }),
      });

      const data = await res.json();

      if (!res.ok) {
        const code = data.code ? ` [${data.code}]` : '';
        throw new Error((data.error || 'Generation failed') + code);
      }

      setItems(data.actionItems || []);
      setMeta(data.meta || null);
      incrementUsage();
      setUsage(getUsage());
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Check your API key setup.');
    } finally {
      setLoading(false);
    }
  }

  function copyAsMarkdown() {
    if (!items) return;
    const md = items
      .map(
        (i, idx) =>
          `${idx + 1}. **${i.task}**\n   - Owner: ${i.owner}\n   - Deadline: ${i.deadline}\n   - Priority: ${i.priority}\n   - Quote: "${i.quote}"${i.notes ? `\n   - Notes: ${i.notes}` : ''}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(md);
    alert('Copied as Markdown!');
  }

  function copyAsCSV() {
    if (!items) return;
    const header = 'Task,Owner,Deadline,Priority,Quote,Notes\n';
    const rows = items
      .map((i) =>
        `"${i.task.replace(/"/g, '""')}","${i.owner}","${i.deadline}","${i.priority}","${i.quote.replace(/"/g, '""')}","${(i.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    alert('Copied as CSV!');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">AF</div>
            <span className="font-semibold">ActionForge</span>
          </Link>
          <div className="text-sm text-slate-500">
            Free tier · <span className={remaining <= 1 ? 'text-amber-600 font-medium' : ''}>{remaining} meetings remaining</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Generate Action Items</h1>
        <p className="mt-1 text-slate-600">Paste any meeting transcript or notes. Get structured, assignable tasks in seconds.</p>

        <div className="mt-8 grid gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Meeting type (improves accuracy)</label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="general">General / Other</option>
              <option value="client">Client / Stakeholder Call</option>
              <option value="standup">Standup / Sync</option>
              <option value="sales">Sales / Discovery</option>
              <option value="planning">Planning / Strategy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Transcript or notes</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the full transcript or your rough notes here...\n\nExample:\nAlex: I'll send the proposal by Friday.\nJordan: Can you also update the pricing sheet?\nSam: I'll review the legal terms by Wednesday."
              rows={12}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleGenerate}
              disabled={loading || remaining <= 0}
              className="inline-flex items-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition"
            >
              {loading ? 'Extracting action items...' : 'Generate Action Items'}
            </button>
            {items && (
              <>
                <button
                  onClick={copyAsMarkdown}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Copy Markdown
                </button>
                <button
                  onClick={copyAsCSV}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Copy CSV
                </button>
              </>
            )}
            {meta && (
              <span className="text-xs text-slate-400">
                {meta.model} · {meta.latencyMs}ms · {meta.itemCount} items
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {items && items.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Extracted Action Items ({items.length})</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Task</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Owner</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Deadline</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Priority</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Source Quote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.task}</td>
                        <td className="px-4 py-3 text-slate-700">{item.owner}</td>
                        <td className="px-4 py-3 text-slate-700">{item.deadline}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              item.priority === 'High'
                                ? 'bg-red-100 text-red-700'
                                : item.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={item.quote}>
                          "{item.quote}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {items && items.length === 0 && (
            <div className="rounded-lg bg-slate-100 px-4 py-6 text-center text-slate-600">
              No clear action items detected. Try a longer transcript or different meeting type.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
