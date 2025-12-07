'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ScenarioResult, CHART_COLORS } from '@/types';

// Helper to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Helper to format number
function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

// Generate SVG line chart
function generateLineChartSvg(
  title: string,
  results: ScenarioResult[],
  getValue: (entry: ScenarioResult['schedule'][0]) => number,
  yAxisLabel: string,
  width = 700,
  height = 300
): string {
  const padding = { top: 40, right: 120, bottom: 40, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Find data ranges
  const maxMonth = Math.max(...results.map(r => r.schedule.length));
  let maxValue = 0;
  results.forEach(r => {
    r.schedule.forEach(s => {
      const v = getValue(s);
      if (v > maxValue) maxValue = v;
    });
  });
  
  // Add some padding to max value
  maxValue = maxValue * 1.1;
  
  // Generate paths for each scenario
  const paths = results.map((result, idx) => {
    const points = result.schedule.map(entry => {
      const x = padding.left + (entry.month / maxMonth) * chartWidth;
      const y = padding.top + chartHeight - (getValue(entry) / maxValue) * chartHeight;
      return `${x},${y}`;
    });
    
    return `
      <polyline 
        points="${points.join(' ')}" 
        fill="none" 
        stroke="${CHART_COLORS[idx % CHART_COLORS.length]}" 
        stroke-width="2"
      />
    `;
  }).join('');
  
  // Generate legend
  const legend = results.map((result, idx) => `
    <g transform="translate(${padding.left + chartWidth + 10}, ${padding.top + idx * 20})">
      <line x1="0" y1="0" x2="20" y2="0" stroke="${CHART_COLORS[idx % CHART_COLORS.length]}" stroke-width="2"/>
      <text x="25" y="4" font-size="10" fill="#333">${result.scenario.name}</text>
    </g>
  `).join('');
  
  // Generate Y axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const value = maxValue * pct;
    const y = padding.top + chartHeight - (pct * chartHeight);
    return `
      <text x="${padding.left - 10}" y="${y + 4}" font-size="9" fill="#666" text-anchor="end">
        £${(value / 1000).toFixed(0)}k
      </text>
      <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" stroke="#e0e0e0" stroke-dasharray="3 3"/>
    `;
  }).join('');
  
  // Generate X axis labels (every 5 years)
  const xLabels = [];
  for (let year = 0; year <= Math.ceil(maxMonth / 12); year += 5) {
    const month = year * 12;
    const x = padding.left + (month / maxMonth) * chartWidth;
    xLabels.push(`
      <text x="${x}" y="${padding.top + chartHeight + 20}" font-size="9" fill="#666" text-anchor="middle">
        ${year}y
      </text>
    `);
  }
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width / 2}" y="20" font-size="14" font-weight="500" fill="#333" text-anchor="middle">${title}</text>
      
      <!-- Y Axis -->
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#ccc"/>
      ${yLabels}
      
      <!-- X Axis -->
      <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}" stroke="#ccc"/>
      ${xLabels.join('')}
      
      <!-- Data -->
      ${paths}
      
      <!-- Legend -->
      ${legend}
    </svg>
  `;
}

// Generate SVG bar chart for total costs
function generateBarChartSvg(
  title: string,
  results: ScenarioResult[],
  width = 700,
  height = 300
): string {
  const padding = { top: 40, right: 120, bottom: 60, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Calculate max value
  const maxValue = Math.max(...results.map(r => r.initialCosts + r.totalInterest + r.principal)) * 1.1;
  
  const barWidth = Math.min(60, chartWidth / results.length - 20);
  const barGap = (chartWidth - barWidth * results.length) / (results.length + 1);
  
  const bars = results.map((result, idx) => {
    const x = padding.left + barGap + idx * (barWidth + barGap);
    const initialHeight = (result.initialCosts / maxValue) * chartHeight;
    const interestHeight = (result.totalInterest / maxValue) * chartHeight;
    const capitalHeight = (result.principal / maxValue) * chartHeight;
    
    const capitalY = padding.top + chartHeight - capitalHeight;
    const interestY = capitalY - interestHeight;
    const initialY = interestY - initialHeight;
    
    return `
      <g>
        <rect x="${x}" y="${initialY}" width="${barWidth}" height="${initialHeight}" fill="#757575"/>
        <rect x="${x}" y="${interestY}" width="${barWidth}" height="${interestHeight}" fill="#D32F2F"/>
        <rect x="${x}" y="${capitalY}" width="${barWidth}" height="${capitalHeight}" fill="#1976D2"/>
        <text x="${x + barWidth / 2}" y="${padding.top + chartHeight + 15}" font-size="9" fill="#333" text-anchor="middle">
          ${result.scenario.name}
        </text>
      </g>
    `;
  }).join('');
  
  // Y axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const value = maxValue * pct;
    const y = padding.top + chartHeight - (pct * chartHeight);
    return `
      <text x="${padding.left - 10}" y="${y + 4}" font-size="9" fill="#666" text-anchor="end">
        £${(value / 1000).toFixed(0)}k
      </text>
      <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" stroke="#e0e0e0" stroke-dasharray="3 3"/>
    `;
  }).join('');
  
  // Legend
  const legendItems = [
    { color: '#757575', label: 'Initial Costs' },
    { color: '#D32F2F', label: 'Interest' },
    { color: '#1976D2', label: 'Capital' },
  ];
  
  const legend = legendItems.map((item, idx) => `
    <g transform="translate(${padding.left + chartWidth + 10}, ${padding.top + idx * 20})">
      <rect x="0" y="-6" width="15" height="12" fill="${item.color}"/>
      <text x="20" y="4" font-size="10" fill="#333">${item.label}</text>
    </g>
  `).join('');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width / 2}" y="20" font-size="14" font-weight="500" fill="#333" text-anchor="middle">${title}</text>
      
      <!-- Y Axis -->
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#ccc"/>
      ${yLabels}
      
      <!-- X Axis -->
      <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}" stroke="#ccc"/>
      
      <!-- Bars -->
      ${bars}
      
      <!-- Legend -->
      ${legend}
    </svg>
  `;
}

