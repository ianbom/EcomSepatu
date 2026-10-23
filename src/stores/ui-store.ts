'use client';
import { create } from 'zustand';
import type { Product } from '@/types/product';
type UIState = { search: boolean; product: Product | null; info: string | null; setSearch: (search: boolean) => void; viewProduct: (product: Product | null) => void; showInfo: (info: string | null) => void };
export const useUI = create<UIState>(set => ({ search: false, product: null, info: null, setSearch: search => set({ search }), viewProduct: product => set({ product, search: false }), showInfo: info => set({ info }) }));
