'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';


interface DashboardContextType {
  summary: {
    totalDebt: number;
    unpaidCount: number;
    todayCount: number;
  } | null;
  orders: any[];
  customers: any[];
  debts: any[];
  products: any[];
  pagination: {
    page: number;
    hasMore: boolean;
  };
  loading: boolean;
  error: boolean;
  page: number;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  refreshProducts: (showInactive?: boolean) => Promise<void>;

  // Modal State
  activeModal: { type: 'rename' | 'delete' | 'set_price' | 'confirm_order' | 'delete_customer' | 'bulk_delete_customers' | 'manual_order' | 'manage_products', id: string | null, name?: string | null, data?: any } | null;
  openModal: (type: 'rename' | 'delete' | 'set_price' | 'confirm_order' | 'delete_customer' | 'bulk_delete_customers' | 'manual_order' | 'manage_products', id: string | null, name?: string | null, data?: any) => void;
  closeModal: () => void;

  // Settings
  defaultPrice: number;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Poll every 15s in dev, 5s in prod
const POLL_INTERVAL_MS = process.env.NODE_ENV === 'development' ? 15_000 : 5_000;

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [activeModal, setActiveModal] = useState<any>(null);
  const [defaultPrice, setDefaultPrice] = useState(5000);

  const isFirstLoad = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pageRef = useRef(page);
  pageRef.current = page;

  const fetchProducts = useCallback(async (includeInactive = false) => {
    try {
      const res = await fetch(`/api/products?includeInactive=${includeInactive}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      setProducts(json);
    } catch (err) {
      console.error('Fetch Products Error:', err);
    }
  }, []);

  const fetchAll = useCallback(async (p?: number) => {
    const targetPage = p ?? pageRef.current;
    if (isFirstLoad.current) setLoading(true);

    try {
      const [dashRes, settingsRes, productsRes] = await Promise.all([
        fetch(`/api/dashboard?page=${targetPage}`),
        fetch(`/api/settings`),
        fetch(`/api/products`)
      ]);

      if (!dashRes.ok || !settingsRes.ok || !productsRes.ok) throw new Error('Failed to fetch');

      const dashJson = await dashRes.json();
      const settingsJson = await settingsRes.json();
      const productsJson = await productsRes.json();

      setData(dashJson);
      setDefaultPrice(settingsJson.default_price);
      setProducts(productsJson);
      setError(false);
    } catch (err) {
      console.error('Unified Fetch Error:', err);
      setError(true);
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      fetchAll();
    }, POLL_INTERVAL_MS);
  }, [fetchAll]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const openModal = useCallback((type: any, id: string, name?: string, data?: any) => {
    setActiveModal({ type, id, name, data });
    stopPolling();
  }, [stopPolling]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    startPolling();
  }, [startPolling]);

  const refresh = useCallback(async () => {
    await fetchAll();
    startPolling();
  }, [fetchAll, startPolling]);

  const refreshProducts = useCallback(async (showInactive = false) => {
    await fetchProducts(showInactive);
  }, [fetchProducts]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchAll();
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchAll, startPolling, stopPolling]);

  useEffect(() => {
    fetchAll();
    startPolling();
    return () => stopPolling();
  }, [fetchAll, startPolling, stopPolling]);

  useEffect(() => {
    if (isFirstLoad.current) return;
    fetchAll(page);
  }, [page, fetchAll]);

  const value = {
    summary: data?.summary || null,
    orders: data?.orders || [],
    customers: data?.customers || [],
    debts: data?.debts || [],
    products,
    pagination: data?.pagination || { page: 1, hasMore: false },
    loading,
    error,
    page,
    setPage,
    refresh,
    refreshProducts,
    activeModal,
    openModal,
    closeModal,
    defaultPrice,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
