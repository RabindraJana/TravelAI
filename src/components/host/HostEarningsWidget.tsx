import React, { useState } from 'react';
import { HostEarningsSummary } from '../../types';
import { getHostEarningsData, requestHostPayout } from '../../utils/hostStorage';

interface HostEarningsWidgetProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const HostEarningsWidget: React.FC<HostEarningsWidgetProps> = ({ onShowToast }) => {
  const [earningsData, setEarningsData] = useState<HostEarningsSummary>(() => getHostEarningsData());
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const pendingAmount = earningsData.pendingPayout;

  const handleOpenWithdrawModal = () => {
    setWithdrawAmountInput(pendingAmount.toString());
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = () => {
    const amount = Number(withdrawAmountInput);
    if (!amount || amount <= 0 || amount > pendingAmount) {
      onShowToast('Invalid Amount', `Please enter a valid amount up to ₹${pendingAmount.toLocaleString('en-IN')}`, 'warning');
      return;
    }

    setIsProcessingWithdrawal(true);
    setTimeout(() => {
      const res = requestHostPayout(amount);
      setIsProcessingWithdrawal(false);
      setShowWithdrawModal(false);

      if (res.success) {
        setEarningsData(getHostEarningsData());
        onShowToast('Payout Initiated! 💳', res.message, 'success');
      } else {
        onShowToast('Payout Failed', res.message, 'warning');
      }
    }, 600);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Transaction ID', 'Date', 'Guest / Description', 'Service', 'Amount (INR)', 'Status', 'Payout Method'],
      ...earningsData.recentTransactions.map((tx) => [
        tx.id,
        tx.date,
        `"${tx.guestName}"`,
        `"${tx.service}"`,
        tx.amount.toString(),
        tx.status,
        `"${tx.payoutMethod}"`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `host_earnings_statement_rabindra_jana_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Statement Downloaded 📄', 'Host earnings statement saved as CSV file.', 'success');
  };

  // Find max monthly revenue for bar scaling
  const maxMonthAmount = Math.max(...earningsData.monthlyData.map((m) => m.amount), 1);

  return (
    <div className="bg-white rounded-2xl border border-[#eaedff] shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </span>
            <h2 className="text-lg font-bold text-[#131b2e]">Host Earnings &amp; Financial Overview</h2>
          </div>
          <p className="text-xs text-[#717b79] mt-1">
            Track revenue from Medinipur guest stays, Bengal traditional dinners, and railway guiding.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3d4947] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-[#eaedff]"
            title="Download CSV statement"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Statement</span>
          </button>
          <button
            onClick={handleOpenWithdrawModal}
            disabled={pendingAmount <= 0}
            className="px-3.5 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            <span>Withdraw Escrow</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Gross Revenue */}
        <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-1">
          <div className="flex items-center justify-between text-[#717b79]">
            <span className="text-xs font-semibold">Total Revenue</span>
            <span className="material-symbols-outlined text-[18px] text-[#00685f]">currency_rupee</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#131b2e]">
            ₹{earningsData.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#006947] font-semibold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">trending_up</span>
            <span>14 completed journeys</span>
          </span>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-1">
          <div className="flex items-center justify-between text-[#717b79]">
            <span className="text-xs font-semibold">October 2026</span>
            <span className="material-symbols-outlined text-[18px] text-[#fd761a]">calendar_today</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#131b2e]">
            ₹{earningsData.thisMonthRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#006947] font-semibold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
            <span>+22% vs September</span>
          </span>
        </div>

        {/* Pending Escrow */}
        <div className="p-4 rounded-xl bg-[#fffaf5] border border-[#fd761a]/30 space-y-1">
          <div className="flex items-center justify-between text-[#9d4300]">
            <span className="text-xs font-bold">Pending Escrow</span>
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#9d4300]">
            ₹{pendingAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#717b79] block">
            Upcoming stay funds
          </span>
        </div>

        {/* Average Booking */}
        <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-1">
          <div className="flex items-center justify-between text-[#717b79]">
            <span className="text-xs font-semibold">Avg. Booking Value</span>
            <span className="material-symbols-outlined text-[18px] text-[#0284c7]">analytics</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#131b2e]">
            ₹{earningsData.averageBookingValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#717b79] block">
            ~2.2 nights average
          </span>
        </div>
      </div>

      {/* Visual Revenue Breakdown & Monthly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Monthly Performance Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">bar_chart</span>
              <span>Past 6 Months Performance</span>
            </h3>
            <span className="text-[11px] text-[#717b79]">May — Oct 2026</span>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-4">
            {/* Bars container */}
            <div className="h-40 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
              {earningsData.monthlyData.map((m) => {
                const heightPercent = Math.round((m.amount / maxMonthAmount) * 100);
                const isCurrent = m.month.includes('Oct');
                const isHovered = hoveredMonth === m.month;

                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredMonth(m.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip */}
                    <div
                      className={`absolute -top-7 px-2 py-0.5 rounded-md bg-[#131b2e] text-white text-[10px] font-bold shadow-md whitespace-nowrap transition-opacity pointer-events-none z-10 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      ₹{m.amount.toLocaleString('en-IN')} ({m.bookings} stays)
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[38px] bg-[#eaedff] rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isCurrent
                            ? 'bg-[#00685f] group-hover:bg-[#00534c]'
                            : 'bg-[#00685f]/40 group-hover:bg-[#00685f]/60'
                        }`}
                      />
                    </div>

                    {/* Month Label */}
                    <span
                      className={`text-[10px] font-medium transition-colors ${
                        isCurrent ? 'text-[#00685f] font-bold' : 'text-[#717b79]'
                      }`}
                    >
                      {m.month.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#717b79] pt-2 border-t border-[#eaedff]">
              <span>Highest Month: ₹14,800 (Oct)</span>
              <span className="flex items-center gap-1 text-[#00685f] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00685f]" /> Current Month
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Streams Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#fd761a]">pie_chart</span>
              <span>Revenue Streams</span>
            </h3>
            <span className="text-[11px] text-[#717b79]">All-time</span>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-3">
            {earningsData.breakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#131b2e]">
                    <span className="material-symbols-outlined text-[15px]" style={{ color: item.color }}>
                      {item.icon}
                    </span>
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#131b2e]">₹{item.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-[#717b79] w-7 text-right">{item.percentage}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout Credentials & Recent Ledger */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">receipt_long</span>
            <span>Recent Transactions &amp; Escrow Releases</span>
          </h3>

          {/* Host Account Badge */}
          <div className="flex items-center gap-2 text-[11px] text-[#717b79]">
            <span className="font-semibold text-[#131b2e]">Registered Payout:</span>
            <span className="font-mono px-2 py-0.5 rounded bg-[#f2f3ff] text-[#00685f] border border-[#eaedff]">
              askrabindrajana@okaxis
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#eaedff]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8ff] text-[#717b79] uppercase text-[10px] tracking-wider border-b border-[#eaedff]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Traveler / Description</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff] bg-white">
              {earningsData.recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#faf8ff] transition-colors">
                  <td className="py-2.5 px-3 text-[#717b79] whitespace-nowrap">{tx.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#131b2e]">{tx.guestName}</td>
                  <td className="py-2.5 px-3 text-[#717b79]">{tx.service}</td>
                  <td className="py-2.5 px-3 font-bold text-[#131b2e] whitespace-nowrap">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.status === 'payout_completed'
                          ? 'bg-[#e2fced] text-[#006947]'
                          : tx.status === 'escrow'
                          ? 'bg-[#fffaf5] text-[#fd761a] border border-[#fd761a]/30'
                          : 'bg-[#f2f3ff] text-[#00685f]'
                      }`}
                    >
                      {tx.status === 'payout_completed' ? 'Paid Out' : tx.status === 'escrow' ? 'In Escrow' : 'Processing'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[11px] text-[#717b79] font-mono">
                    {tx.payoutMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </span>
                <h3 className="font-bold text-base text-[#131b2e]">Withdraw Escrow to Bank / UPI</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg hover:bg-[#f2f3ff] text-[#717b79] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#717b79]">Available Escrow Balance:</span>
                <span className="font-bold text-[#00685f] text-sm">₹{pendingAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#717b79]">Payout Destination:</span>
                <span className="font-mono font-semibold text-[#131b2e]">askrabindrajana@okaxis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#717b79]">Linked Bank:</span>
                <span className="text-[#131b2e]">SBI Kharagpur (A/C: ****4829)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#131b2e] block">Amount to Withdraw (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-[#717b79] font-bold">₹</span>
                <input
                  type="number"
                  max={pendingAmount}
                  min={100}
                  value={withdrawAmountInput}
                  onChange={(e) => setWithdrawAmountInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-sm font-bold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#717b79]">
                <span>Min ₹100 • Instant NEFT/UPI Settlement</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmountInput(pendingAmount.toString())}
                  className="text-[#00685f] font-bold hover:underline cursor-pointer"
                >
                  Withdraw All (₹{pendingAmount.toLocaleString('en-IN')})
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-xs font-semibold text-[#3d4947] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdraw}
                disabled={isProcessingWithdrawal || Number(withdrawAmountInput) <= 0}
                className="px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isProcessingWithdrawal ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>Processing Transfer...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Confirm Instant Payout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
