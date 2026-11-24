import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Timesheet } from '../../types';
import { Clock, CheckCircle2, Lock, FileText, Upload, Sparkles, ShieldCheck } from 'lucide-react';

export const TimesheetManager: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTs, setSelectedTs] = useState<Timesheet | null>(null);
  const [signatureSvg, setSignatureSvg] = useState('<svg>Manager Approved Signature - Dr. Mark Higgins</svg>');
  const [actionSuccess, setActionSuccess] = useState('');
  const [ocrData, setOcrData] = useState<any>(null);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await api.get('/timekeeping/timesheets');
      setTimesheets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndLock = async () => {
    if (!selectedTs) return;
    try {
      await api.post(`/timekeeping/timesheets/${selectedTs.id}/approve`, {
        manager_signature_svg: signatureSvg,
        notes: 'Hours verified against ward shift log.'
      });
      setActionSuccess(`Timesheet #${selectedTs.id.substring(0, 8)} APPROVED & LOCKED! Hours cannot be edited without explicit adjustment.`);
      setSelectedTs(null);
      fetchTimesheets();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Approval failed');
    }
  };

  const handleMockOcrUpload = async () => {
    try {
      const res = await api.post('/compliance/credentials/upload-ocr?file_name=timesheet_photo_icu.jpg');
      setOcrData(res.data);
    } catch (err) {
      alert('OCR failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-cyan-400" /> Digital Timesheets & Locking Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approved hours become locked. Financial modifications post-approval require an explicit adjustment.
          </p>
        </div>

        <button
          onClick={handleMockOcrUpload}
          className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center transition"
        >
          <Upload className="w-4 h-4 mr-2" /> Upload Physical Timesheet (OCR)
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* OCR Simulator Drawer */}
      {ocrData && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5" /> Physical Timesheet Photo OCR Extractor
            </span>
            <button onClick={() => setOcrData(null)} className="text-xs text-slate-400 hover:text-slate-200">Close</button>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
            <div>Document Title: {ocrData.extracted_fields.document_title}</div>
            <div>Holder: {ocrData.extracted_fields.holder_name}</div>
            <div>Extracted Hours Logged: {ocrData.extracted_fields.hours_logged} hrs</div>
            <div className="text-emerald-400 font-bold mt-1">OCR Confidence: {ocrData.confidence_score}%</div>
          </div>
          <p className="text-[11px] text-slate-400">{ocrData.disclaimer}</p>
        </div>
      )}

      {/* Timesheets Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Timesheet ID</th>
                <th className="py-3 px-4">Clock In / Out</th>
                <th className="py-3 px-4">Hours Worked</th>
                <th className="py-3 px-4">Hourly Rate</th>
                <th className="py-3 px-4">Gross Pay</th>
                <th className="py-3 px-4">Approval State</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">#{ts.id.substring(0, 8)}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {new Date(ts.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(ts.clock_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-200 font-bold">{ts.total_hours_worked} hrs</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">€{ts.hourly_rate}/h</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">€{ts.total_gross_pay.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={ts.approval_state} type="timesheet" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {ts.approval_state !== 'LOCKED' ? (
                      <button
                        onClick={() => setSelectedTs(ts)}
                        className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        Approve & Lock
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs font-medium flex items-center justify-end">
                        <Lock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Approval Modal */}
      {selectedTs && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-cyan-400" /> Manager Approval & Hours Locking
            </h3>
            <p className="text-xs text-slate-400">
              Approving Timesheet #{selectedTs.id.substring(0, 8)} will lock {selectedTs.total_hours_worked} hours (€{selectedTs.total_gross_pay.toFixed(2)} total pay).
            </p>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div>Manager Signature Stamp:</div>
              <div className="text-cyan-400 font-bold p-2 bg-slate-950 rounded border border-slate-800">
                Dr. Mark Higgins (Ward Manager, St. James Hospital)
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedTs(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAndLock}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-cyan-500/20"
              >
                Sign, Approve & Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
