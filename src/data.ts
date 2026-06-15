import Papa from "papaparse";
import { HardwareRecord } from "./types";

// Extremely realistic and deep dataset that matches the requested columns.
// This allows the application to work out-of-the-box in a highly functional state before custom sheets are linked.
export const DEFAULT_HARDWARE_RECORDS: HardwareRecord[] = [
  // ThinkPad T14 Gen 2
  { modelName: "ThinkPad T14 Gen 2", ram: "8GB", storage: "256GB SSD", historicalPrice: 320, unitsSold30Days: 190 },
  { modelName: "ThinkPad T14 Gen 2", ram: "16GB", storage: "512GB SSD", historicalPrice: 450, unitsSold30Days: 140 },
  { modelName: "ThinkPad T14 Gen 2", ram: "32GB", storage: "1TB SSD", historicalPrice: 580, unitsSold30Days: 85 },
  
  // MacBook Pro M1 14"
  { modelName: "MacBook Pro M1 14\"", ram: "8GB", storage: "256GB SSD", historicalPrice: 790, unitsSold30Days: 155 },
  { modelName: "MacBook Pro M1 14\"", ram: "16GB", storage: "512GB SSD", historicalPrice: 950, unitsSold30Days: 110 },
  { modelName: "MacBook Pro M1 14\"", ram: "32GB", storage: "1TB SSD", historicalPrice: 1250, unitsSold30Days: 45 },
  
  // Dell Latitude 7420
  { modelName: "Dell Latitude 7420", ram: "8GB", storage: "256GB SSD", historicalPrice: 290, unitsSold30Days: 210 },
  { modelName: "Dell Latitude 7420", ram: "16GB", storage: "256GB SSD", historicalPrice: 380, unitsSold30Days: 160 },
  { modelName: "Dell Latitude 7420", ram: "16GB", storage: "512GB SSD", historicalPrice: 420, unitsSold30Days: 120 },
  
  // HP EliteBook 840 G8
  { modelName: "HP EliteBook 840 G8", ram: "8GB", storage: "256GB SSD", historicalPrice: 310, unitsSold30Days: 145 },
  { modelName: "HP EliteBook 840 G8", ram: "16GB", storage: "512GB SSD", historicalPrice: 410, unitsSold30Days: 115 },
  { modelName: "HP EliteBook 840 G8", ram: "32GB", storage: "1TB SSD", historicalPrice: 620, unitsSold30Days: 50 },

  // HP ProBook 445 G8
  { modelName: "HP ProBook 445 G8", ram: "8GB", storage: "256GB SSD", historicalPrice: 270, unitsSold30Days: 130 },
  { modelName: "HP ProBook 445 G8", ram: "16GB", storage: "512GB SSD", historicalPrice: 390, unitsSold30Days: 95 },

  // iPad Pro 11" M1
  { modelName: "iPad Pro 11\" M1", ram: "8GB", storage: "128GB SSD", historicalPrice: 590, unitsSold30Days: 180 },
  { modelName: "iPad Pro 11\" M1", ram: "16GB", storage: "512GB SSD", historicalPrice: 780, unitsSold30Days: 60 }
];

// Re-usable public Google Sheets URL placeholder to guide the user in setting up their sheet.
// Google Sheets sharing links can easily be formatted as CSV using /export?format=csv or /pub?output=csv
export const SAMPLE_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-918gH_6uNiafSgD8fN405Nlyf0L1VfE6fI70uEIsz6YV-vE69Y19_eNf6R_s08vY_eD9O-n3R0Y7vg/pub?output=csv";

/**
 * Normalizes a header string by converting to lowercase and stripping non-alphanumeric characters.
 * Helpful for matching column headers like "Model Name", "Model_Name", "Model" to standard fields.
 */
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Parses and returns HardwareRecord items from a Published CSV Google Sheets URL.
 * Included with sophisticated mapping fallback for optimal user convenience.
 */