// Generate visualizations HTML with SVG charts
function generateVisualizationsHtml(results: ScenarioResult[]): string {
  const balanceChart = generateLineChartSvg(
    'Mortgage Balance Over Time',
    results,
    (entry) => entry.closingBalance,
    'Balance'
  );
  
  const paymentChart = generateLineChartSvg(
    'Monthly Payment Timeline',
    results,
    (entry) => entry.payment,
    'Payment'
  );
  
  // Cumulative interest chart
  const cumulativeData = results.map(result => {
    let cumulative = 0;
    return result.schedule.map(entry => {
      cumulative += entry.interest;
      return { ...entry, cumulative };
    });
  });
  
  const cumulativeChart = generateLineChartSvg(
    'Cumulative Interest Paid',
    results.map((r, i) => ({
      ...r,
      schedule: cumulativeData[i].map(d => ({ ...d, closingBalance: d.cumulative }))
    })),
    (entry) => entry.closingBalance,
    'Interest'
  );
  
  const costComparisonChart = generateBarChartSvg(
    'Total Cost Comparison',
    results
  );
  
  return `
    <div style="background: white; padding: 20px;">
      <h2 style="color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px; margin-bottom: 20px;">
        Visualizations
      </h2>
      <div style="margin-bottom: 30px;">${balanceChart}</div>
      <div style="margin-bottom: 30px;">${paymentChart}</div>
      <div style="margin-bottom: 30px;">${cumulativeChart}</div>
      <div style="margin-bottom: 30px;">${costComparisonChart}</div>
    </div>
  `;
}

