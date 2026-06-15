import React, { useState } from "react";
import { 
  CheckCircle2, XCircle, AlertTriangle, Info, BarChart3, LineChart, 
  DollarSign, Activity, Trash2, Layers, ShieldCheck, HelpCircle, Package2, ArrowRight
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine 
} from "recharts";
import { CalculationResults, ProposedLineItem } from "../types";

interface AnalysisResultsProps {
  results: CalculationResults;
  lineItems: ProposedLineItem[];
  onRemoveLineItem: (id: string) => void;
}

export function AnalysisResults({ results, lineItems, onRemoveLineItem }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<"trajectory" | "ledger">("trajectory");

  // Format currency helper
  const fmt = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const fmtDecimal = (val: number, decimals: number = 2) => {
    return val.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  // Percentage of recoup target achieved
  const recoupPercent = results.totalLotPurchasePrice > 0 
    ? (results.totalProjected21DayProfit / results.targetRecoupProfit) * 100 
    : 0;

  // Maximum purchase price allowed to meet the 70% cash flow rule with current profits
  const maxPurchasePrice = results.totalProjected21DayProfit / 0.70;
  const costReductionNeeded = results.totalLotPurchasePrice - maxPurchasePrice;

  // Expected vs actual unit discrepancy check
  const unitsDiscrepancy = results.totalExpectedUnits !== results.totalActualUnits;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Main Verdict Indicator Banner */}
      <div className={`rounded-xl border p-5 md:p-6 shadow-md overflow-hidden relative ${
        results.isApproved
          ? "bg-[#111823] border-emerald-500/30 text-white border-l-4 border-emerald-500"
          : "bg-[#111823] border-rose-500/30 text-slate-100 border-l-4 border-rose-500"
      }`}>
        {results.isApproved && (
          <div className="absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        )}

        <div className="flex flex-col md:flex-row items-start gap-4 justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 mt-0.5 ${
              results.isApproved 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {results.isApproved ? (
                <CheckCircle2 size={32} className="animate-pulse" />
              ) : (
                <XCircle size={32} />
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded tracking-wide uppercase ${
                  results.isApproved 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  FORECAST RECOMMENDATION VERDICT
                </span>
                
                {unitsDiscrepancy && results.totalActualUnits > 0 && (
                  <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Info size={10} /> Discrepancy
                  </span>
                )}
              </div>
              
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-1">
                {results.isApproved ? "GO: RECOMMEND PURCHASE" : "NO-GO: DO NOT PURCHASE"}
              </h2>
              
              <p className={`text-xs leading-relaxed max-w-2xl font-medium mt-1 ${
                results.isApproved ? "text-slate-300" : "text-slate-400"
              }`}>
                {results.isApproved 
                  ? `The lot is highly viable. Aggregated projected 21-day sales profit is ${fmt(results.totalProjected21DayProfit)}, covering ${fmtDecimal(recoupPercent, 1)}% of the target capital recoup threshold (${fmt(results.targetRecoupProfit)}). Cost recoup target satisfied.`
                  : `This deal presents excessive risk. Anticipated 21-day profits total ${fmt(results.totalProjected21DayProfit)}, reaching just ${fmtDecimal(recoupPercent, 1)}% of the 70% threshold. You face a recoup shortfall of ${fmt(results.shortfall)}.`
                }
              </p>
            </div>
          </div>
          
          {/* Quick metrics column */}
          <div className="shrink-0 flex md:flex-col items-start md:items-end gap-1 font-mono uppercase text-left md:text-right mt-3 md:mt-0">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider">RECOUP RATE</span>
            <div className={`text-2xl font-black tracking-tight ${
              results.isApproved ? "text-emerald-400" : "text-rose-400"
            }`}>
              {fmtDecimal(recoupPercent, 0)}%
            </div>
            <span className="text-[9px] text-slate-500">Target: 70% Lot Cost</span>
          </div>
        </div>

        {/* Global expected vs actual unit checklist warning bar */}
        {unitsDiscrepancy && lineItems.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 bg-amber-500/5 rounded-lg p-3 flex items-start gap-2.5 text-xs">
            <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-slate-300 font-medium">
              <span className="font-bold text-amber-300 uppercase tracking-wide text-[10px]">
                Bulk Audit Discrepancy detected
              </span>
              <p className="leading-relaxed text-[11px] text-slate-400">
                The global sheet specifications expect <strong className="text-white font-bold">{results.totalExpectedUnits} units</strong>, but your line-item entries only account for <strong className="text-white font-bold">{results.totalActualUnits} units</strong> ({results.totalExpectedUnits - results.totalActualUnits} units remaining to be assigned). Ensure entire Lot content is added.
              </p>
            </div>
          </div>
        )}

        {/* Actionable renegotiating Advice for shortfalls */}
        {!results.isApproved && costReductionNeeded > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 bg-[#161d28]/60 rounded-lg p-3.5 flex items-start gap-2 text-xs">
            <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-slate-300 font-medium">
              <span className="font-bold text-rose-400 uppercase tracking-wide text-[10px]">
                Procurement Bid Action Strategy
              </span>
              <p className="leading-relaxed text-[11px]">
                To satisfy the 70% cash flow benchmark rules, renegotiate the purchase. Reduce total lot price to at least <strong className="text-rose-300 font-bold">{fmt(maxPurchasePrice)}</strong> (a cost reduction of <strong className="text-white font-bold">{fmt(costReductionNeeded)}</strong>), or prompt the supplier for free bonus inventory units.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. STICKY SUMMARY CARD / METRICS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Lot cost (Capital At Risk) */}
        <div className="bg-[#12171f] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase font-sans tracking-wide">
              Lot Purchase Price
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <DollarSign size={14} />
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-extrabold font-mono tracking-tight text-white">
              {fmt(results.totalLotPurchasePrice)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
              Total capital invested into acquiring the entire lot list
            </p>
          </div>
        </div>

        {/* Metric 2: Target Recoup (70% Cash Flow Target) */}
        <div className="bg-[#12171f] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase font-sans tracking-wide">
              Target Recoup Amount (70%)
            </span>
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <ShieldCheck size={14} />
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-extrabold font-mono tracking-tight text-[#f1f5f9]">
              {fmt(results.targetRecoupProfit)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
              Required cash threshold to cover safe capital amortization rules
            </p>
          </div>
        </div>

        {/* Metric 3: Summed Projected Profits */}
        <div className="bg-[#12171f] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase font-sans tracking-wide">
              Total Projected 21D Profit
            </span>
            <span className={`p-1.5 rounded-lg ${results.isApproved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "bg-rose-500/10 text-rose-400 border border-rose-500/10"}`}>
              <Activity size={14} />
            </span>
          </div>
          <div className="my-2.5">
            <div className={`text-2xl font-extrabold font-mono tracking-tight ${results.isApproved ? "text-emerald-400" : "text-rose-400"}`}>
              {fmt(results.totalProjected21DayProfit)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
              Sum of capped 21-day sales profits across all device types
            </p>
          </div>
        </div>
      </section>

      {/* 3. TAB CONTROLLER & ANALYTICAL WORKSPACE */}
      <div className="bg-[#12171f] border border-slate-800 rounded-xl p-4 md:p-5 shadow-xs">
        {/* Dynamic header with tab switches */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 size={15} className="text-indigo-400" />
              Dynamic Simulation Workbench
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Analyze capital trajectory timelines and itemized spreadsheet allocations
            </p>
          </div>

          <div className="flex bg-[#1a212c] p-1 rounded-lg border border-slate-800 shrink-0 select-none">
            <button
              onClick={() => setActiveTab("trajectory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "trajectory"
                  ? "bg-[#12171f] text-indigo-400 border border-slate-700/50 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LineChart size={13} />
              Profit Trajectory
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "ledger"
                  ? "bg-[#12171f] text-indigo-400 border border-slate-700/50 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers size={13} />
              Line-Item Ledger ({lineItems.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Trajectory Chart */}
        {activeTab === "trajectory" && (
          <div className="w-full">
            <div className="text-[10px] text-slate-500 font-mono flex flex-wrap items-center gap-y-1 gap-x-4 justify-center mb-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-5 bg-indigo-500 rounded-sm"></span>
                Cumulative Projected Lot Returns ($)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0 w-5 border-t-2 border-dashed border-rose-500"></span>
                70% Cash recoup baseline ({fmt(results.targetRecoupProfit)})
              </span>
            </div>
            
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={results.cumulativeProfitData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="multiProfitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={results.isApproved ? "#10b981" : "#6366f1"} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={results.isApproved ? "#10b981" : "#6366f1"} stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    stroke="#334155"
                    label={{ value: 'Simulation Day Timeline', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    stroke="#334155"
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const covered = results.targetRecoupProfit > 0 
                          ? (data.cumulativeProfit / results.targetRecoupProfit) * 100 
                          : 0;
                        return (
                          <div className="bg-[#1a212c]/95 backdrop-blur-md border border-slate-800 text-white rounded-lg p-3 text-xs font-mono shadow-xl flex flex-col gap-1 select-none">
                            <span className="text-[10px] text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">
                              Day {data.day} Projection
                            </span>
                            <div className="flex justify-between gap-6">
                              <span className="text-slate-300">Lot Profit:</span>
                              <span className="font-bold text-emerald-400">${data.cumulativeProfit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-6">
                              <span className="text-slate-300">Recoup Goal:</span>
                              <span className="text-rose-450">${data.targetLine.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-6 text-[10px] border-t border-slate-800 pt-1 mt-1">
                              <span className="text-slate-400">Total Goal Covered:</span>
                              <span className={covered >= 100 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                                {covered.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  <ReferenceLine 
                    y={results.targetRecoupProfit} 
                    stroke="#f43f5e" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeProfit" 
                    stroke={results.isApproved ? "#10b981" : "#6366f1"} 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#multiProfitGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Line-Item Ledger Data Table */}
        {activeTab === "ledger" && (
          <div className="flex flex-col gap-3">
            {lineItems.length === 0 ? (
              <div className="text-center py-10 bg-[#161d28]/35 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400">
                <Package2 size={36} className="text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-300">No items added to the proposed lot yet.</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                  Add custom line item specs from the configuration form on the left to test cumulative velocity returns.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-800/80">
                <table className="w-full border-collapse text-left text-xs text-slate-300 select-none">
                  <thead className="bg-[#1a212c] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">Device & Condition</th>
                      <th className="py-3 px-4 font-bold text-center">Quant / Cost</th>
                      <th className="py-3 px-4 font-bold text-center">Velocity (DSR)</th>
                      <th className="py-3 px-4 font-bold text-right">Selling Price</th>
                      <th className="py-3 px-4 font-bold text-center">21D Projected Sales</th>
                      <th className="py-3 px-4 font-bold text-right">Proj. 21D Profit</th>
                      <th className="py-3 px-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#12171f]/50">
                    {lineItems.map((item) => {
                      const calc = results.lineCalculations[item.id];
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/25 transition-colors">
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white leading-tight">{item.modelName}</span>
                              <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1.5 font-mono">
                                <span>{item.ram} / {item.storage}</span>
                                <span className="text-slate-500">•</span>
                                <span className="bg-indigo-950/40 text-indigo-300 border border-indigo-900/60 px-1 py-0.2 rounded text-[8px] uppercase tracking-wide">
                                  {item.condition}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium">
                            <span className="text-neutral-200">{item.quantity}u</span>
                            <span className="text-slate-500 block text-[10px]">@{fmt(item.allocatedUnitPurchasePrice)}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono">
                            <span className="font-bold text-[#e2e8f0]">{fmtDecimal(calc?.dailySalesRate || 0, 2)}</span>
                            <span className="text-slate-500 block text-[9px] uppercase tracking-wide">per day</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                            <span className="font-bold text-emerald-400">{fmt(item.historicalPrice)}</span>
                            <span className="text-slate-500 block text-[9px]">Market Avg</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-indigo-300">
                            <span>{calc?.projected21DaySales} units</span>
                            <span className="text-slate-500 block text-[9px]">
                              {calc?.projected21DaySales && calc.projected21DaySales >= item.quantity ? "CAPPED" : "VELOCITY"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold font-mono">
                            <span className={calc && calc.projected21DayProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              {fmt(calc?.projected21DayProfit || 0)}
                            </span>
                            <span className="text-slate-500 block text-[10px] font-normal font-sans">
                              {calc ? `${fmtDecimal((calc.projected21DayProfit / (results.totalProjected21DayProfit || 1)) * 100, 0)}% share` : ""}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => onRemoveLineItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 bg-slate-800/20 hover:bg-rose-500/10 p-1.5 rounded-md transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
