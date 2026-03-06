import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { BotId } from '@/data/bots';
import { qaTests } from '@/data/qa-tests';

type TestResult = 'ok' | 'partial' | 'fail' | null;

interface BotStats {
  total: number;
  ok: number;
  partial: number;
  fail: number;
}

interface AppContextType {
  testResults: Record<string, TestResult>;
  setTestResult: (testId: string, result: TestResult) => void;
  saveResults: () => void;
  getBotStats: (botId: BotId) => BotStats;
  getGlobalStats: () => BotStats;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'bcm-hub-qa-results';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setTestResult = useCallback((testId: string, result: TestResult) => {
    setTestResults(prev => {
      const next = { ...prev };
      if (result === null) { delete next[testId]; }
      else { next[testId] = result; }
      return next;
    });
  }, []);

  const saveResults = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testResults));
  }, [testResults]);


  const getBotStats = useCallback((botId: BotId): BotStats => {
    const categories = qaTests[botId];
    const allTests = categories.flatMap(c => c.tests);
    return {
      total: allTests.length,
      ok: allTests.filter(t => testResults[t.id] === 'ok').length,
      partial: allTests.filter(t => testResults[t.id] === 'partial').length,
      fail: allTests.filter(t => testResults[t.id] === 'fail').length,
    };
  }, [testResults]);

  const getGlobalStats = useCallback((): BotStats => {
    const botIds: BotId[] = ['bob', 'cash', 'mag'];
    return botIds.reduce(
      (acc, id) => {
        const s = getBotStats(id);
        return { total: acc.total + s.total, ok: acc.ok + s.ok, partial: acc.partial + s.partial, fail: acc.fail + s.fail };
      },
      { total: 0, ok: 0, partial: 0, fail: 0 }
    );
  }, [getBotStats]);

  return (
    <AppContext.Provider value={{ testResults, setTestResult, saveResults, getBotStats, getGlobalStats, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
