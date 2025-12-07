'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { ScenarioResult, CHART_COLORS } from '@/types';
import { formatCurrency, formatNumber } from '@/engine';

interface VisualizationsTabProps {
  results: ScenarioResult[];
}

// Generic custom tooltip that handles missing data correctly
interface MultiScenarioTooltipProps extends TooltipProps<number, string> {
  results: ScenarioResult[];
  valueKey: string;
  formatValue?: (value: number) => string;
}

const MultiScenarioTooltip: React.FC<MultiScenarioTooltipProps> = ({ 
  active, 
  label, 
  results, 
  valueKey,
  formatValue = formatCurrency,
}) => {
  if (!active || label === undefined) return null;
  
  const month = Number(label);
  
  // Filter to only scenarios that have data at this month
  const scenariosWithData = results
    .map((result, i) => {
      const entry = result.schedule.find(s => s.month === month);
      if (!entry) return null;
      const value = entry[valueKey as keyof typeof entry] as number;
      return { result, index: i, value };
    })
    .filter((item): item is { result: ScenarioResult; index: number; value: number } => item !== null);

  if (scenariosWithData.length === 0) return null;
  
  return (
    <div className="bg-white border border-gray-300 rounded shadow-lg p-3 text-sm">
      <div className="font-medium mb-2">Month {month} ({(month/12).toFixed(1)}y)</div>
      {scenariosWithData.map(({ result, index, value }) => (
        <div key={index} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
          />
          <span>{result.scenario.name}: {formatValue(value)}</span>
        </div>
      ))}
    </div>
  );
};

// Custom tooltip for Interest vs Capital chart
interface InterestCapitalTooltipProps extends TooltipProps<number, string> {
  results: ScenarioResult[];
}

