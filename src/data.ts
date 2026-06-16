import Papa from "papaparse";
import { HardwareRecord } from "./types";

// Extremely realistic and deep dataset that matches the requested columns.
// This allows the application to work out-of-the-box in a highly functional state before custom sheets are linked.
export const DEFAULT_HARDWARE_RECORDS: HardwareRecord[] = [
  // ThinkPad T14 Gen 2
  { modelName: "ThinkPad T14 Gen 2", ram: "8GB", storage: "256GB SSD", historicalPrice: 320, unitsSold30Days: 190, totalI5Variants: 3, totalI7Variants: 2, currentlyInStock: 24, stockI5: 14, stockI7: 10, alreadyHere: 5 },
  { modelName: "ThinkPad T14 Gen 2", ram: "16GB", storage: "512GB SSD", historicalPrice: 450, unitsSold30Days: 140, totalI5Variants: 2, totalI7Variants: 3, currentlyInStock: 18, stockI5: 8, stockI7: 10, alreadyHere: 2 },
  { modelName: "ThinkPad T14 Gen 2", ram: "32GB", storage: "1TB SSD", historicalPrice: 580, unitsSold30Days: 85, totalI5Variants: 1, totalI7Variants: 4, currentlyInStock: 12, stockI5: 2, stockI7: 10, alreadyHere: 1 },
  
  // MacBook Pro M1 14"
  { modelName: "MacBook Pro M1 14\"", ram: "8GB", storage: "256GB SSD", historicalPrice: 790, unitsSold30Days: 155, totalI5Variants: 0, totalI7Variants: 0, currentlyInStock: 8, stockI5: 0, stockI7: 0, alreadyHere: 3 },
  { modelName: "MacBook Pro M1 14\"", ram: "16GB", storage: "512GB SSD", historicalPrice: 950, unitsSold30Days: 110, totalI5Variants: 0, totalI7Variants: 0, currentlyInStock: 15, stockI5: 0, stockI7: 0, alreadyHere: 4 },
  { modelName: "MacBook Pro M1 14\"", ram: "32GB", storage: "1TB SSD", historicalPrice: 1250, unitsSold30Days: 45, totalI5Variants: 0, totalI7Variants: 0, currentlyInStock: 5, stockI5: 0, stockI7: 0, alreadyHere: 1 },
  
  // Dell Latitude 7420
  { modelName: "Dell Latitude 7420", ram: "8GB", storage: "256GB SSD", historicalPrice: 290, unitsSold30Days: 210, totalI5Variants: 4, totalI7Variants: 2, currentlyInStock: 30, stockI5: 20, stockI7: 10, alreadyHere: 8 },
  { modelName: "Dell Latitude 7420", ram: "16GB", storage: "256GB SSD", historicalPrice: 380, unitsSold30Days: 160, totalI5Variants: 3, totalI7Variants: 3, currentlyInStock: 22, stockI5: 12, stockI7: 10, alreadyHere: 6 },
  { modelName: "Dell Latitude 7420", ram: "16GB", storage: "512GB SSD", historicalPrice: 420, unitsSold30Days: 120, totalI5Variants: 2, totalI7Variants: 4, currentlyInStock: 16, stockI5: 6, stockI7: 10, alreadyHere: 4 },
  
  // HP EliteBook 840 G8
  { modelName: "HP EliteBook 840 G8", ram: "8GB", storage: "256GB SSD", historicalPrice: 310, unitsSold30Days: 145, totalI5Variants: 3, totalI7Variants: 1, currentlyInStock: 19, stockI5: 14, stockI7: 5, alreadyHere: 3 },
  { modelName: "HP EliteBook 840 G8", ram: "16GB", storage: "512GB SSD", historicalPrice: 410, unitsSold30Days: 115, totalI5Variants: 2, totalI7Variants: 2, currentlyInStock: 14, stockI5: 8, stockI7: 6, alreadyHere: 2 },
  { modelName: "HP EliteBook 840 G8", ram: "32GB", storage: "1TB SSD", historicalPrice: 620, unitsSold30Days: 50, totalI5Variants: 1, totalI7Variants: 3, currentlyInStock: 8, stockI5: 2, stockI7: 6, alreadyHere: 1 },

  // HP ProBook 445 G8
  { modelName: "HP ProBook 445 G8", ram: "8GB", storage: "256GB SSD", historicalPrice: 270, unitsSold30Days: 130, totalI5Variants: 4, totalI7Variants: 1, currentlyInStock: 22, stockI5: 18, stockI7: 4, alreadyHere: 5 },
  { modelName: "HP ProBook 445 G8", ram: "16GB", storage: "512GB SSD", historicalPrice: 390, unitsSold30Days: 95, totalI5Variants: 3, totalI7Variants: 2, currentlyInStock: 15, stockI5: 10, stockI7: 5, alreadyHere: 3 },

  // iPad Pro 11" M1
  { modelName: "iPad Pro 11\" M1", ram: "8GB", storage: "128GB SSD", historicalPrice: 590, unitsSold30Days: 180, totalI5Variants: 0, totalI7Variants: 0, currentlyInStock: 11, stockI5: 0, stockI7: 0, alreadyHere: 4 },
  { modelName: "iPad Pro 11\" M1", ram: "16GB", storage: "512GB SSD", historicalPrice: 780, unitsSold30Days: 60, totalI5Variants: 0, totalI7Variants: 0, currentlyInStock: 6, stockI5: 0, stockI7: 0, alreadyHere: 2 }
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
      header: false, // Parse as raw 2D array of rows first
      skipEmptyLines: "greedy",
      error: (error: any) => {
        reject(new Error(`Failed to load or parse CSV: ${error.message || error}`));
      },
      complete: (results: any) => {
        const rawRows: any[][] = results.data;
        if (!rawRows || rawRows.length === 0) {
          reject(new Error("No data found in the provided CSV sheet. Verify it is published to the web."));
          return;
        }

        // Find the index of the header row (contains model_name, model, or ram)
        let headerRowIndex = -1;
        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (Array.isArray(row)) {
            const hasHeader = row.some(cell => {
              const norm = normalizeHeader(String(cell || ""));
              return norm === "modelname" || norm === "model" || norm === "ram";
            });
            if (hasHeader) {
              headerRowIndex = i;
              break;
            }
          }
        }

        if (headerRowIndex === -1) {
          reject(new Error("Unable to identify the header row in the CSV. Please ensure it contains 'model_name' or 'model'."));
          return;
        }

        const headers = rawRows[headerRowIndex].map(h => String(h || "").trim());
        const dataRows = rawRows.slice(headerRowIndex + 1);

        // Find best column indexes utilizing fuzzy matching
        const keyMap: { [key in keyof HardwareRecord]?: number } = {};

        headers.forEach((header: string, index: number) => {
          const norm = normalizeHeader(header);
          
          if (header === "model_name" || norm.includes("modelname") || norm === "model" || norm === "device" || norm === "laptop") {
            keyMap.modelName = index;
          } else if (header === "ram" || norm === "ram" || norm === "memory" || norm.includes("ramsize")) {
            keyMap.ram = index;
          } else if (header === "storage" || norm.includes("storage") || norm === "ssd" || norm === "hdd" || norm.includes("drive")) {
            keyMap.storage = index;
          } else if (header === "historical_avg_price" || norm.includes("historicalavgprice") || norm.includes("historicalavgsellingprice") || norm.includes("historicalprice") || norm === "price") {
            keyMap.historicalPrice = index;
          } else if (header === "units_sold_30d" || norm.includes("unitssold30d") || norm.includes("unitssold30days") || norm.includes("unitssoldinlast30days") || norm.includes("sold30") || norm.includes("velocity")) {
            keyMap.unitsSold30Days = index;
          } else if (header === "total_i5_variants" || norm.includes("totali5variants") || norm.includes("i5variants")) {
            keyMap.totalI5Variants = index;
          } else if (header === "total_i7_variants" || norm.includes("totali7variants") || norm.includes("i7variants")) {
            keyMap.totalI7Variants = index;
          } else if (header === "currently_in_stock" || norm.includes("currentlyinstock") || norm.includes("instock")) {
            keyMap.currentlyInStock = index;
          } else if (header === "stock_i5" || norm.includes("stocki5")) {
            keyMap.stockI5 = index;
          } else if (header === "stock_i7" || norm.includes("stocki7")) {
            keyMap.stockI7 = index;
          } else if (header === "already_here" || norm.includes("alreadyhere")) {
            keyMap.alreadyHere = index;
          }
        });

        // Let's check required key maps. If they didn't match fuzzy, let us map via positional indices or search
        const finalModelIdx = keyMap.modelName !== undefined ? keyMap.modelName : headers.findIndex((h: string) => normalizeHeader(h).includes("model"));
        const finalRamIdx = keyMap.ram !== undefined ? keyMap.ram : headers.findIndex((h: string) => normalizeHeader(h).includes("ram"));
        const finalStorageIdx = keyMap.storage !== undefined ? keyMap.storage : headers.findIndex((h: string) => normalizeHeader(h).includes("storage"));
        const finalPriceIdx = keyMap.historicalPrice !== undefined ? keyMap.historicalPrice : headers.findIndex((h: string) => normalizeHeader(h).includes("price") || normalizeHeader(h).includes("selling"));
        const finalUnitsIdx = keyMap.unitsSold30Days !== undefined ? keyMap.unitsSold30Days : headers.findIndex((h: string) => normalizeHeader(h).includes("sold") || normalizeHeader(h).includes("units"));

        if (finalModelIdx === -1 || finalRamIdx === -1 || finalStorageIdx === -1 || finalPriceIdx === -1 || finalUnitsIdx === -1) {
          const foundHeaders = headers.map(h => `"${h}"`).join(", ");
          reject(new Error(`Unable to identify required sheet columns. Found headers: [${foundHeaders}]. Please ensure they contain model_name, ram, storage, historical_avg_price, and units_sold_30d.`));
          return;
        }

        // Helper to find index of new fields
        const getNewFieldIdx = (keyMapVal?: number, searchTerms: string[] = []) => {
          if (keyMapVal !== undefined) return keyMapVal;
          return headers.findIndex((h: string) => {
            const n = normalizeHeader(h);
            return searchTerms.some(term => n.includes(term));
          });
        };

        const finalTotalI5Idx = getNewFieldIdx(keyMap.totalI5Variants, ["totali5", "total_i5"]);
        const finalTotalI7Idx = getNewFieldIdx(keyMap.totalI7Variants, ["totali7", "total_i7"]);
        const finalInStockIdx = getNewFieldIdx(keyMap.currentlyInStock, ["currentlyinstock", "currently_in_stock", "instock"]);
        const finalStockI5Idx = getNewFieldIdx(keyMap.stockI5, ["stocki5", "stock_i5"]);
        const finalStockI7Idx = getNewFieldIdx(keyMap.stockI7, ["stocki7", "stock_i7"]);
        const finalAlreadyHereIdx = getNewFieldIdx(keyMap.alreadyHere, ["alreadyhere", "already_here"]);

        try {
          const records: HardwareRecord[] = dataRows.map((row: any, rowIndex: number) => {
            if (!Array.isArray(row)) return null;

            const rawModel = String(row[finalModelIdx] || "").trim();
            const rawRam = String(row[finalRamIdx] || "").trim();
            const rawStorage = String(row[finalStorageIdx] || "").trim();
            
            // Clean pricing and remove dollar signs, commas, or spaces
            const rawPriceStr = String(row[finalPriceIdx] || "").replace(/[\$,\s]/g, "");
            const rawUnitsStr = String(row[finalUnitsIdx] || "").replace(/[^0-9]/g, "");

            // Clean custom fields and remove any non-digit characters
            const rawTotalI5 = finalTotalI5Idx !== -1 ? String(row[finalTotalI5Idx] || "").replace(/[^0-9]/g, "") : "";
            const rawTotalI7 = finalTotalI7Idx !== -1 ? String(row[finalTotalI7Idx] || "").replace(/[^0-9]/g, "") : "";
            const rawInStock = finalInStockIdx !== -1 ? String(row[finalInStockIdx] || "").replace(/[^0-9]/g, "") : "";
            const rawStockI5 = finalStockI5Idx !== -1 ? String(row[finalStockI5Idx] || "").replace(/[^0-9]/g, "") : "";
            const rawStockI7 = finalStockI7Idx !== -1 ? String(row[finalStockI7Idx] || "").replace(/[^0-9]/g, "") : "";
            const rawAlreadyHere = finalAlreadyHereIdx !== -1 ? String(row[finalAlreadyHereIdx] || "").replace(/[^0-9]/g, "") : "";

            const historicalPrice = parseFloat(rawPriceStr);
            const unitsSold30Days = parseInt(rawUnitsStr, 10);

            const totalI5Variants = parseInt(rawTotalI5, 10);
            const totalI7Variants = parseInt(rawTotalI7, 10);
            const currentlyInStock = parseInt(rawInStock, 10);
            const stockI5 = parseInt(rawStockI5, 10);
            const stockI7 = parseInt(rawStockI7, 10);
            const alreadyHere = parseInt(rawAlreadyHere, 10);

            if (!rawModel) {
              // Ignore rows starting with blank model name
              return null;
            }

            return {
              modelName: rawModel,
              ram: rawRam || "N/A",
              storage: rawStorage || "N/A",
              historicalPrice: isNaN(historicalPrice) ? 0 : historicalPrice,
              unitsSold30Days: isNaN(unitsSold30Days) ? 0 : unitsSold30Days,
              totalI5Variants: isNaN(totalI5Variants) ? 0 : totalI5Variants,
              totalI7Variants: isNaN(totalI7Variants) ? 0 : totalI7Variants,
              currentlyInStock: isNaN(currentlyInStock) ? 0 : currentlyInStock,
              stockI5: isNaN(stockI5) ? 0 : stockI5,
              stockI7: isNaN(stockI7) ? 0 : stockI7,
              alreadyHere: isNaN(alreadyHere) ? 0 : alreadyHere
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
