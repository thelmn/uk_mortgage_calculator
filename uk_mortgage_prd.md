# UK Mortgage Calculator - Product Requirements Document (PRD)

## 1. Product Overview

### 1.1 Vision Statement
Create the most comprehensive and accurate UK mortgage calculator that empowers users to make informed decisions about their home purchase by modeling multiple scenarios, understanding the true cost of borrowing, and optimizing their mortgage strategy.

### 1.2 Target Users
- First-time home buyers exploring affordability
- Home movers comparing remortgage options
- Property investors analyzing multiple scenarios
- Financial advisors presenting options to clients

### 1.3 Key Differentiators
1. Multi-scenario comparison in single view
2. Accurate daily interest calculation with monthly application
3. Sophisticated overpayment modeling with ERC calculations
4. Comprehensive initial costs including stamp duty
5. Timeline visualization of mortgage evolution

---

## 2. Core Functional Requirements

### 2.1 Input Form - Simple View (Tab 1)

**Property Details:**
- Property price (£)
- Deposit amount (£) or LTV (%)
  - Auto-calculate the other when one is entered

**Mortgage Details:**
- Mortgage amount (auto-calculated from property price - deposit)
- Mortgage term (years) [Range: 5-40]
- Interest rate (%) [2 decimal places]
- Fixed rate period (years) [Options: 0, 2, 3, 5, 7, 10, or custom]
  - If 0, entire term at entered rate
  - If > 0, show "Rate after fixed period (%)" field
- Monthly payment date [Day of month: 1-28]
- Interest charging date [Day of month: 1-28]

**Optional Overpayments:**
- Regular monthly overpayment (£) [Default: 0]
- One-off overpayments:
  - Date (MM/YYYY)
  - Amount (£)
  - [+ Add another] button

### 2.2 Input Form - Advanced View (Tab 2)

**All fields from Simple View, plus:**

**Mortgage Product Details:**
- Product fee/arrangement fee (£) [Default: 0]
- Add fee to mortgage? [Yes/No toggle]
- Booking fee (£) [Default: 0]
- Early repayment charge structure:
  - ERC applies? [Yes/No]
  - Annual overpayment allowance (% of balance) [Default: 10%]
  - ERC rate structure:
    - Year 1: (%) [Default: 5]
    - Year 2: (%) [Default: 4]
    - Year 3: (%) [Default: 3]
    - Year 4: (%) [Default: 2]
    - Year 5+: (%) [Default: 1]
  - [Use fixed % for all years] toggle

**Interest Calculation Method:**
- Daily calculation, monthly application [Default, locked]
- Show explanation tooltip

**Repayment Type:**
- Capital Repayment [Default]
- Interest Only [Future feature]

**Rate Change Modeling:**
- Expected rate changes post-fix:
  - Date (MM/YYYY)
  - New rate (%)
  - [+ Add change] button

### 2.3 Initial Costs Section (Collapsible)

Located below main form, collapsed by default with indicator "(Estimated: £X,XXX)"

**Stamp Duty Calculator:**
- Country: [England/NI, Scotland, Wales]
- Buyer type: [First-time buyer, Home mover, Additional property]
- UK resident: [Yes/No]
- **Auto-calculate and show breakdown**

**Professional Fees:**
- Solicitor/Conveyancer fees (£) [Default: £1,200]
- Disbursements (£) [Default: £350]
- Survey cost (£) [Default: £600]
  - Dropdown: [None, Basic valuation, Homebuyer Report, Full Building Survey, Custom]
- Mortgage broker fee (£) [Default: £0]

**Other Costs:**
- Mortgage valuation fee (£) [Default: £300]
- Buildings insurance (annual) (£) [Default: £300]
- Moving costs (£) [Default: £800]
- Furniture/renovation budget (£) [Default: £0]

**Summary Display:**
- Total upfront costs (excluding deposit): £X,XXX
- Total costs including deposit: £X,XXX

### 2.4 Scenario Management

**Location:** Bottom of input form, above "Show Results" button

**Initial State:**
- Single scenario, no scenario management visible

**After First Calculation:**
- [+ New Scenario] button appears next to [Show Results]

**Clicking New Scenario:**
1. Current scenario moves into collapsible section: "Scenario 1" (collapsed)
2. New expanded section appears: "Scenario 2" (with same values as Scenario 1)
3. Scenario header shows:
   - Scenario name [Editable inline]
   - Eye icon (hide/show in results)
   - Lock icon (lock/unlock editing)
   - Expand/collapse toggle
   - Delete button (X)

