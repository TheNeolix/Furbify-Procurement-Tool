import React, { useState, useEffect, useMemo } from "react";
import { Cpu, HardDrive, Inbox, DollarSign, LayoutList, Calculator, Plus, Sparkles, Tag, ChevronDown } from "lucide-react";
import { HardwareRecord, ProposedLineItem } from "../types";

interface ProposedLotFormProps {
  records: HardwareRecord[];
  
  // Global lot inputs
  totalLotPurchasePrice: number;
  setTotalLotPurchasePrice: (val: number) => void;
  totalExpectedUnits: number;
  setTotalExpectedUnits: (val: number) => void;

  // Add line item handler
  onAddLineItem: (item: Omit<ProposedLineItem, "id">) => void;
}

export function ProposedLotForm({
  records,
  totalLotPurchasePrice,
  setTotalLotPurchasePrice,
  totalExpectedUnits,
  setTotalExpectedUnits,
  onAddLineItem
}: ProposedLotFormProps) {
  // 1. Dynamic local selection state for the Line-Item Entry Form
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedRam, setSelectedRam] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [condition, setCondition] = useState<string>("Grade A");
  const [quantity, setQuantity] = useState<number>(10);
  const [allocatedPrice, setAllocatedPrice] = useState<number>(150);

  // Dropdown / Search state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // 2. Extract options for Cascading selection
  const models = useMemo(() => {
    return Array.from(new Set(records.map(r => r.modelName))).sort();
  }, [records]);

  // Sync searchQuery when selectedModel changes
  useEffect(() => {
    setSearchQuery(selectedModel);
  }, [selectedModel]);

  // Filter models based on search term
  const filteredModels = useMemo(() => {
    if (!searchQuery || searchQuery === selectedModel) {
      return models;
    }
    return models.filter(m =>
      m.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery, selectedModel]);

  // Reset active index when query or open state changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery, isOpen]);

  // Set default model on records change
  useEffect(() => {
    if (models.length > 0 && !models.includes(selectedModel)) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  const rams = useMemo(() => {
    return Array.from(new Set(
      records.filter(r => r.modelName === selectedModel).map(r => r.ram)
    )).sort();
  }, [records, selectedModel]);

  // Handle RAM cascading
  useEffect(() => {
    if (rams.length > 0 && !rams.includes(selectedRam)) {
      setSelectedRam(rams[0]);
    }
  }, [rams, selectedRam]);

  const storages = useMemo(() => {
    return Array.from(new Set(
      records.filter(r => r.modelName === selectedModel && r.ram === selectedRam).map(r => r.storage)
    )).sort();
  }, [records, selectedModel, selectedRam]);

  // Handle Storage cascading
  useEffect(() => {
    if (storages.length > 0 && !storages.includes(selectedStorage)) {
      setSelectedStorage(storages[0]);
    }
  }, [storages, selectedStorage]);

  // Find historical record match
  const matchedRecord = useMemo(() => {
    return records.find(
      r => r.modelName === selectedModel && r.ram === selectedRam && r.storage === selectedStorage
    );
  }, [records, selectedModel, selectedRam, selectedStorage]);

  // Autofill allocated unit purchase price based on historical price to assist user input
  useEffect(() => {
    if (matchedRecord) {
      // Default to 60% of historical price for a healthy initial suggestion
      setAllocatedPrice(Math.round(matchedRecord.historicalPrice * 0.60));
    }
  }, [matchedRecord]);

  // Form submission handler
  const handleAddClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;

    onAddLineItem({
      modelName: selectedModel,
      ram: selectedRam || "N/A",
      storage: selectedStorage || "N/A",
      condition: condition.trim() || "Grade A",
      quantity: Math.max(1, quantity),
      allocatedUnitPurchasePrice: Math.max(0, allocatedPrice),
      historicalPrice: matchedRecord ? matchedRecord.historicalPrice : 0,
      unitsSold30Days: matchedRecord ? matchedRecord.unitsSold30Days : 0,
    });

    // Reset entry inputs for next addition (keep model selections active)
    setCondition("Grade A");
    setQuantity(10);
  };

  const handleOptionClick = (model: string) => {
    setSelectedModel(model);
    setSearchQuery(model);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery(selectedModel);
      e.currentTarget.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex((prev) =>
          prev < filteredModels.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    } else if (e.key === "Enter") {
      if (isOpen && filteredModels.length > 0) {
        e.preventDefault();
        const indexToSelect = activeIndex >= 0 && activeIndex < filteredModels.length ? activeIndex : 0;
        handleOptionClick(filteredModels[indexToSelect]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* CARD 1: GLOBAL LOT VARIABLES */}
      <section className="bg-[#12171f] rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col gap-4 text-slate-100">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-sans border-b border-slate-800 pb-3 flex items-center gap-2">
          <Calculator size={14} className="text-indigo-400" />
          Global Lot Specifications
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Lot Purchase Price */}
          <div className="flex flex-col gap-1.5 animate-fade-in">
            <label htmlFor="global-lot-price" className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <DollarSign size={13} className="text-emerald-400" /> Total Lot Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                $
              </span>
              <input
                id="global-lot-price"
                type="number"
                min="1"
                placeholder="0"
                value={totalLotPurchasePrice || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTotalLotPurchasePrice(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-[#1a212c] border border-slate-700 rounded-lg pl-6 pr-3 py-2.5 text-xs text-white font-bold focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {totalLotPurchasePrice <= 0 && (
              <span className="text-[9px] text-rose-400 font-semibold">
                Price is required.
              </span>
            )}
          </div>

          {/* Total Expected Units */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="global-expected-units" className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Inbox size={13} className="text-indigo-400" /> Expected Units
            </label>
            <div className="relative">
              <input
                id="global-expected-units"
                type="number"
                min="1"
                placeholder="0"
                value={totalExpectedUnits || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setTotalExpectedUnits(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-[#1a212c] border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold font-mono">
                qty
              </span>
            </div>
            {totalExpectedUnits <= 0 && (
              <span className="text-[9px] text-rose-400 font-semibold">
                Quantity is required.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* CARD 2: LINE-ITEM ENTRY FORM */}
      <section className="bg-[#12171f] rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col gap-4 text-slate-100">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-sans border-b border-slate-800 pb-3 flex items-center gap-2">
          <Tag size={14} className="text-indigo-400" />
          Add Devices to Proposed Lot
        </h3>

        <form onSubmit={handleAddClick} className="flex flex-col gap-4">
          {/* Model selection */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="model-search-input" className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <LayoutList size={13} /> Model Name
            </label>
            <div className="relative">
              <input
                id="model-search-input"
                type="text"
                value={searchQuery}
                placeholder="Search or select model..."
                onFocus={() => setIsOpen(true)}
                onBlur={() => {
                  // Wait slightly to let option clicks register first
                  setTimeout(() => {
                    setIsOpen(false);
                    setSearchQuery(selectedModel);
                  }, 150);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#1a212c] border border-slate-700 rounded-lg pl-3 pr-8 py-2.5 text-xs focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-medium cursor-text"
              />
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer flex items-center"
              >
                <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-60 overflow-y-auto bg-[#1a212c] border border-slate-700 rounded-lg shadow-xl z-50 flex flex-col py-1">
                  {filteredModels.length === 0 ? (
                    <span className="px-3 py-2 text-xs text-slate-500 italic">No models match your search</span>
                  ) : (
                    filteredModels.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onMouseDown={(e) => {
                          // Prevent input blur to ensure click registers first
                          e.preventDefault();
                        }}
                        onClick={() => handleOptionClick(m)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors ${
                          idx === activeIndex
                            ? "bg-indigo-600 text-white font-semibold"
                            : m === selectedModel
                            ? "bg-indigo-600/20 text-indigo-400 font-bold border-l-2 border-indigo-500"
                            : "text-slate-300 hover:bg-[#252f3f] hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* RAM Option */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ram-select" className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Cpu size={13} /> RAM Config
              </label>
              <select
                id="ram-select"
                value={selectedRam}
                onChange={(e) => setSelectedRam(e.target.value)}
                disabled={rams.length === 0}
                className="bg-[#1a212c] border border-slate-700 rounded-lg px-3 py-2.5 text-xs focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-medium cursor-pointer disabled:opacity-50"
              >
                {rams.length === 0 ? (
                  <option value="">Select model...</option>
                ) : (
                  rams.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Storage Option */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="storage-select" className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <HardDrive size={13} /> Storage Drive
              </label>
              <select
                id="storage-select"
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                disabled={storages.length === 0}
                className="bg-[#1a212c] border border-slate-700 rounded-lg px-3 py-2.5 text-xs focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-medium cursor-pointer disabled:opacity-50"
              >
                {storages.length === 0 ? (
                  <option value="">Select RAM...</option>
                ) : (
                  storages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Issue or Condition Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-condition" className="text-xs font-bold text-slate-400">
              Condition / Issue Description
            </label>
            <input
              id="device-condition"
              type="text"
              required
              placeholder="e.g. Grade A, Minor Scratches, Missing Keys"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="bg-[#1a212c] border border-slate-700 rounded-lg px-3 py-2.5 text-xs focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Lot Item Quantity */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="line-quantity" className="text-xs font-bold text-slate-400">
                Quantity
              </label>
              <input
                id="line-quantity"
                type="number"
                min="1"
                required
                value={quantity || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) ? 0 : val);
                }}
                className="bg-[#1a212c] border border-slate-700 rounded-lg px-3 py-2.5 text-xs focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-bold"
              />
            </div>

            {/* Allocated Unit price */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="line-allocated-price" className="text-xs font-bold text-slate-400">
                Allocated Unit Cost ($)
              </label>
              <input
                id="line-allocated-price"
                type="number"
                min="0"
                required
                value={allocatedPrice || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAllocatedPrice(isNaN(val) ? 0 : val);
                }}
                className="bg-[#1a212c] border border-slate-700 rounded-lg px-3 py-2.5 text-xs focus:bg-[#151a24] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-bold"
              />
            </div>
          </div>

          {/* Match statistics card for reference directly under additions */}
          {matchedRecord && (
            <div className="bg-[#161d28] border border-slate-800/80 rounded-lg p-3.5 text-[11px] flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                <span className="font-bold text-indigo-400 font-mono tracking-wide uppercase text-[10px] flex items-center gap-1">
                  <Sparkles size={11} /> Historical Benchmark Reference
                </span>
                <span className="text-[9px] text-slate-500 font-mono">SPEC INFO</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-300">
                <div>
                  <span className="text-slate-400">Avg Resale Price: </span>
                  <span className="font-bold text-white">${matchedRecord.historicalPrice}</span>
                </div>
                <div>
                  <span className="text-slate-400">30D Velocity: </span>
                  <span className="font-bold text-white">{matchedRecord.unitsSold30Days} u</span>
                </div>
                
                <div className="col-span-2 border-t border-slate-850 my-1 pt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Stock & Variant Data
                </div>
                
                <div>
                  <span className="text-slate-400">Currently in Stock: </span>
                  <span className="font-bold text-emerald-400">{matchedRecord.currentlyInStock ?? 0} u</span>
                </div>
                <div>
                  <span className="text-slate-400">Already Here: </span>
                  <span className="font-bold text-indigo-400">{matchedRecord.alreadyHere ?? 0} u</span>
                </div>
                
                <div>
                  <span className="text-slate-400">Total i5 Variants: </span>
                  <span className="font-bold text-white">{matchedRecord.totalI5Variants ?? 0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Total i7 Variants: </span>
                  <span className="font-bold text-white">{matchedRecord.totalI7Variants ?? 0}</span>
                </div>
                
                <div>
                  <span className="text-slate-400">Stock i5: </span>
                  <span className="font-bold text-white">{matchedRecord.stockI5 ?? 0} u</span>
                </div>
                <div>
                  <span className="text-slate-400">Stock i7: </span>
                  <span className="font-bold text-white">{matchedRecord.stockI7 ?? 0} u</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedModel || quantity <= 0 || allocatedPrice < 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-[#1c232f] disabled:text-slate-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Plus size={16} /> Add Line Item to Lot
          </button>
        </form>
      </section>
    </div>
  );
}