const InterestCapitalTooltip: React.FC<InterestCapitalTooltipProps> = ({ active, label, results }) => {
  if (!active || label === undefined) return null;
  
  const month = Number(label);
  
  // Filter to only scenarios that have data at this month
  const scenariosWithData = results
    .map((result, i) => {
      const entry = result.schedule.find(s => s.month === month);
      if (!entry) return null;
      return { result, index: i, entry };
    })
    .filter((item): item is { result: ScenarioResult; index: number; entry: NonNullable<typeof item>['entry'] } => item !== null && item.entry !== undefined);

  if (scenariosWithData.length === 0) return null;
  
  return (
    <div className="bg-white border border-gray-300 rounded shadow-lg p-3 text-sm">
      <div className="font-medium mb-2">Month {month}:</div>
      {scenariosWithData.map(({ result, index, entry }) => {
        const total = entry.interest + entry.principal;
        const interestPct = total > 0 ? (entry.interest / total) * 100 : 0;
        const capitalPct = total > 0 ? (entry.principal / total) * 100 : 0;
        
        return (
          <div key={index} className="mb-2 last:mb-0">
            <div className="font-medium" style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}>
              {result.scenario.name}:
            </div>
            <div className="pl-2">
              <div>Interest: {formatCurrency(entry.interest)} ({formatNumber(interestPct, 1)}%)</div>
              <div>Capital: {formatCurrency(entry.principal)} ({formatNumber(capitalPct, 1)}%)</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Custom tooltip for cumulative interest
interface CumulativeTooltipProps extends TooltipProps<number, string> {
  results: ScenarioResult[];
  cumulativeDataByScenario: Map<number, number[]>;
}

const CumulativeTooltip: React.FC<CumulativeTooltipProps> = ({ 
  active, 
  label, 
  results,
  cumulativeDataByScenario 
}) => {
  if (!active || label === undefined) return null;
  
  const month = Number(label);
  const cumulatives = cumulativeDataByScenario.get(month);
  
  // Filter to only scenarios that have data at this month
  const scenariosWithData = results
    .map((result, i) => {
      const entry = result.schedule.find(s => s.month === month);
      if (!entry) return null;
      const cumValue = cumulatives?.[i] ?? 0;
      return { result, index: i, cumValue };
    })
    .filter((item): item is { result: ScenarioResult; index: number; cumValue: number } => item !== null);

  if (scenariosWithData.length === 0) return null;
  
  return (
    <div className="bg-white border border-gray-300 rounded shadow-lg p-3 text-sm">
      <div className="font-medium mb-2">Month {month} ({(month/12).toFixed(1)}y)</div>
      {scenariosWithData.map(({ result, index, cumValue }) => (
        <div key={index} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
          />
          <span>{result.scenario.name}: {formatCurrency(cumValue)}</span>
        </div>
      ))}
    </div>
  );
};

export const VisualizationsTab: React.FC<VisualizationsTabProps> = ({ results }) => {
  const maxScheduleLength = Math.max(...results.map(r => r.schedule.length));
  
  // Prepare unified data for Balance Over Time chart
  const balanceData = useMemo(() => {
    if (results.length === 0) return [];
    
    const allMonths = new Set<number>();
    results.forEach(r => r.schedule.forEach(s => allMonths.add(s.month)));
    
    return Array.from(allMonths).sort((a, b) => a - b).map(month => {
      const dataPoint: Record<string, number | undefined> = { month };
      results.forEach((result, i) => {
        const entry = result.schedule.find(s => s.month === month);
        dataPoint[`balance_${i}`] = entry?.closingBalance;
      });
      return dataPoint;
    });
  }, [results]);

  // Prepare unified data for Payment Timeline chart
  const paymentData = useMemo(() => {
    if (results.length === 0) return [];
    
    const allMonths = new Set<number>();
    results.forEach(r => r.schedule.forEach(s => allMonths.add(s.month)));
    
    return Array.from(allMonths).sort((a, b) => a - b).map(month => {
      const dataPoint: Record<string, number | undefined> = { month };
      results.forEach((result, i) => {
        const entry = result.schedule.find(s => s.month === month);
        dataPoint[`payment_${i}`] = entry?.payment;
      });
      return dataPoint;
    });
  }, [results]);

  // Prepare unified data for Cumulative Interest chart
  const { cumulativeData, cumulativeDataByScenario } = useMemo(() => {
    if (results.length === 0) return { cumulativeData: [], cumulativeDataByScenario: new Map<number, number[]>() };
    
    const allMonths = new Set<number>();
    results.forEach(r => r.schedule.forEach(s => allMonths.add(s.month)));
    const sortedMonths = Array.from(allMonths).sort((a, b) => a - b);
    
    // Pre-calculate cumulative interest for each scenario
    const cumulativeByScenario: number[][] = results.map(result => {
      let cumulative = 0;
      const cumArray: number[] = [];
      const scheduleMap = new Map(result.schedule.map(s => [s.month, s]));
      
      for (const month of sortedMonths) {
        const entry = scheduleMap.get(month);
        if (entry) {
          cumulative += entry.interest;
        }
        cumArray.push(cumulative);
      }
      return cumArray;
    });
    
    // Build lookup map for tooltip
    const dataByScenario = new Map<number, number[]>();
    sortedMonths.forEach((month, idx) => {
      dataByScenario.set(month, cumulativeByScenario.map(arr => arr[idx]));
    });
    
    const data = sortedMonths.map((month, idx) => {
      const dataPoint: Record<string, number | undefined> = { month };
      results.forEach((result, i) => {
        const entry = result.schedule.find(s => s.month === month);
        // Only set value if this scenario still has data at this month
        dataPoint[`cumulative_${i}`] = entry ? cumulativeByScenario[i][idx] : undefined;
      });
      return dataPoint;
    });
    
    return { cumulativeData: data, cumulativeDataByScenario: dataByScenario };
  }, [results]);
  
  // Prepare combined data for Interest vs Capital chart (all scenarios)
  const interestCapitalData = useMemo(() => {
    if (results.length === 0) return [];
    
    // Get all unique months across all scenarios, sampled every 3rd month
    const maxMonths = Math.max(...results.map(r => r.schedule.length));
    const months: number[] = [];
    for (let i = 0; i < maxMonths; i += 3) {
      months.push(i + 1);
    }
    
    // Build combined data with each scenario's interest and principal
    return months.map(month => {
      const dataPoint: Record<string, number | undefined> = { month };
      results.forEach((result, i) => {
        const entry = result.schedule.find(s => s.month === month);
        if (entry) {
          dataPoint[`interest_${i}`] = entry.interest;
          dataPoint[`principal_${i}`] = entry.principal;
        }
      });
      return dataPoint;
    });
  }, [results]);

  return (
    <>
      {/* Balance Over Time Chart */}
      <div className="bg-white rounded shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Mortgage Balance Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={balanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              type="number"
              domain={[0, maxScheduleLength]}
              tickFormatter={(m) => `${Math.floor(m/12)}y`}
            />
            <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} />
            <Tooltip 
              content={
                <MultiScenarioTooltip 
                  results={results} 
                  valueKey="closingBalance"
                />
              }
            />
            <Legend />
            {results.map((result, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`balance_${i}`}
                name={result.scenario.name}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Payment Timeline */}
      <div className="bg-white rounded shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Monthly Payment Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={paymentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              type="number"
              domain={[0, maxScheduleLength]}
              tickFormatter={(m) => `${Math.floor(m/12)}y`}
            />
            <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(1)}k`} />
            <Tooltip 
              content={
                <MultiScenarioTooltip 
                  results={results} 
                  valueKey="payment"
                />
              }
            />
            <Legend />
            {results.map((result, i) => (
              <Line
                key={i}
                type="stepAfter"
                dataKey={`payment_${i}`}
                name={result.scenario.name}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interest vs Capital - Multi-scenario */}
      <div className="bg-white rounded shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Interest vs Capital Repayment</h2>
        {results.length > 0 && (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={interestCapitalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(m) => `${Math.floor(m/12)}y`}
              />
              <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<InterestCapitalTooltip results={results} />} />
              <Legend />
              {results.map((result, i) => {
                const color = CHART_COLORS[i % CHART_COLORS.length];
                // Create a lighter version of the color for fills
                const fillOpacity = 0.3;
                return (
                  <React.Fragment key={i}>
                    <Area 
                      type="monotone" 
                      dataKey={`interest_${i}`} 
                      stackId={`stack_${i}`}
                      stroke={color}
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      fill={color}
                      fillOpacity={fillOpacity}
                      name={`${result.scenario.name} - Interest`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={`principal_${i}`} 
                      stackId={`stack_${i}`}
                      stroke={color}
                      strokeWidth={2}
                      fill={color}
                      fillOpacity={fillOpacity + 0.2}
                      name={`${result.scenario.name} - Capital`}
                    />
                  </React.Fragment>
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Cumulative Interest */}
      <div className="bg-white rounded shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Cumulative Interest Paid</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              type="number"
              domain={[0, maxScheduleLength]}
              tickFormatter={(m) => `${Math.floor(m/12)}y`}
            />
            <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} />
            <Tooltip 
              content={
                <CumulativeTooltip 
                  results={results}
                  cumulativeDataByScenario={cumulativeDataByScenario}
                />
              }
            />
            <Legend />
            {results.map((result, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`cumulative_${i}`}
                name={result.scenario.name}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Total Cost Comparison */}
      <div className="bg-white rounded shadow-md p-6">
        <h2 className="text-lg font-medium mb-4">Total Cost Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={results.map(r => ({
            name: r.scenario.name,
            initial: r.initialCosts,
            interest: r.totalInterest,
            capital: r.principal
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="initial" stackId="a" fill="#757575" name="Initial Costs" />
            <Bar dataKey="interest" stackId="a" fill="#D32F2F" name="Interest" />
            <Bar dataKey="capital" stackId="a" fill="#1976D2" name="Capital" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};