**Behavior:**
- Only one scenario can be expanded at a time
- Expanding one auto-collapses others
- Hidden scenarios (eye icon) don't appear in results
- Locked scenarios cannot be edited (show lock indicator)
- Minimum 1 scenario must remain
- Maximum 5 scenarios recommended for performance

---

## 3. Results & Visualization Section

### 3.1 Summary Tab

**Monthly Payment Summary Table** (Top, always visible)

For each visible scenario (columns):
- Scenario name
- Property price
- Deposit
- Mortgage amount
- Initial monthly payment
- Average monthly payment (over full term)
- Monthly payment after fixed period
- Total amount paid
- Total interest paid
- Time to pay off (if overpayments reduce term)
- Interest saved (vs base scenario)

**Color coding:**
- Lowest values: Green highlight
- Highest values: Red highlight

**Additional Details Table** (Collapsible, below summary)

For each visible scenario:
- Fixed period monthly payment
- Post-fix monthly payment (if different)
- Total capital repaid in fixed period
- Total interest paid in fixed period
- Remaining balance at end of fixed period
- Term reduction due to overpayments (months)
- Interest reduction due to overpayments (£)
- Break-even point for overpayments (if ERCs apply)
- Effective interest rate (APR including all fees)
- Total overpayments made
- ERCs paid (if any)

### 3.2 Visualizations Tab

**Chart 1: Mortgage Balance Over Time**
- X-axis: Months/Years
- Y-axis: Outstanding Balance (£)
- One line per scenario
- Markers at:
  - End of fixed periods
  - Large overpayments
  - Rate changes
- Show shaded region for fixed vs variable periods

**Chart 2: Monthly Payment Timeline**
- X-axis: Months/Years
- Y-axis: Monthly Payment (£)
- Show step changes when rates change
- Highlight overpayment portions

**Chart 3: Interest vs Capital Repayment**
- Stacked area chart
- Show how proportion changes over time
- Ability to toggle scenarios

**Chart 4: Cumulative Interest Paid**
- X-axis: Months/Years
- Y-axis: Cumulative Interest (£)
- Compare scenarios side-by-side
- Show total savings

**Chart 5: Total Cost Comparison** (Bar chart)
- One bar per scenario showing:
  - Initial costs (stamp duty, fees)
  - Total interest paid
  - Total capital (mortgage amount)
- Stacked to show components

**Interactivity:**
- Hover tooltips showing exact values
- Click to hide/show scenarios
- Toggle between different time scales (monthly/yearly)
- Export chart as PNG

### 3.3 Amortization Schedule (Optional Collapsible Section)

**Monthly Breakdown Table:**
- Month/Year
- Opening Balance
- Payment Amount
- Interest Portion
- Capital Portion
- Overpayment (if any)
- ERC Charged (if any)
- Closing Balance

**Features:**
- Searchable/filterable
- Export to CSV
- Show annual summaries (collapsed by default)
- Highlight year-end balances

---

## 4. Calculation Logic Requirements

### 4.1 Interest Calculation

**Daily Accrual, Monthly Application:**
```
Daily Interest Rate = Annual Rate / 365
Daily Interest Amount = Current Balance × Daily Interest Rate
Monthly Interest = Sum of all daily interest for the month
```

**Application on Charging Date:**
- Add total monthly interest to balance
- Then apply any payments received
- Order matters for timing of payment vs charging date

### 4.2 Payment Allocation

**Each Monthly Payment:**
1. Calculate interest due (already added to balance on charging date)
2. Payment first covers interest
3. Remainder reduces principal
4. Track separately: regular payment + overpayment

### 4.3 Overpayment Processing

**Regular Overpayments:**
- Added to each monthly payment
- Count toward annual allowance
- Track cumulative amount per calendar year

**Lump Sum Overpayments:**
- Applied on specific date
- Immediately reduce balance
- Count toward annual allowance
- Check if ERC triggered

**Annual Allowance:**
- Reset on 1 January each year (configurable to reset on anniversary)
- Track: Allowance (%) × Balance at start of period
- If exceeded: Calculate ERC on excess

**ERC Calculation:**
```
Excess = Total Overpayments - Allowance
ERC Rate = Rate for current year of fixed term
ERC Amount = Excess × ERC Rate
```