// Generate HTML content for PDF
function generatePdfHtml(results: ScenarioResult[]): string {
  const scenarioNames = results.map(r => r.scenario.name);
  
  // Build scenario inputs section
  let inputsHtml = `
    <h2 style="color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px; margin-top: 30px;">Scenario Inputs</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1976D2; color: white;">
          <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Category</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Input</th>
          ${scenarioNames.map(name => `<th style="padding: 8px; text-align: right; border: 1px solid #ddd;">${name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  const inputRows = [
    { category: 'Property', field: 'Property Price', values: results.map(r => formatCurrency(r.scenario.propertyPrice)) },
    { category: 'Property', field: 'Deposit', values: results.map(r => formatCurrency(r.scenario.deposit)) },
    { category: 'Mortgage', field: 'Mortgage Term', values: results.map(r => `${r.scenario.mortgageTerm} years`) },
    { category: 'Mortgage', field: 'Interest Rate', values: results.map(r => `${r.scenario.interestRate}%`) },
    { category: 'Mortgage', field: 'Fixed Period', values: results.map(r => `${r.scenario.fixedPeriod} years`) },
    { category: 'Mortgage', field: 'Post-Fix Rate', values: results.map(r => `${r.scenario.postFixRate}%`) },
    { category: 'Overpayments', field: 'Monthly Overpayment', values: results.map(r => formatCurrency(r.scenario.monthlyOverpayment)) },
    { category: 'Overpayments', field: 'Lump Sum Overpayments', values: results.map(r => 
      r.scenario.lumpSumOverpayments.length > 0 
        ? r.scenario.lumpSumOverpayments.map(l => `${l.date}: ${formatCurrency(l.amount)}`).join(', ')
        : 'None'
    )},
    { category: 'Fees', field: 'Product Fee', values: results.map(r => formatCurrency(r.scenario.productFee)) },
    { category: 'Fees', field: 'Booking Fee', values: results.map(r => formatCurrency(r.scenario.bookingFee)) },
  ];
  
  inputRows.forEach((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
    inputsHtml += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 6px 8px; border: 1px solid #ddd;">${row.category}</td>
        <td style="padding: 6px 8px; border: 1px solid #ddd;">${row.field}</td>
        ${row.values.map(v => `<td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${v}</td>`).join('')}
      </tr>
    `;
  });
  
  inputsHtml += '</tbody></table>';
  
  // Build summary tables
  let summaryHtml = `
    <h2 style="color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px; margin-top: 30px;">Monthly Payment Summary</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1976D2; color: white;">
          <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Metric</th>
          ${scenarioNames.map(name => `<th style="padding: 8px; text-align: right; border: 1px solid #ddd;">${name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  const summaryRows = [
    { metric: 'Mortgage Amount', values: results.map(r => formatCurrency(r.principal)) },
    { metric: 'Initial Monthly Payment', values: results.map(r => formatCurrency(r.initialPayment)) },
    { metric: 'Average Monthly Payment', values: results.map(r => formatCurrency(r.averagePayment)) },
    { metric: 'Post-Fix Payment', values: results.map(r => formatCurrency(r.postFixPayment)) },
    { metric: 'Total Amount Paid', values: results.map(r => formatCurrency(r.totalPaid)) },
    { metric: 'Total Interest Paid', values: results.map(r => formatCurrency(r.totalInterest)), highlight: 'max' },
    { metric: 'Time to Pay Off', values: results.map(r => `${formatNumber(r.actualTerm, 1)} years`), highlight: 'min' },
    { metric: 'Interest Saved (vs base)', values: results.map((r, i) => i === 0 ? '—' : formatCurrency(results[0].totalInterest - r.totalInterest)) },
  ];
  
  summaryRows.forEach((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
    summaryHtml += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: 500;">${row.metric}</td>
        ${row.values.map(v => `<td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${v}</td>`).join('')}
      </tr>
    `;
  });
  
  summaryHtml += '</tbody></table>';
  
  // Additional details table
  summaryHtml += `
    <h2 style="color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px; margin-top: 30px;">Additional Details</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1976D2; color: white;">
          <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Detail</th>
          ${scenarioNames.map(name => `<th style="padding: 8px; text-align: right; border: 1px solid #ddd;">${name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  const detailRows = [
    { metric: 'Balance After Fixed Period', values: results.map(r => formatCurrency(r.balanceAfterFix)) },
    { metric: 'Term Reduction', values: results.map(r => `${Math.round(r.termReduction * 12)} months`) },
    { metric: 'Total Overpayments', values: results.map(r => formatCurrency(r.totalOverpayments)) },
    { metric: 'ERCs Paid', values: results.map(r => formatCurrency(r.totalERCs)) },
    { metric: 'Stamp Duty', values: results.map(r => formatCurrency(r.stampDuty)) },
    { metric: 'Initial Costs (excl. deposit)', values: results.map(r => formatCurrency(r.initialCosts)) },
    { metric: 'Total Costs (incl. initial)', values: results.map(r => formatCurrency(r.totalPaid + r.initialCosts)) },
  ];
  
  detailRows.forEach((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
    summaryHtml += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: 500;">${row.metric}</td>
        ${row.values.map(v => `<td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${v}</td>`).join('')}
      </tr>
    `;
  });
  
  summaryHtml += '</tbody></table>';

  // Initial Costs table
  summaryHtml += `
    <h2 style="color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px; margin-top: 30px;">Initial Costs</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1976D2; color: white;">
          <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Cost Item</th>
          ${scenarioNames.map(name => `<th style="padding: 8px; text-align: right; border: 1px solid #ddd;">${name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  const initialCostRows = [
    { metric: 'Stamp Duty', values: results.map(r => formatCurrency(r.stampDuty)) },
    { metric: 'Solicitor Fees', values: results.map(r => formatCurrency(r.scenario.solicitorFees)) },
    { metric: 'Disbursements', values: results.map(r => formatCurrency(r.scenario.disbursements)) },
    { metric: 'Survey Cost', values: results.map(r => formatCurrency(r.scenario.surveyCost)) },
    { metric: 'Broker Fee', values: results.map(r => formatCurrency(r.scenario.brokerFee)) },
    { metric: 'Valuation Fee', values: results.map(r => formatCurrency(r.scenario.valuationFee)) },
    { metric: 'Buildings Insurance (Annual)', values: results.map(r => formatCurrency(r.scenario.buildingsInsurance)) },
    { metric: 'Moving Costs', values: results.map(r => formatCurrency(r.scenario.movingCosts)) },
    { metric: 'Furniture/Renovation Budget', values: results.map(r => formatCurrency(r.scenario.furnitureRenovation)) },
    { metric: 'Product Fee (upfront)', values: results.map(r => r.scenario.addFeeToMortgage ? '—' : formatCurrency(r.scenario.productFee)) },
    { metric: 'Booking Fee', values: results.map(r => formatCurrency(r.scenario.bookingFee)) },
    { metric: 'Total Initial Costs', values: results.map(r => formatCurrency(r.initialCosts)) },
  ];
  
  initialCostRows.forEach((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
    const fontWeight = row.metric === 'Total Initial Costs' ? 'bold' : '500';
    summaryHtml += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: ${fontWeight};">${row.metric}</td>
        ${row.values.map(v => `<td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd; font-weight: ${fontWeight};">${v}</td>`).join('')}
      </tr>
    `;
  });
  
  summaryHtml += '</tbody></table>';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          background: white;
        }
        h1 {
          color: #1976D2;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #666;
          font-size: 12px;
          margin-bottom: 20px;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <h1>UK Mortgage Calculator Report</h1>
      <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
      
      ${inputsHtml}
      ${summaryHtml}
      
      <div id="charts-placeholder"></div>
      
    </body>
    </html>
  `;
}

// Generate amortization table HTML
function generateAmortizationHtml(results: ScenarioResult[], maxRows = 60): string {
  const scenarioNames = results.map(r => r.scenario.name);
  const maxLength = Math.min(Math.max(...results.map(r => r.schedule.length)), maxRows);
  
  let html = `
    <h2 style="color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px; margin-top: 30px;">
      Amortization Schedule (First ${maxRows} Months)
    </h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 8px; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1976D2; color: white;">
          <th style="padding: 4px; text-align: center; border: 1px solid #ddd;">Month</th>
          <th style="padding: 4px; text-align: center; border: 1px solid #ddd;">Date</th>
          ${results.map((r, i) => `
            <th colspan="4" style="padding: 4px; text-align: center; border: 1px solid #ddd; background-color: ${CHART_COLORS[i]};">
              ${r.scenario.name}
            </th>
          `).join('')}
        </tr>
        <tr style="background-color: #e3f2fd;">
          <th style="padding: 4px; border: 1px solid #ddd;"></th>
          <th style="padding: 4px; border: 1px solid #ddd;"></th>
          ${results.map(() => `
            <th style="padding: 4px; text-align: right; border: 1px solid #ddd; font-size: 7px;">Payment</th>
            <th style="padding: 4px; text-align: right; border: 1px solid #ddd; font-size: 7px;">Interest</th>
            <th style="padding: 4px; text-align: right; border: 1px solid #ddd; font-size: 7px;">Principal</th>
            <th style="padding: 4px; text-align: right; border: 1px solid #ddd; font-size: 7px;">Balance</th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  for (let i = 0; i < maxLength; i++) {
    const bgColor = i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    const firstEntry = results[0].schedule[i];
    
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 3px; text-align: center; border: 1px solid #ddd;">${i + 1}</td>
        <td style="padding: 3px; text-align: center; border: 1px solid #ddd;">${firstEntry?.monthName || ''}</td>
        ${results.map(r => {
          const entry = r.schedule[i];
          if (!entry) {
            return `
              <td style="padding: 3px; text-align: right; border: 1px solid #ddd; color: #999;">—</td>
              <td style="padding: 3px; text-align: right; border: 1px solid #ddd; color: #999;">—</td>
              <td style="padding: 3px; text-align: right; border: 1px solid #ddd; color: #999;">—</td>
              <td style="padding: 3px; text-align: right; border: 1px solid #ddd; color: #999;">—</td>
            `;
          }
          return `
            <td style="padding: 3px; text-align: right; border: 1px solid #ddd;">£${entry.payment.toFixed(0)}</td>
            <td style="padding: 3px; text-align: right; border: 1px solid #ddd;">£${entry.interest.toFixed(0)}</td>
            <td style="padding: 3px; text-align: right; border: 1px solid #ddd;">£${entry.principal.toFixed(0)}</td>
            <td style="padding: 3px; text-align: right; border: 1px solid #ddd;">£${entry.closingBalance.toFixed(0)}</td>
          `;
        }).join('')}
      </tr>
    `;
  }
  
  html += '</tbody></table>';
  
  if (Math.max(...results.map(r => r.schedule.length)) > maxRows) {
    html += `<p style="font-size: 10px; color: #666; font-style: italic;">
      Note: Full schedule truncated. See Excel export for complete data.
    </p>`;
  }
  
  return html;
}

export async function exportToPdf(
  results: ScenarioResult[]
): Promise<void> {
  // Create PDF document (A4 size)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  // Generate HTML content
  const htmlContent = generatePdfHtml(results);
  
  // Create a temporary container to render HTML
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.background = 'white';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  
  try {
    // Capture the main content
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add main content - may span multiple pages
    let yPosition = margin;
    let remainingHeight = imgHeight;
    let sourceY = 0;
    
    while (remainingHeight > 0) {
      const availableHeight = pageHeight - (yPosition === margin ? margin : 10) - margin;
      const heightToDraw = Math.min(remainingHeight, availableHeight);
      const sourceHeight = (heightToDraw / imgHeight) * canvas.height;
      
      // Create a cropped version of the image
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = canvas.width;
      croppedCanvas.height = sourceHeight;
      const ctx = croppedCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );
        
        const croppedImgData = croppedCanvas.toDataURL('image/png');
        pdf.addImage(croppedImgData, 'PNG', margin, yPosition, imgWidth, heightToDraw);
      }
      
      remainingHeight -= heightToDraw;
      sourceY += sourceHeight;
      
      if (remainingHeight > 0) {
        pdf.addPage();
        yPosition = margin;
      }
    }
    
    // Generate visualizations from data (SVG-based charts)
    pdf.addPage();
    
    const vizContainer = document.createElement('div');
    vizContainer.style.position = 'absolute';
    vizContainer.style.left = '-9999px';
    vizContainer.style.width = '800px';
    vizContainer.style.background = 'white';
    vizContainer.innerHTML = generateVisualizationsHtml(results);
    document.body.appendChild(vizContainer);
    
    const vizCanvas = await html2canvas(vizContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    const vizImgData = vizCanvas.toDataURL('image/png');
    const vizWidth = contentWidth;
    const vizHeight = (vizCanvas.height * vizWidth) / vizCanvas.width;
    
    // May need multiple pages for visualizations
    let vizYPosition = margin;
    let vizRemainingHeight = vizHeight;
    let vizSourceY = 0;
    
    while (vizRemainingHeight > 0) {
      const availableHeight = pageHeight - margin - margin;
      const heightToDraw = Math.min(vizRemainingHeight, availableHeight);
      const sourceHeight = (heightToDraw / vizHeight) * vizCanvas.height;
      
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = vizCanvas.width;
      croppedCanvas.height = sourceHeight;
      const ctx = croppedCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(
          vizCanvas,
          0, vizSourceY, vizCanvas.width, sourceHeight,
          0, 0, vizCanvas.width, sourceHeight
        );
        
        const croppedImgData = croppedCanvas.toDataURL('image/png');
        pdf.addImage(croppedImgData, 'PNG', margin, vizYPosition, vizWidth, heightToDraw);
      }
      
      vizRemainingHeight -= heightToDraw;
      vizSourceY += sourceHeight;
      
      if (vizRemainingHeight > 0) {
        pdf.addPage();
        vizYPosition = margin;
      }
    }
    
    document.body.removeChild(vizContainer);
    
    // Add amortization schedule on new page
    pdf.addPage();
    
    const amortContainer = document.createElement('div');
    amortContainer.style.position = 'absolute';
    amortContainer.style.left = '-9999px';
    amortContainer.style.width = '1200px';
    amortContainer.style.background = 'white';
    amortContainer.style.padding = '20px';
    amortContainer.innerHTML = generateAmortizationHtml(results, 60);
    document.body.appendChild(amortContainer);
    
    const amortCanvas = await html2canvas(amortContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    const amortImgData = amortCanvas.toDataURL('image/png');
    const amortWidth = contentWidth;
    const amortHeight = (amortCanvas.height * amortWidth) / amortCanvas.width;
    
    // May need multiple pages for the schedule
    let amortYPosition = margin;
    let amortRemainingHeight = amortHeight;
    let amortSourceY = 0;
    
    while (amortRemainingHeight > 0) {
      const availableHeight = pageHeight - margin - margin;
      const heightToDraw = Math.min(amortRemainingHeight, availableHeight);
      const sourceHeight = (heightToDraw / amortHeight) * amortCanvas.height;
      
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = amortCanvas.width;
      croppedCanvas.height = sourceHeight;
      const ctx = croppedCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(
          amortCanvas,
          0, amortSourceY, amortCanvas.width, sourceHeight,
          0, 0, amortCanvas.width, sourceHeight
        );
        
        const croppedImgData = croppedCanvas.toDataURL('image/png');
        pdf.addImage(croppedImgData, 'PNG', margin, amortYPosition, amortWidth, heightToDraw);
      }
      
      amortRemainingHeight -= heightToDraw;
      amortSourceY += sourceHeight;
      
      if (amortRemainingHeight > 0) {
        pdf.addPage();
        amortYPosition = margin;
      }
    }
    
    document.body.removeChild(amortContainer);
    
    // Save the PDF
    pdf.save(`mortgage_comparison_${new Date().toISOString().split('T')[0]}.pdf`);
    
  } finally {
    document.body.removeChild(container);
  }
}
