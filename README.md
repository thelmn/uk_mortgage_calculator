# UK Mortgage Calculator

A comprehensive UK mortgage calculator built with Next.js, React, TypeScript, and Tailwind CSS. This application allows users to model multiple mortgage scenarios, understand the true cost of borrowing, and optimize their mortgage strategy.

## Features

### Core Functionality
- **Multi-scenario comparison** - Compare up to 5 different mortgage scenarios side-by-side
- **Accurate daily interest calculation** - Interest calculated daily and applied monthly
- **Overpayment modeling** - Support for regular monthly overpayments and lump sum payments
- **Early Repayment Charge (ERC) calculations** - Automatic ERC calculation with configurable annual allowance
- **Stamp Duty calculator** - Automatic calculation for England/NI with first-time buyer relief, additional property surcharge, and non-resident surcharge
- **Comprehensive initial costs** - Track all purchase costs including solicitor fees, surveys, and moving costs

### Visualizations
- Mortgage balance over time
- Monthly payment timeline
- Interest vs capital repayment breakdown
- Cumulative interest comparison
- Total cost comparison (bar chart)

### Results
- Monthly payment summary table
- Additional details (term reduction, ERCs, etc.)
- Full amortization schedule

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI Components**: Custom Material Design-inspired components

## Project Structure

```
uk_mortgage_calculator/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Main calculator page
│   │   └── globals.css        # Global styles & Tailwind directives
│   ├── components/
│   │   ├── form/
│   │   │   └── InputForm.tsx  # Main input form component
│   │   ├── layout/
│   │   │   ├── Header.tsx     # App header
│   │   │   └── Footer.tsx     # App footer
│   │   ├── results/
│   │   │   ├── ResultsPanel.tsx      # Results container
│   │   │   ├── SummaryTab.tsx        # Summary tables
│   │   │   ├── VisualizationsTab.tsx # Charts
│   │   │   └── ScheduleTab.tsx       # Amortization schedule
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── CheckboxField.tsx
│   │       ├── CollapsibleSection.tsx
│   │       ├── InputField.tsx
│   │       ├── SelectField.tsx
│   │       └── Tabs.tsx
│   ├── engine/
│   │   ├── mortgageCalculator.ts  # Core mortgage calculation logic
│   │   ├── stampDuty.ts           # Stamp duty calculation
│   │   └── utils.ts               # Utility functions
│   └── types/
│       └── index.ts               # TypeScript type definitions
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd uk_mortgage_calculator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## Usage

### Simple Mode
1. Enter property price and deposit
2. Set mortgage term and interest rate
3. Configure fixed rate period and post-fix rate
4. Add optional monthly overpayments
5. Click "Show Results" to see calculations

### Advanced Mode
- Configure product/arrangement fees
- Add fee to mortgage principal
- Set up Early Repayment Charge structure
- Customize annual overpayment allowance

### Initial Costs
- Select buyer type (first-time buyer, additional property, non-resident)
- Auto-calculated stamp duty
- Track solicitor fees, survey costs, and other expenses

### Multi-scenario Comparison
1. Calculate first scenario
2. Click "+ New Scenario" 
3. Modify parameters
4. Compare results side-by-side

## Key Formulas

### Mortgage Payment (Capital Repayment)
```
P = L × [r(1+r)^n] / [(1+r)^n - 1]

Where:
P = Monthly payment
L = Loan amount
r = Monthly interest rate (annual rate / 12)
n = Number of months
```

### Daily Interest Accrual
```
Daily Interest = Balance × (Annual Rate / 365)
Monthly Interest = Sum of daily interest for each day of month
```

## Disclaimer

This calculator provides estimates only. Actual mortgage terms may vary. Always consult a qualified mortgage advisor before making financial decisions.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a pull request.

---

Built with ❤️ for UK homebuyers
