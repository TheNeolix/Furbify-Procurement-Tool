import React, { useState } from "react";
import { Database, RefreshCw, AlertCircle, CheckCircle, HelpCircle, FileSpreadsheet, ArrowRight } from "lucide-react";
import { SAMPLE_GOOGLE_SHEET_URL } from "../data";

interface SheetSettingsProps {
  useLiveConnection: boolean;
  setUseLiveConnection: (val: boolean) => void;
  sheetUrl: string;
  setSheetUrl: (val: string) => void;
  isLoading: boolean;
  onSync: () => Promise<void>;
  errorMsg: string | null;
  successMsg: string | null;
  recordsCount: number;
  lastSyncTime: string | null;
}

export function SheetSettings({
  useLiveConnection,
  setUseLiveConnection,
  sheetUrl,
  setSheetUrl,
  isLoading,
  onSync,
  errorMsg,
  successMsg,
  recordsCount,
  lastSyncTime
}: SheetSettingsProps) {
  const [showGuide, setShowGuide] = useState(false);

  const handleLoadPreset = () => {
    setSheetUrl(SAMPLE_GOOGLE_SHEET_URL);
    setUseLiveConnection(true);
  };

  return (
    <div className="bg-[#12171f] rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase font-sans flex items-center gap-2">
          <Database size={16} className="text-slate-400" />
          Data Source Settings
        </h3>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
          title="See setup guide"
        >
          <HelpCircle size={14} />
          {showGuide ? "Hide Guide" : "Link Sheets Guide"}
        </button>
      </div>

      {/* Mode Switches */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#1a212c] rounded-lg">
        <button
          onClick={() => setUseLiveConnection(false)}
          className={`py-1.5 px-3 text-xs font-semibold tracking-wide rounded-md transition-all cursor-pointer ${
            !useLiveConnection
              ? "bg-[#12171f] text-indigo-400 border border-slate-800/50 shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Demo Dataset
        </button>
        <button
          onClick={() => setUseLiveConnection(true)}
          className={`py-1.5 px-3 text-xs font-semibold tracking-wide rounded-md transition-all cursor-pointer ${
            useLiveConnection
              ? "bg-[#12171f] text-indigo-400 border border-slate-800/50 shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Google Sheet
        </button>
      </div>

      {/* Conditional Content */}
      {!useLiveConnection ? (
        <div className="bg-[#1a212c] border border-slate-800 rounded-lg p-3.5 text-xs text-slate-300">
          <p className="leading-relaxed font-medium">
            Currently running on the <strong className="text-slate-100">Local Enterprise Demo Dataset</strong> containing pre-configured MacBook Pro and ThinkPad specifications, average sale metrics, and rolling 30-day velocity stats.
          </p>
          <button
            onClick={handleLoadPreset}
            className="mt-2.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            Switch to live spreadsheet model <ArrowRight size={12} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Published CSV URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 bg-[#1a212c] border border-slate-700 rounded-lg px-3 py-2 text-xs focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-200"
              />
              <button
                onClick={onSync}
                disabled={isLoading || !sheetUrl}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-[#1a212c] disabled:text-slate-600 text-white rounded-lg px-3.5 flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-98"
              >
                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                Sync
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleLoadPreset}
              className="text-[11px] text-slate-400 hover:text-indigo-400 font-semibold underline decoration-dotted cursor-pointer"
            >
              Insert Cloud Hardware Demo Spreadsheet Link
            </button>
          </div>

          {/* Sync Stats */}
          {lastSyncTime && (
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 bg-[#1a212c] border border-slate-800 px-2 py-1 rounded">
              <CheckCircle size={10} className="text-emerald-400" />
              <span>Last Synced: {lastSyncTime} • Imported {recordsCount} entries.</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-900/30 text-rose-300 rounded-lg p-3 text-xs flex gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-400 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Sync Failed</span>
                <span className="text-[11px] leading-relaxed font-medium">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 rounded-lg p-3 text-xs flex gap-2">
              <CheckCircle size={15} className="shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold">Success</span>
                <span className="text-[11px] leading-relaxed font-medium">{successMsg}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-out/Down Help Guide */}
      {showGuide && (
        <div id="setup-guide" className="bg-[#1a212c] border border-slate-800 rounded-lg p-4 text-xs text-slate-300 flex flex-col gap-3 select-text">
          <h4 className="font-bold text-slate-200 flex items-center gap-1 border-b border-slate-800 pb-1.5">
            <FileSpreadsheet size={13} className="text-emerald-400" />
            Active Sheet Publishing Walkthrough
          </h4>
          <ol className="list-decimal list-inside flex flex-col gap-2 font-medium">
            <li>
              Open your Google Sheet containing the hardware records. Ensure columns have headers e.g.:
              <span className="block italic mt-1 font-mono text-slate-400 bg-[#12171f] border border-slate-800 rounded px-1.5 py-1">
                Model Name | RAM | Storage | Historical Avg Selling Price | Units Sold in Last 30 Days
              </span>
            </li>
            <li>
              Go to <strong className="text-slate-100">File &gt; Share &gt; Publish to the web</strong>.
            </li>
            <li>
              Under "Link", change "Entire Document" to your target tab, and change "Web page" to <strong className="text-slate-100">Comma-separated values (.csv)</strong>.
            </li>
            <li>
              Click <strong className="text-slate-100">Publish</strong> and copy the generated URL.
            </li>
            <li>
              Paste the URL here and click <strong className="text-slate-100">Sync</strong>. Columns will be auto-mapped using resilient fuzzy string alignment.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
