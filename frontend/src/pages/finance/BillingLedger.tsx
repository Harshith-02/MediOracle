import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Invoice } from '../../types';
import { Receipt, DollarSign, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export const BillingLedger: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [iRes, rRes] = await Promise.all([
        api.get('/finance/invoices'),
        api.get('/finance/reconciliation')
      ]);
      setInvoices(iRes.data);
      setReconciliation(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    try {
      const res = await api.post('/finance/invoices/generate-from-timesheets');
      setActionMsg(res.data.message);
      fetchBillingData();
    } catch (err) {
      alert('Invoice generation failed');
    }
  };

  const handleProcessPayment = async (invId: string, amount: number) => {
    setErrorMsg('');
    setActionMsg('');
    try {
      const res = await api.post('/finance/payments/process', {
        invoice_id: invId,
        amount: amount,
        payment_method: 'MOCK_SEPA_TRANSFER'
      });
      setActionMsg(`SEPA Payment ${res.data.payment_identifier} Processed! Sandbox transfer completed.`);
      fetchBillingData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Payment processing failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-cyan-400" /> Facility Invoicing & Payment Reconciliation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated invoice generation from locked timesheets with SEPA transfer safeguards.
          </p>
        </div>

        <button
          onClick={handleGenerateInvoices}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center transition"
        >
          <Sparkles className="w-4 h-4 mr-2" /> Generate Invoices from Locked Hours
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> {actionMsg}
          </span>
          <button onClick={() => setActionMsg('')} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" /> {errorMsg}
          </span>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 font-bold">✕</button>
        </div>
      )}

      {/* Reconciliation Summary Cards */}
      {reconciliation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timesheet Value</div>
            <div className="text-xl font-extrabold text-slate-100 font-mono mt-1">
              €{reconciliation.summary.total_timesheet_value.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{reconciliation.summary.total_timesheets_processed} Locked Timesheets</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Invoiced Total</div>
            <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1">
              €{reconciliation.summary.total_invoiced_value.toFixed(2)}
            </div>
            <div className="text-[10px] text-cyan-400 mt-0.5">VAT 23% Included</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payments Collected</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
              €{reconciliation.summary.total_payments_collected.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">SEPA Settled</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reconciliation Status</div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> {reconciliation.reconciliation_status}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Ledgers Match</div>
          </div>
        </div>
      )}

      {/* Invoices List Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Facility Billing Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">VAT (23%)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Process SEPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{inv.invoice_number}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {new Date(inv.issue_date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">€{inv.subtotal_amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">€{inv.tax_amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">€{inv.total_amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded font-semibold text-xs ${
                      inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleProcessPayment(inv.id, inv.total_amount)}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Process SEPA Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
