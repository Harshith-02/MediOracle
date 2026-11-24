import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MatchCandidate, Shift } from '../../types';
import { Sparkles, CheckCircle2, AlertTriangle, Send, Sliders, ShieldCheck, MapPin, DollarSign } from 'lucide-react';

export const ShiftDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shift, setShift] = useState<Shift | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    const fetchShiftAndMatching = async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          api.get(`/shifts/${id}`),
          api.get(`/matching/shifts/${id}/candidates`)
        ]);
        setShift(sRes.data);
        setCandidates(mRes.data);
        if (mRes.data.length > 0) {
          setSelectedCandidate(mRes.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShiftAndMatching();
  }, [id]);

  const handleSendOffer = async (candidate: MatchCandidate) => {
    try {
      await api.post(`/shifts/${id}/offer`, {
        shift_id: id,
        professional_id: candidate.professional_id,
        expires_in_hours: 24
      });
      setActionSuccess(`Offer successfully dispatched to ${candidate.professional_name}! Notification sent.`);
      const updatedShift = await api.get(`/shifts/${id}`);
      setShift(updatedShift.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send offer');
    }
  };

  const handleOverrideScore = async () => {
    if (!selectedCandidate || !overrideReason.trim()) return;
    try {
      await api.post('/matching/override', {
        shift_id: id,
        professional_id: selectedCandidate.professional_id,
        override_reason: overrideReason
      });
      setActionSuccess(`AI recommendation overridden for ${selectedCandidate.professional_name}. Audit log created.`);
      setShowOverrideModal(false);
      const mRes = await api.get(`/matching/shifts/${id}/candidates`);
      setCandidates(mRes.data);
    } catch (err) {
      alert('Failed to override score');
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-400">Loading AI Explainable Match Results...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Shift Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-bold text-slate-100">{shift?.role_required} ({shift?.specialty_required})</h1>
            <StatusBadge status={shift?.status || 'POSTED'} type="shift" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400" /> {shift?.ward_name} ({shift?.facility_name})</span>
            <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Rate: €{shift?.hourly_rate}/h</span>
            <span>Acuity: {shift?.acuity_level}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/facility/dashboard')}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* AI Explainable Matching Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List (Ranked Table) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-cyan-400" /> AI Ranked Candidate Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  XGBoost ML Model
                </span>
              </div>
              <p className="text-xs text-slate-400">Gradient Boosted Trees evaluating clinical affinity, commute distance, compliance & reliability</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
              {candidates.length} Candidates Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {candidates.map((c) => (
              <div
                key={c.professional_id}
                onClick={() => setSelectedCandidate(c)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedCandidate?.professional_id === c.professional_id
                    ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-sm">
                      {c.professional_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100 flex items-center">
                        {c.professional_name}
                        {c.is_overridden && (
                          <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                            AI OVERRIDDEN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{c.role_title} • {c.specialty}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-extrabold text-cyan-400 font-mono">{c.overall_score}%</div>
                    <div className="text-[10px] text-slate-400">Confidence: {c.confidence_score}%</div>
                  </div>
                </div>

                {/* Commute & Eligibility badges */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> Commute: {c.distance_km} km
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(c);
                        setShowOverrideModal(true);
                      }}
                      className="text-[11px] text-slate-400 hover:text-purple-300 hover:underline flex items-center"
                    >
                      <Sliders className="w-3 h-3 mr-1" /> Override
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendOffer(c);
                      }}
                      disabled={shift?.status === 'OFFERED' || shift?.status === 'CONFIRMED'}
                      className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center"
                    >
                      <Send className="w-3 h-3 mr-1" /> Send Offer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Score Explainability Inspector */}
        {selectedCandidate && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Explainability Inspector</div>
              <h3 className="text-lg font-bold text-slate-100">{selectedCandidate.professional_name}</h3>
              <p className="text-xs text-slate-400">Score Breakdown & Clinical Eligibility Reasons</p>
            </div>

            {/* Factor Scores */}
            <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-slate-300 mb-2">Algorithm Factor Breakdown</div>
              {Object.entries(selectedCandidate.factor_breakdown).map(([factor, score]) => (
                <div key={factor} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 capitalize">
                    <span>{factor.replace('_', ' ')}</span>
                    <span className="font-mono text-slate-200">{score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Positive Reasons (✓) */}
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Decisive Positive Factors
              </div>
              <ul className="space-y-1.5">
                {selectedCandidate.reasons.map((r, idx) => (
                  <li key={idx} className="text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings (⚠) */}
            {selectedCandidate.warnings.length > 0 && (
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Safeguard Warnings
                </div>
                <ul className="space-y-1.5">
                  {selectedCandidate.warnings.map((w, idx) => (
                    <li key={idx} className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => handleSendOffer(selectedCandidate)}
              disabled={shift?.status === 'OFFERED' || shift?.status === 'CONFIRMED'}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center transition"
            >
              <Send className="w-4 h-4 mr-2" /> Send 1-Click Offer to {selectedCandidate.professional_name.split(' ')[0]}
            </button>
          </div>
        )}
      </div>

      {/* AI Score Override Modal */}
      {showOverrideModal && selectedCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center">
              <Sliders className="w-5 h-5 mr-2 text-purple-400" /> Override AI Recommendation
            </h3>
            <p className="text-xs text-slate-400">
              Facility & Admin users can override AI candidate rankings. A mandatory justification reason is stored in the immutable Audit Event history.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Override Reason</label>
              <textarea
                rows={3}
                required
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Ward leader requested Sarah Connor based on exceptional previous ICU patient experience."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:border-purple-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideScore}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-purple-500/20"
              >
                Confirm AI Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
