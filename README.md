# Furbify Procurement Tool (FPT)

Furbify Procurement Tool (FPT) is a professional, high-performance web dashboard designed for secondary-market hardware procurement teams. FPT enables procurement managers to evaluate mixed-lot hardware inventory purchases, run predictive cash flow simulations, and make data-driven, risk-adjusted buy decisions based on historical sales velocity and market benchmark values.

---

## Key Features

* **Google Sheets Synchronization**: Connect a live Google Sheet containing hardware benchmarks (historical prices, sales velocity) to feed the simulation.
* **Searchable Combobox Model Entry**: Type to search model names with full keyboard support (`ArrowUp`, `ArrowDown`, `Enter` to select, `Esc` to close) matching Excel-like native search UX.
* **21-Day Sales Simulation**: Models demand curves over a 21-day horizon, matching inventory constraints with historical sales rates.
* **70% Capital Recoup Verdict**: Automatic risk evaluation verifying if the lot's projected 21-day sales will recoup at least 70% of the total lot purchase price.
* **Interactive Timeline Trajectory**: Features a rich Recharts-powered Area Chart simulating cumulative returns against target recoup thresholds.
* **Procurement Bid Action Strategy**: Automatically recommends exact target price renegotiations and cost reduction adjustments when a deal fails the risk check.
* **Audit Discrepancy Alerts**: Detects and flags quantity mismatches between expected supplier lot counts and itemized entry logs.

---

## Forecasting & Mathematical Logic

The forecasting engine simulates cash flows using historical velocity benchmarks. The calculations used by the application are structured as follows:

### 1. Variables & Definitions

| Variable | Symbol | Description | Source |
| :--- | :---: | :--- | :--- |
| **Total Lot Purchase Price** | $L$ | The price requested by the supplier for the entire lot. | User Input |
| **Expected Units** | $E_{\text{total}}$ | The total count of devices expected in the lot. | User Input |
| **Line Item Quantity** | $Q_i$ | The quantity of device model $i$ in the proposed lot. | User Input |
| **Allocated Unit Cost** | $C_i$ | The purchase cost allocated to a single unit of model $i$. | User Input |
| **Avg Resale Price** | $P_i$ | The average historical selling price for device model $i$. | Linked Sheet / Demo Data |
| **30-Day Sales Velocity** | $U_{30,i}$ | Total units of model $i$ sold historically over the last 30 days. | Linked Sheet / Demo Data |

---

### 2. Core Formulas

#### Daily Sales Rate (DSR)
Calculates the average speed at which a model sells per day:
$$R_i = \frac{U_{30,i}}{30}$$

#### Capped 21-Day Sales
Calculates the number of units projected to sell during a standard 21-day window, capped by the actual quantity in the lot:
$$S_{21,i} = \min\left(Q_i, \lfloor R_i \times 21 \rfloor\right)$$

#### Unit Margin
Calculates the gross margin per unit sold:
$$M_i = P_i - C_i$$

#### Projected 21-Day Profit (Per Line Item)
Calculates the total projected cash returns for a specific hardware spec line:
$$\text{Profit}_{21,i} = S_{21,i} \times M_i$$

#### Total Projected 21-Day Profit
The sum of projected profits across all items in the lot:
$$\text{Profit}_{21,\text{total}} = \sum_i \text{Profit}_{21,i}$$

---

### 3. Decision Rules & Risk Management

#### Capital Recoup Target
The company requires that **at least 70% of the invested lot capital ($L$)** be recouped within the 21-day sales window to manage depreciation and inventory aging risks:
$$\text{Recoup}_{\text{target}} = L \times 0.70$$

#### Purchase Verdict (GO / NO-GO)
The deal is approved if the projected profits cover the 70% recoup target:
$$\text{Verdict} = \begin{cases} \mathbf{GO} & \text{if } \text{Profit}_{21,\text{total}} \ge \text{Recoup}_{\text{target}} \\ \mathbf{NO\text{-}GO} & \text{if } \text{Profit}_{21,\text{total}} < \text{Recoup}_{\text{target}} \end{cases}$$

#### Recoup Rate (%)
The percentage of the recoup target covered by projected 21-day profits:
$$\text{Recoup Rate (\%)} = \frac{\text{Profit}_{21,\text{total}}}{\text{Recoup}_{\text{target}}} \times 100$$

#### Recoup Shortfall
If the deal is a **NO-GO**, the shortfall amount is computed as:
$$\text{Shortfall} = \text{Recoup}_{\text{target}} - \text{Profit}_{21,\text{total}}$$

---

### 4. Bid Action Strategy (Renegotiation)

If a deal is rejected (**NO-GO**), the tool calculates how to make it viable:

* **Maximum Purchase Price ($L_{\text{max}}$)**: The maximum price you should pay for this lot to meet the 70% cash flow rule:
  $$L_{\text{max}} = \frac{\text{Profit}_{21,\text{total}}}{0.70}$$
* **Cost Reduction Needed**: The required discount to request from the supplier:
  $$\text{Reduction}_{\text{needed}} = L - L_{\text{max}}$$

---

## Technology Stack

* **Frontend**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Vanilla CSS variables
* **Charts**: Recharts (interactive responsive area graphs)
* **Icons**: Lucide React
* **Parsing**: PapaParse (fast, local CSV parsing)

---

## Local Development Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm**

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Create a `.env` file in the root directory (you can copy `.env.example`):
```bash
cp .env.example .env
```
*(If adding custom Google API components or AI integrations in the future, set your keys here)*

### Step 3: Run Development Server
```bash
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:3000`).

### Step 4: Build for Production
To build the static production bundle:
```bash
npm run build
```
The output files will be built inside the `dist/` directory.