export async function fetchGoogleSheetRecords(url: string): Promise<HardwareRecord[]> {
  if (!url) {
    throw new Error("Google Sheet URL is empty. Please provide a published CSV URL.");
  }

  // Adjust URL to ensure it pulls CSV if it's a standard viewer URL
  let parsedUrl = url.trim();
  if (parsedUrl.includes("docs.google.com/spreadsheets") && !parsedUrl.includes("output=csv") && !parsedUrl.includes("export?format=csv")) {
    if (parsedUrl.includes("/edit")) {
      parsedUrl = parsedUrl.replace(/\/edit.*$/, "/export?format=csv");
    } else {
      parsedUrl = parsedUrl + (parsedUrl.includes("?") ? "&" : "?") + "export=csv";
    }
  }

  return new Promise((resolve, reject) => {
    Papa.parse(parsedUrl, {
      download: true,
      header: true,
      skipEmptyLines: "greedy",
      error: (error: any) => {
        reject(new Error(`Failed to load or parse CSV: ${error.message || error}`));
      },
      complete: (results: any) => {
        const { data, meta } = results;
        if (!data || data.length === 0) {
          reject(new Error("No data found in the provided CSV sheet. Verify it is published to the web."));
          return;
        }

        const headers = meta.fields || Object.keys(data[0] || {});
        
        // Find best column indexes or keys utilizing fuzzy matching
        const keyMap: { [key in keyof HardwareRecord]?: string } = {};

        headers.forEach((originalHeader: string) => {
          const norm = normalizeHeader(originalHeader);
          
          if (norm.includes("modelname") || norm === "model" || norm === "device" || norm === "laptop") {
            keyMap.modelName = originalHeader;
          } else if (norm === "ram" || norm === "memory" || norm.includes("ramsize")) {
            keyMap.ram = originalHeader;
          } else if (norm.includes("storage") || norm === "ssd" || norm === "hdd" || norm.includes("drive")) {
            keyMap.storage = originalHeader;
          } else if (norm.includes("historicalavgsellingprice") || norm.includes("avgsellingprice") || norm.includes("sellingprice") || norm.includes("historicalprice") || norm === "price") {
            keyMap.historicalPrice = originalHeader;
          } else if (norm.includes("unitssoldinlast30days") || norm.includes("unitssold30days") || norm.includes("soldinlast30days") || norm.includes("sold30") || norm.includes("sold30days") || norm.includes("velocity")) {
            keyMap.unitsSold30Days = originalHeader;
          }
        });

        // Let's check required key maps. If they didn't match fuzzy, let us map via keyword contains or fall back to positional indices
        const finalModelKey = keyMap.modelName || headers.find((h: string) => normalizeHeader(h).includes("model")) || headers[0];
        const finalRamKey = keyMap.ram || headers.find((h: string) => normalizeHeader(h).includes("ram")) || headers[1];
        const finalStorageKey = keyMap.storage || headers.find((h: string) => normalizeHeader(h).includes("storage")) || headers[2];
        const finalPriceKey = keyMap.historicalPrice || headers.find((h: string) => normalizeHeader(h).includes("price") || normalizeHeader(h).includes("selling")) || headers[3];
        const finalUnitsKey = keyMap.unitsSold30Days || headers.find((h: string) => normalizeHeader(h).includes("sold") || normalizeHeader(h).includes("units")) || headers[4];

        if (!finalModelKey || !finalRamKey || !finalStorageKey || !finalPriceKey || !finalUnitsKey) {
          reject(new Error("Unable to identify required sheet columns. Please ensure they contain Model Name, RAM, Storage, Historical Price, and 30-day sales."));
          return;
        }

        try {
          const records: HardwareRecord[] = data.map((row: any, index: number) => {
            const rawModel = String(row[finalModelKey] || "").trim();
            const rawRam = String(row[finalRamKey] || "").trim();
            const rawStorage = String(row[finalStorageKey] || "").trim();
            
            // Clean pricing and remove dollar signs, commas, or spaces
            const rawPriceStr = String(row[finalPriceKey] || "").replace(/[\$,\s]/g, "");
            const rawUnitsStr = String(row[finalUnitsKey] || "").replace(/[^0-9]/g, "");

            const historicalPrice = parseFloat(rawPriceStr);
            const unitsSold30Days = parseInt(rawUnitsStr, 10);

            if (!rawModel) {
              // Ignore rows starting with blank model name
              return null;
            }

            if (isNaN(historicalPrice) || isNaN(unitsSold30Days)) {
              console.warn(`Row ${index + 1} has invalid numerical data: price='${row[finalPriceKey]}', units='${row[finalUnitsKey]}'`);
            }

            return {
              modelName: rawModel,
              ram: rawRam || "N/A",
              storage: rawStorage || "N/A",
              historicalPrice: isNaN(historicalPrice) ? 0 : historicalPrice,
              unitsSold30Days: isNaN(unitsSold30Days) ? 0 : unitsSold30Days
            };
          }).filter((r: any): r is HardwareRecord => r !== null);

          if (records.length === 0) {
            reject(new Error("No valid rows could be imported from the Google Sheet. Double check structure and formatting."));
            return;
          }

          resolve(records);
        } catch (e: any) {
          reject(new Error(`Data mapping failed: ${e.message}`));
        }
      }
    });
  });
}
