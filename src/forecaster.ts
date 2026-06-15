import { ProposedLineItem, CalculationResults, CumulativeProfitPoint, LineItemCalculations } from "./types";

/**
 * Calculates safety margins, sales velocity, day-by-day cumulative returns,
 * and validates the 70% cash flow rules based on the mixed-lot line items and aggregate price.
 */
export function calculateForecast(
  lineItems: ProposedLineItem[],
  totalLotPurchasePrice: number,
  totalExpectedUnits: number
): CalculationResults {
  const lineCalculations: { [lineItemId: string]: LineItemCalculations } = {};
  
  let totalActualUnits = 0;
  let totalProjected21DayProfit = 0;

  // 1. Calculate metrics for each line item
  lineItems.forEach((item) => {
    totalActualUnits += item.quantity;

    // Velocity: Units Sold in Last 30 Days / 30
    const dailySalesRate = item.unitsSold30Days / 30;

    // Capped 21-Day Sales: min(Line Item Quantity, Math.floor(DSR * 21))
    const projected21DaySales = Math.min(item.quantity, Math.floor(dailySalesRate * 21));

    // Unit Margin/Profit: (Historical Avg Selling Price - Allocated Unit Purchase Price)
    const unitProfit = item.historicalPrice - item.allocatedUnitPurchasePrice;

    // Line Profit: Line 21-Day Sales * Unit Profit
    const projected21DayProfit = projected21DaySales * unitProfit;

    lineCalculations[item.id] = {
      dailySalesRate,
      projected21DaySales,
      unitProfit,
      projected21DayProfit,
    };

    totalProjected21DayProfit += projected21DayProfit;
  });

  // 2. 70% recoup target based on Total Lot Purchase Price
  const targetRecoupProfit = totalLotPurchasePrice * 0.70;

  // 3. Approval decision rule
  const isApproved = totalProjected21DayProfit >= targetRecoupProfit;
  const shortfall = isApproved ? 0 : targetRecoupProfit - totalProjected21DayProfit;

  // 4. Generate combined cumulative profits across the 21-day timeline
  const cumulativeProfitData: CumulativeProfitPoint[] = [];

  for (let day = 1; day <= 21; day++) {
    let dayTotalProfit = 0;

    lineItems.forEach((item) => {
      const calc = lineCalculations[item.id];
      if (calc) {
        // Daily sales cap on day 'day'
        const daySales = Math.min(item.quantity, Math.floor(calc.dailySalesRate * day));
        const dayProfit = daySales * calc.unitProfit;
        dayTotalProfit += dayProfit;
      }
    });

    cumulativeProfitData.push({
      day,
      cumulativeProfit: Math.round(dayTotalProfit * 100) / 100,
      targetLine: Math.round(targetRecoupProfit * 100) / 100,
    });
  }

  return {
    totalLotPurchasePrice,
    totalExpectedUnits,
    totalActualUnits,
    targetRecoupProfit,
    totalProjected21DayProfit,
    isApproved,
    shortfall,
    lineCalculations,
    cumulativeProfitData,
  };
}
