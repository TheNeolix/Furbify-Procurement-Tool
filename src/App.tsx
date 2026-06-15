import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { SheetSettings } from "./components/SheetSettings";
import { ProposedLotForm } from "./components/ProposedLotForm";
import { AnalysisResults } from "./components/AnalysisResults";
import { DEFAULT_HARDWARE_RECORDS, fetchGoogleSheetRecords } from "./data";
import { calculateForecast } from "./forecaster";
import { HardwareRecord, ProposedLineItem } from "./types";

// Setup descriptive default line items so the app is immediately enriched with simulation data upon first boot.
const INITIAL_PROPOSED_ITEMS: ProposedLineItem[] = [
  {
    id: "pre-1",
    modelName: "ThinkPad T14 Gen 2",
    ram: "16GB",
    storage: "512GB SSD",
    condition: "Grade A",
    quantity: 45,
    allocatedUnitPurchasePrice: 200,
    historicalPrice: 450,
    unitsSold30Days: 140
  },
  {
    id: "pre-2",
    modelName: "MacBook Pro M1 14\"",
    ram: "16GB",
    storage: "512GB SSD",
    condition: "Minor Scratches",
    quantity: 15,
    allocatedUnitPurchasePrice: 500,
    historicalPrice: 950,
    unitsSold30Days: 110
  },
  {
    id: "pre-3",
    modelName: "Dell Latitude 7420",
    ram: "8GB",
    storage: "256GB SSD",
    condition: "Grade B",
    quantity: 55,
    allocatedUnitPurchasePrice: 125,
    historicalPrice: 290,
    unitsSold30Days: 210
  }
];

