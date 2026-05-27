import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getLatestStatement, debtorsAPI, payablesAPI } from "../utils/api.js";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [statement, setStatement] = useState(null);
  const [debtors, setDebtors] = useState([]);
  const [debtorStats, setDebtorStats] = useState({ totalOutstanding: 0, overdueCount: 0 });
  const [payables, setPayables] = useState([]);
  const [payablesStats, setPayablesStats] = useState({ totalUpcoming: 0, overdueCount: 0, dueSoonCount: 0 });
  const [loadingStatement, setLoadingStatement] = useState(true);
  const [loadingDebtors, setLoadingDebtors] = useState(true);
  const [loadingPayables, setLoadingPayables] = useState(true);

  const loadStatement = useCallback(async () => {
    setLoadingStatement(true);
    try {
      const s = await getLatestStatement();
      setStatement(s);
    } catch {
      setStatement(null);
    } finally {
      setLoadingStatement(false);
    }
  }, []);

  const loadDebtors = useCallback(async () => {
    setLoadingDebtors(true);
    try {
      const res = await debtorsAPI.getAll();
      setDebtors(res.data?.debtors || []);
      setDebtorStats({
        totalOutstanding: res.data?.totalOutstanding || 0,
        overdueCount: res.data?.overdueCount || 0,
      });
    } catch {
      setDebtors([]);
    } finally {
      setLoadingDebtors(false);
    }
  }, []);

  const loadPayables = useCallback(async () => {
    setLoadingPayables(true);
    try {
      const res = await payablesAPI.getAll();
      setPayables(res.data?.payables || []);
      setPayablesStats({
        totalUpcoming: res.data?.totalUpcoming || 0,
        overdueCount: res.data?.overdueCount || 0,
        dueSoonCount: res.data?.dueSoonCount || 0,
      });
    } catch {
      setPayables([]);
    } finally {
      setLoadingPayables(false);
    }
  }, []);

  useEffect(() => {
    loadStatement();
    loadDebtors();
    loadPayables();
  }, [loadStatement, loadDebtors, loadPayables]);

  return (
    <DashboardContext.Provider
      value={{
        statement,
        loadingStatement,
        reloadStatement: loadStatement,
        debtors,
        debtorStats,
        loadingDebtors,
        reloadDebtors: loadDebtors,
        payables,
        payablesStats,
        loadingPayables,
        reloadPayables: loadPayables,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
