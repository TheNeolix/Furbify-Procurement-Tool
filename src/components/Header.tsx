import React from "react";
import { Database, TrendingUp } from "lucide-react";

interface HeaderProps {
  useLiveConnection: boolean;
  statusText: string;
  hasRecords: boolean;
}

export function Header({ useLiveConnection, statusText, hasRecords }: HeaderProps) {
  return (
    <header className="bg-[#12171f] border-b border-slate-800 py-4 px-6 md:px-8 mb-6 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-950/40">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Hardware Procurement & Velocity Forecast
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              Enterprise Buying Dashboard — Applying the 70% Profit Cash Flow & Target Margin Rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            SYSTEM STATUS:
          </span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            useLiveConnection
              ? "bg-[#1a212c] border-emerald-500/30 text-emerald-400"
              : "bg-[#1a212c] border-indigo-500/30 text-indigo-400"
          }`}>
            <Database size={13} className="animate-pulse" />
            <span>
              {useLiveConnection ? "LIVE: Google Sheets" : "LOCAL: Demo Dataset"}
            </span>
            {hasRecords && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline bg-[#1a212c] border border-slate-800 px-2 py-1 rounded">
            v2.4.0
          </span>
        </div>
      </div>
    </header>
  );
}
