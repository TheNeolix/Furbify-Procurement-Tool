export interface HardwareRecord {
  modelName: string;
  ram: string;
  storage: string;
  historicalPrice: number;
  unitsSold30Days: number;
  totalI5Variants?: number;
  totalI7Variants?: number;
  currentlyInStock?: number;
  stockI5?: number;
  stockI7?: number;
  alreadyHere?: number;
}

export interface ProposedLineItem {
  id: string;
  modelName: string;
  ram: string;
  storage: string;
  condition: string; // e.g. "Grade A", "Missing Keys"
  quantity: number;
  allocatedUnitPurchasePrice: number; // Allocated cost/unit
  // For easy display
  historicalPrice: number;
  unitsSold30Days: number;
}

export interface CumulativeProfitPoint {
  day: number;
  cumulativeProfit: number;
  targetLine: number;
}

export interface LineItemCalculations {
  dailySalesRate: number;
  projected21DaySales: number;
  unitProfit: number;
  projected21DayProfit: number;
}

export interface CalculationResults {
  totalLotPurchasePrice: number;
  totalExpectedUnits: number;
  totalActualUnits: number;
  targetRecoupProfit: number;
  totalProjected21DayProfit: number;
  isApproved: boolean;
  shortfall: number;
  lineCalculations: { [lineItemId: string]: LineItemCalculations };
  cumulativeProfitData: CumulativeProfitPoint[];
}