export default function App() {
  // 1. Core Synchronization State
  const [records, setRecords] = useState<HardwareRecord[]>(DEFAULT_HARDWARE_RECORDS);
  const [useLiveConnection, setUseLiveConnection] = useState<boolean>(false);
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // 2. Global Lot Specifications
  const [totalLotPurchasePrice, setTotalLotPurchasePrice] = useState<number>(25000);
  const [totalExpectedUnits, setTotalExpectedUnits] = useState<number>(120);

  // 3. Line Items array in proposed lot
  const [lineItems, setLineItems] = useState<ProposedLineItem[]>(INITIAL_PROPOSED_ITEMS);

  // Load user settings from cache on mount
  useEffect(() => {
    const cachedUrl = localStorage.getItem("forecasting_sheet_url_multi");
    const cachedLive = localStorage.getItem("forecasting_use_live_multi");
    const cachedLastSync = localStorage.getItem("forecasting_last_sync_multi");
    
    // Cache total variables
    const cachedPrice = localStorage.getItem("forecasting_lot_price");
    const cachedUnits = localStorage.getItem("forecasting_lot_units");
    const cachedItems = localStorage.getItem("forecasting_line_items");

    if (cachedUrl) {
      setSheetUrl(cachedUrl);
    }
    if (cachedPrice) {
      setTotalLotPurchasePrice(parseFloat(cachedPrice) || 25000);
    }
    if (cachedUnits) {
      setTotalExpectedUnits(parseInt(cachedUnits, 10) || 120);
    }
    if (cachedItems) {
      try {
        const parsed = JSON.parse(cachedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLineItems(parsed);
        }
      } catch (e) {
        console.error("Failed to restore cached line items:", e);
      }
    }

    if (cachedLive === "true") {
      setUseLiveConnection(true);
      if (cachedUrl) {
        setImmediateSyncOnLoad(cachedUrl);
      }
    }

    if (cachedLastSync) {
      setLastSyncTime(cachedLastSync);
    }
  }, []);

  // Sync to localStorage on state changes to maintain robust sessions
  useEffect(() => {
    localStorage.setItem("forecasting_lot_price", String(totalLotPurchasePrice));
  }, [totalLotPurchasePrice]);

  useEffect(() => {
    localStorage.setItem("forecasting_lot_units", String(totalExpectedUnits));
  }, [totalExpectedUnits]);

  useEffect(() => {
    localStorage.setItem("forecasting_line_items", JSON.stringify(lineItems));
  }, [lineItems]);

  // Sync initial dataset fetch from Sheet URL if configured
  const setImmediateSyncOnLoad = async (url: string) => {
    setIsLoading(true);
    try {
      const liveRecords = await fetchGoogleSheetRecords(url);
      setRecords(liveRecords);
      setSuccessMsg(`Restored active cache. Synced and parsed ${liveRecords.length} records.`);
    } catch (err: any) {
      console.error("Failed to restore sheet on boot:", err);
      setErrorMsg("Failed to sync cached Google Sheet URL. Reverted to local demo datasets.");
      setRecords(DEFAULT_HARDWARE_RECORDS);
      setUseLiveConnection(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Google sheet URL Synchronization Handler
  const handleSync = async () => {
    if (!sheetUrl) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const liveRecords = await fetchGoogleSheetRecords(sheetUrl);
      setRecords(liveRecords);
      
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(timeStr);
      setSuccessMsg(`Successfully imported ${liveRecords.length} specs.`);
      
      localStorage.setItem("forecasting_sheet_url_multi", sheetUrl.trim());
      localStorage.setItem("forecasting_last_sync_multi", timeStr);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to download spreadsheet metadata.");
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between Live and local connection modes
  useEffect(() => {
    localStorage.setItem("forecasting_use_live_multi", String(useLiveConnection));
    if (!useLiveConnection) {
      setRecords(DEFAULT_HARDWARE_RECORDS);
      setErrorMsg(null);
      setSuccessMsg(null);
    } else if (sheetUrl) {
      handleSync();
    }
  }, [useLiveConnection]);

  // Add a brand-new configured line item to the current proposed lot
  const handleAddLineItem = (newItem: Omit<ProposedLineItem, "id">) => {
    const uniqueId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setLineItems((prev) => [
      ...prev,
      {
        ...newItem,
        id: uniqueId
      }
    ]);
  };

  // Remove proposed line item by id
  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 4. Calculate overall analysis results on current lot data
  const results = useMemo(() => {
    if (lineItems.length === 0) {
      return null;
    }
    return calculateForecast(lineItems, totalLotPurchasePrice, totalExpectedUnits);
  }, [lineItems, totalLotPurchasePrice, totalExpectedUnits]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 flex flex-col font-sans pb-12">
      {/* Dynamic Navigation Topbar */}
      <Header 
        useLiveConnection={useLiveConnection} 
        statusText={isLoading ? "Syncing..." : "Ready"} 
        hasRecords={records.length > 0} 
      />

      {/* Main Responsive Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Control Settings & Form Inputs Configuration Panel */}
        <section className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Google Sheets Synchronization Settings Card */}
          <SheetSettings
            useLiveConnection={useLiveConnection}
            setUseLiveConnection={setUseLiveConnection}
            sheetUrl={sheetUrl}
            setSheetUrl={setSheetUrl}
            isLoading={isLoading}
            onSync={handleSync}
            errorMsg={errorMsg}
            successMsg={successMsg}
            recordsCount={records.length}
            lastSyncTime={lastSyncTime}
          />

          {/* Dynamic Lot/Item Parameter Configuration Form */}
          <ProposedLotForm
            records={records}
            totalLotPurchasePrice={totalLotPurchasePrice}
            setTotalLotPurchasePrice={setTotalLotPurchasePrice}
            totalExpectedUnits={totalExpectedUnits}
            setTotalExpectedUnits={setTotalExpectedUnits}
            onAddLineItem={handleAddLineItem}
          />
        </section>

        {/* Right Side: Analytical Output & Live Visual Dashboard Viewport */}
        <section className="lg:col-span-7 flex flex-col gap-6 w-full h-full min-h-[450px]">
          {results ? (
            <AnalysisResults 
              results={results} 
              lineItems={lineItems}
              onRemoveLineItem={handleRemoveLineItem}
            />
          ) : (
            <div className="bg-[#12171f] border border-slate-800 rounded-xl p-8 py-14 text-center flex flex-col items-center justify-center min-h-[450px] shadow-xs">
              <div className="h-16 w-16 rounded-full bg-[#1a212c] flex items-center justify-center text-indigo-400 mb-5 border border-slate-800/60 shadow-lg">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">Proposed Purchase Lot is Idle</h3>
              <p className="text-slate-450 text-xs max-w-md mt-2 leading-relaxed font-semibold">
                Please add system specs as line items within the Proposed Lot form on the left, configure purchase price expectations, and begin simulating cumulative cash cover velocity statistics.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
