'use client';

import React, { useState, useMemo } from 'react';
import { Scenario, ScenarioResult, LumpSumOverpayment, DEFAULT_SCENARIO, SURVEY_COST_MAP, SurveyType } from '@/types';
import { calculateMortgage, calculateStampDuty } from '@/engine';
import { Header, Footer } from '@/components/layout';
import { InputForm } from '@/components/form';
import { ResultsPanel } from '@/components/results';

export default function MortgageCalculator() {
  const [activeTab, setActiveTab] = useState('Simple');
  const [resultsTab, setResultsTab] = useState('Summary');
  const [showInitialCosts, setShowInitialCosts] = useState(false);
  
  const [scenarios, setScenarios] = useState<Scenario[]>([{ ...DEFAULT_SCENARIO }]);
  const [currentScenario, setCurrentScenario] = useState(0);

  const updateScenario = (field: keyof Scenario, value: unknown) => {
    setScenarios(prev => prev.map((s, i) => 
      i === currentScenario ? { ...s, [field]: value } : s
    ));
  };

  const addLumpSum = () => {
    const scenario = scenarios[currentScenario];
    const newOverpayment: LumpSumOverpayment = {
      date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      amount: 5000
    };
    updateScenario('lumpSumOverpayments', [...scenario.lumpSumOverpayments, newOverpayment]);
  };

  const updateLumpSum = (index: number, field: keyof LumpSumOverpayment, value: string | number) => {
    const scenario = scenarios[currentScenario];
    const updated = scenario.lumpSumOverpayments.map((ls, i) => 
      i === index ? { ...ls, [field]: value } : ls
    );
    updateScenario('lumpSumOverpayments', updated);
  };

  const removeLumpSum = (index: number) => {
    const scenario = scenarios[currentScenario];
    updateScenario('lumpSumOverpayments', scenario.lumpSumOverpayments.filter((_, i) => i !== index));
  };

  const calculateResults = () => {
    setScenarios(prev => prev.map((s, i) => 
      i === currentScenario ? { ...s, hasResults: true } : s
    ));
  };

  const addNewScenario = () => {
    const lastScenario = scenarios[currentScenario];
    const newScenario: Scenario = {
      ...lastScenario,
      id: scenarios.length + 1,
      name: `Scenario ${scenarios.length + 1}`,
      expanded: true,
      hasResults: false,
      lumpSumOverpayments: [...lastScenario.lumpSumOverpayments]
    };
    
    setScenarios(prev => prev.map((s, i) => 
      i === currentScenario ? { ...s, expanded: false } : s
    ).concat(newScenario));
    setCurrentScenario(scenarios.length);
  };

  const toggleScenario = (index: number) => {
    setScenarios(prev => prev.map((s, i) => 
      i === index ? { ...s, expanded: !s.expanded } : { ...s, expanded: false }
    ));
    setCurrentScenario(index);
  };

  const toggleVisibility = (index: number) => {
    setScenarios(prev => prev.map((s, i) => 
      i === index ? { ...s, visible: !s.visible } : s
    ));
  };

  const toggleLock = (index: number) => {
    setScenarios(prev => prev.map((s, i) => 
      i === index ? { ...s, locked: !s.locked } : s
    ));
  };

  const deleteScenario = (index: number) => {
    if (scenarios.length === 1) return;
    setScenarios(prev => prev.filter((_, i) => i !== index));
    setCurrentScenario(Math.max(0, currentScenario - 1));
  };

  // Calculate results for all scenarios
  const results = useMemo(() => {
    return scenarios.map(scenario => {
      if (!scenario.hasResults) return null;
      
      const stampDuty = calculateStampDuty(
        scenario.propertyPrice,
        scenario.isFirstTimeBuyer,
        scenario.isAdditionalProperty,
        scenario.isNonResident
      );

      const surveyCost = scenario.surveyType === 'custom' 
        ? scenario.surveyCost 
        : SURVEY_COST_MAP[scenario.surveyType as SurveyType];

      const initialCosts = stampDuty + scenario.solicitorFees + scenario.disbursements + 
        surveyCost + scenario.brokerFee + scenario.valuationFee + 
        scenario.buildingsInsurance + scenario.movingCosts + scenario.furnitureRenovation +
        (!scenario.addFeeToMortgage ? scenario.productFee : 0) + scenario.bookingFee;

      const mortgageCalc = calculateMortgage(scenario);

      return {
        scenario,
        stampDuty,
        initialCosts,
        ...mortgageCalc
      } as ScenarioResult;
    });
  }, [scenarios]);

  const visibleResults = results.filter((r, i): r is ScenarioResult => r !== null && scenarios[i].visible);

  const scenario = scenarios[currentScenario];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header results={visibleResults} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <InputForm
          scenario={scenario}
          scenarios={scenarios}
          currentScenario={currentScenario}
          activeTab={activeTab}
          showInitialCosts={showInitialCosts}
          onTabChange={setActiveTab}
          onShowInitialCostsChange={setShowInitialCosts}
          onUpdateScenario={updateScenario}
          onAddLumpSum={addLumpSum}
          onUpdateLumpSum={updateLumpSum}
          onRemoveLumpSum={removeLumpSum}
          onCalculateResults={calculateResults}
          onAddNewScenario={addNewScenario}
          onToggleScenario={toggleScenario}
          onToggleVisibility={toggleVisibility}
          onToggleLock={toggleLock}
          onDeleteScenario={deleteScenario}
        />

        <ResultsPanel
          results={visibleResults}
          activeTab={resultsTab}
          onTabChange={setResultsTab}
        />
      </div>

      <Footer />
    </div>
  );
}