**Impact Options:**
- Reduce term: Keep monthly payment same, pay off faster
- Reduce payment: Recalculate payment over remaining term
- Build reserve: Track separately for flexibility

### 4.4 Rate Change Handling

**At End of Fixed Period:**
- Switch to specified variable rate
- Recalculate monthly payment based on:
  - Remaining balance
  - New rate
  - Remaining term
- No early repayment charges after fixed period

**Mid-Term Rate Changes:**
- Only if specified in advanced mode
- Recalculate payment immediately
- May trigger ERC if remortgaging

### 4.5 Stamp Duty Calculation

**Tiered Calculation:**
```
Total SDLT = Σ (Amount in Band × Band Rate)
```

**England/NI Example:**
- First £125k: 0%
- Next £125k (£125k-£250k): 2%
- Next £675k (£250k-£925k): 5%
- And so on...

**Apply Surcharges:**
- Additional property: +5% to each band
- Non-resident: +2% to each band

**First-Time Buyer Relief:**
- If property ≤ £500k: 0% up to £300k, 5% on £300k-£500k
- If property > £500k: No relief, standard rates apply

---

## 5. User Interface Requirements

### 5.1 Layout Structure

**Full-Height Design:**
- Header: Fixed, 60px height
  - Logo/Title on left
  - [Help] [Settings] icons on right
- Main content area: Flexible height
  - Left panel: 400px width, scrollable
  - Right panel: Remaining width, scrollable
- Footer: Fixed, 40px height
  - Copyright, version info

### 5.2 Left Panel (Input Form)

**Components:**
- Tab switcher (Simple/Advanced)
- Form fields in logical groups
- Collapsible sections (Initial Costs)
- Scenario management area
- [Show Results] button (primary CTA)
- [+ New Scenario] button (secondary)

**Scrolling:**
- Independent scroll for left panel content
- Fixed header with tabs
- Sticky [Show Results] button at bottom

### 5.3 Right Panel (Results)

**Components:**
- Tab switcher (Summary/Visualizations/Schedule)
- Content area changes per tab
- Collapsible sections within tabs

**Scrolling:**
- Independent scroll for right panel content
- Fixed tab header

### 5.4 Material Design System

