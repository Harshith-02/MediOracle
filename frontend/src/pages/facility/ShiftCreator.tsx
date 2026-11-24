import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const ShiftCreator: React.FC = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    facility_id: '',
    ward_id: '',
    role_required: 'Nurse',
    specialty_required: 'ICU',
    start_time: '2026-09-05T07:00',
    end_time: '2026-09-05T19:00',
    break_duration_minutes: 30,
    hourly_rate: 45.0,
    incentive_bonus: 5.0,
    acuity_level: 'HIGH',
    required_skills: ['Ventilator Management', "ECG Analysis"],
    required_credentials: ['NMBI_PIN', 'BLS', 'ACLS'],
    notes: 'Urgent ICU shift coverage required for post-cardiac surgery recovery.'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/facilities/');
        setFacilities(res.data);
        if (res.data.length > 0) {
          const facId = res.data[0].id;
          setForm((prev) => ({ ...prev, facility_id: facId }));
          const wRes = await api.get(`/facilities/${facId}/wards`);
          setWards(wRes.data);
          if (wRes.data.length > 0) {
            setForm((prev) => ({ ...prev, ward_id: wRes.data[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/shifts/', {
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString()
      });
      navigate(`/facility/shifts/${res.data.id}`);
    } catch (err) {
      alert('Failed to post shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-cyan-400" /> Post New Healthcare Shift
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Create workforce demand. The AI Matching Engine will instantly rank candidates upon posting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Ward / Unit</label>
            <select
              value={form.ward_id}
              onChange={(e) => setForm({ ...form, ward_id: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.department_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Required Professional Role</label>
            <select
              value={form.role_required}
              onChange={(e) => setForm({ ...form, role_required: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            >
              <option value="Nurse">Registered General Nurse (RGN)</option>
              <option value="HCA">Healthcare Assistant (HCA)</option>
              <option value="Social Care Worker">Social Care Worker</option>
              <option value="Midwife">Registered Midwife (RM)</option>
              <option value="Pharmacist">Pharmacist</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Required Specialty</label>
            <select
              value={form.specialty_required}
              onChange={(e) => setForm({ ...form, specialty_required: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            >
              <option value="ICU">Intensive Care Unit (ICU)</option>
              <option value="Emergency">Emergency Medicine (ED)</option>
              <option value="General Ward">General Ward</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Mental Health">Mental Health</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Acuity Level</label>
            <select
              value={form.acuity_level}
              onChange={(e) => setForm({ ...form, acuity_level: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            >
              <option value="HIGH">HIGH (1:1 Patient Ratio)</option>
              <option value="MEDIUM">MEDIUM (1:4 Ratio)</option>
              <option value="STANDARD">STANDARD (1:6 Ratio)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Shift Start Date & Time</label>
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Shift End Date & Time</label>
            <input
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Base Hourly Rate (€/hr)</label>
            <input
              type="number"
              step="0.5"
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: parseFloat(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Incentive Bonus (€)</label>
            <input
              type="number"
              step="1"
              value={form.incentive_bonus}
              onChange={(e) => setForm({ ...form, incentive_bonus: parseFloat(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Notes & Shift Context</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:border-cyan-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/facility/dashboard')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-6 py-2 rounded-lg shadow-lg shadow-cyan-500/20 flex items-center"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> {loading ? 'Posting...' : 'Post Shift & Rank Candidates'}
          </button>
        </div>
      </form>
    </div>
  );
};
