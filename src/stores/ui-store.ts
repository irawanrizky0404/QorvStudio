'use client';

import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface UiState {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  adminSidebarOpen: boolean;
  toggleAdminSidebar: () => void;
}

const TOAST_TTL_MS = 5000;

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],

  pushToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    // Errors stay until dismissed - an error that vanishes is an error nobody read.
    if (toast.variant !== 'error') {
      setTimeout(() => get().dismissToast(id), TOAST_TTL_MS);
    }
    return id;
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

  adminSidebarOpen: true,
  toggleAdminSidebar: () => set((state) => ({ adminSidebarOpen: !state.adminSidebarOpen })),
}));

/** Convenience wrapper so call sites read as `toast.success(...)`. */
export const toast = {
  success: (title: string, description?: string) =>
    useUiStore.getState().pushToast({ variant: 'success', title, description }),
  error: (title: string, description?: string) =>
    useUiStore.getState().pushToast({ variant: 'error', title, description }),
  info: (title: string, description?: string) =>
    useUiStore.getState().pushToast({ variant: 'info', title, description }),
  warning: (title: string, description?: string) =>
    useUiStore.getState().pushToast({ variant: 'warning', title, description }),
};