**Color Palette:**
- Primary: Blue (#1976D2)
- Secondary: Grey (#757575)
- Success: Green (#388E3C)
- Warning: Amber (#F57C00)
- Error: Red (#D32F2F)
- Background: White (#FFFFFF)
- Surface: Light Grey (#F5F5F5)

**Typography:**
- Font: Roboto
- Headings: 500 weight
- Body: 400 weight
- Input labels: 400 weight, 0.875rem
- Button text: 500 weight, uppercase

**Components:**
- Text fields: Outlined style
- Buttons: Filled (primary), Text (secondary)
- Cards: Elevation 2
- Dividers: 1px, light grey
- Icons: Material Icons

**No Fancy Gradients:**
- Flat colors only
- Use elevation for depth
- Subtle shadows

### 5.5 Responsive Considerations

**Desktop (>1024px):**
- Side-by-side layout as described
- All features visible

**Tablet (768-1024px):**
- Collapsible left panel
- Button to toggle visibility
- Full-width right panel when left collapsed

**Mobile (<768px):**
- Stacked layout
- Input form on top
- Results below
- Sticky "Show Results" button
- Simplified scenario management

---

## 6. Data Validation & Error Handling

### 6.1 Input Validation

**Required Fields:**
- Property price > 0
- Deposit ≥ 5% of property price (can be adjusted)
- Mortgage term: 5-40 years
- Interest rate: 0.1% - 20%
- Payment date & charging date: 1-28

**Conditional Validation:**
- Fixed period ≤ Mortgage term
- Overpayment dates must be in future
- Total overpayments < outstanding balance
- Rate after fixed period required if fixed period > 0

**Real-time Validation:**
- Show error messages inline
- Disable [Show Results] until valid
- Use red text and icons for errors

### 6.2 Calculation Edge Cases

**Handle Gracefully:**
- Overpayments exceeding balance → Cap and warn
- Very large lump sums → Confirm before applying
- Payment date same as charging date → Explain optimal timing
- Zero or negative values → Show validation error
- Extreme interest rates → Warning message

### 6.3 User Feedback

**Loading States:**
- Show spinner when calculating complex scenarios
- "Calculating..." message
- Disable inputs during calculation

**Success States:**
- Green checkmark when results displayed
- "Results updated" message (brief)

**Error States:**
- Red alert box with clear explanation
- Suggest fixes where possible
- Never show raw error messages

---

## 7. Performance Requirements

### 7.1 Calculation Speed
- Single scenario: < 100ms
- Multi-scenario (up to 5): < 500ms
- Visualizations render: < 1 second

### 7.2 Responsiveness
- UI updates: < 100ms after input change
- Debounce rapid inputs (300ms)
- Lazy-load visualizations if needed

---

## 8. Future Enhancements (Out of Scope for V1)

### 8.1 Phase 2 Features
- Interest-only mortgage support
- Part-and-part mortgages
- Offset mortgages
- Shared ownership
- Help to Buy schemes

### 8.2 Phase 3 Features
- User accounts & saved scenarios
- Historical rate data & predictions
- Inflation adjustment
- Rental yield calculations (for BTL)
- Remortgage optimizer (timing & break-even analysis)

### 8.3 Integration Opportunities
- Live rate feeds from lenders
- Property valuation APIs
- Comparison with actual products
- Direct application to brokers

---

## 9. Technical Specifications

### 9.1 Calculation Precision
- Currency: Round to nearest penny (2 decimals)
- Percentages: Store as decimals, display as %
- Days: Exact day count (accounting for leap years)
- Interest: Calculate to 6 decimal places internally, round for display

### 9.2 Date Handling
- UK date format: DD/MM/YYYY
- Month/Year for periodic inputs
- Handle leap years correctly
- Consider Bank Holidays (optional)

### 9.3 Data Storage
- Client-side only (privacy)
- LocalStorage for autosave (optional)
- No server-side storage in V1
- Export feature for data portability

---

## 10. Success Metrics

### 10.1 User Engagement
- Time spent on calculator: Target >5 minutes
- Number of scenarios created: Target 2-3
- Completion rate: Target >70%

### 10.2 Calculation Accuracy
- Validated against lender calculators
- Error rate: <0.01% variance
- Edge case coverage: 100%

### 10.3 User Satisfaction
- Ease of use rating: Target >4.5/5
- Accuracy perception: Target >4.7/5
- Likelihood to recommend: Target >80%

---

## 11. Compliance & Legal

### 11.1 Disclaimers
- **Required:** "This calculator provides estimates only"
- **Required:** "Actual mortgage terms may vary"
- **Required:** "Consult a qualified mortgage advisor"
- **Required:** Statement that rates/calculations reflect Dec 2025 rules

### 11.2 Data Protection
- No personal data collected
- No tracking beyond basic analytics
- Clear privacy policy
- GDPR compliant (if applicable)

---

## 12. Development Priorities

### 12.1 MVP (Minimum Viable Product)
**Must Have:**
1. Simple view form with all essential fields
2. Accurate interest calculation engine
3. Single scenario calculation
4. Basic summary table
5. Mortgage balance chart
6. Stamp duty calculator
7. Initial costs section

### 12.2 V1.0 (Full Launch)
**Add:**
1. Advanced view with all features
2. Multi-scenario comparison (up to 5)
3. All visualization charts
4. Scenario management (hide/lock/delete)
5. ERC calculation
6. Overpayment optimization
7. Export functionality

### 12.3 V1.1 (Polish)
**Add:**
1. Responsive mobile layout
2. Print-friendly reports
3. Save/load scenarios
4. Enhanced tooltips & help
5. Keyboard shortcuts
6. Performance optimizations

---

## Appendix A: Key Formulas

### A.1 Mortgage Payment Formula (Capital Repayment)

```
P = L × [r(1+r)^n] / [(1+r)^n - 1]

Where:
P = Monthly payment
L = Loan amount
r = Monthly interest rate (annual rate / 12)
n = Number of months
```

### A.2 Daily Interest Accrual

```
Daily Interest = Balance × (Annual Rate / 365)
Monthly Interest = Σ(Daily Interest for each day of month)
```

### A.3 Overpayment Impact on Term

```
New Term = -ln(1 - (Remaining Balance × r) / (Payment + Overpayment)) / ln(1 + r)

Where:
r = Monthly interest rate
```

---

## Document Control

**Version:** 1.0  
**Date:** December 2025  
**Status:** Draft for Review  
**Author:** Product Team  
**Approvers:** TBD