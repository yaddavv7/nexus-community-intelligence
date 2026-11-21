import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

export interface DemoStepInfo {
  step: number;
  title: string;
  description: string;
  details?: string;
  data?: any;
}

const DEMO_STEPS: DemoStepInfo[] = [
  {
    step: 1,
    title: "1. Baseline Community Ingestion",
    description: "Loads realistic civic reports across 9 infrastructure categories in the Kerala demonstration sector.",
  },
  {
    step: 2,
    title: "2. Multimodal & NLP Problem Classification",
    description: "AI categorizes issues, maps bilingual Malayalam/English terminology, and estimates severity (1-5) and urgency.",
  },
  {
    step: 3,
    title: "3. Geospatial & Semantic Duplicate Detection",
    description: "Discovers clustered reports within 400m radius using Haversine distance and Jaccard text similarity.",
  },
  {
    step: 4,
    title: "4. Explainable Priority Calculation",
    description: "Calculates transparent priority score (0-100) combining severity, urgency, community confirmations, and stagnation.",
  },
  {
    step: 5,
    title: "5. Interactive Map & Incident Visualization",
    description: "Plots real incidents onto OpenStreetMap with category-specific badges and priority color-coding.",
  },
  {
    step: 6,
    title: "6. Environmental Surge Simulation",
    description: "Simulates an 86.5 mm/hr heavy monsoon downpour scenario to evaluate civic infrastructure resilience.",
  },
  {
    step: 7,
    title: "7. Predictive Risk Recalculation",
    description: "Correlates drainage reports with precipitation, escalating waterlogging risk levels across Periyar riverbank wards.",
  },
  {
    step: 8,
    title: "8. AI Community Intelligence Summary",
    description: "Generates an automated daily/weekly executive summary highlighting pressure points and hotspots.",
  },
  {
    step: 9,
    title: "9. Actionable Human Oversight & Dispatch",
    description: "Recommends prioritized municipal inspections and team assignments for authoritative human approval.",
  },
];

interface DemoContextType {
  isDemoModalOpen: boolean;
  openDemoModal: () => void;
  closeDemoModal: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: DemoStepInfo[];
  stepData: Record<number, any>;
  runStep: (stepNumber: number) => Promise<any>;
  runAllSteps: () => Promise<void>;
  isRunningAll: boolean;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);

  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);

  const runStep = async (stepNum: number) => {
    try {
      const res = await api.runDemoStep(stepNum);
      setStepData((prev) => ({ ...prev, [stepNum]: res }));
      setCurrentStep(stepNum);
      return res;
    } catch (err) {
      console.error(`Step ${stepNum} failed:`, err);
    }
  };

  const runAllSteps = async () => {
    setIsRunningAll(true);
    for (let i = 1; i <= 9; i++) {
      setCurrentStep(i);
      await runStep(i);
      await new Promise((res) => setTimeout(res, 1200));
    }
    setIsRunningAll(false);
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setStepData({});
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoModalOpen,
        openDemoModal,
        closeDemoModal,
        currentStep,
        setCurrentStep,
        steps: DEMO_STEPS,
        stepData,
        runStep,
        runAllSteps,
        isRunningAll,
        resetDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
};
