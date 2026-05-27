/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  Boxes, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  DollarSign 
} from 'lucide-react';

interface InventoryModuleProps {
  onOpenQuickTx: (type: 'STOCK_IN' | 'STOCK_OUT') => void;
}

export default function InventoryModule({ onOpenQuickTx }: InventoryModuleProps) {
  const { products, stockMap, productStockTotals, dashboardMetrics } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'low' | 'out'>('all');
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + " جنيه";
  };

  const toggleProductExpand = (id: string) => {
    if (expandedProductIds.includes(id)) {
      setExpandedProductIds(expandedProductIds.filter((pId) => pId !== id));
    } else {
      setExpandedProductIds([...expandedProductIds, id]);
    }
  };

  // Filter products based on stock status and search term
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Name or category search
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      const totals = productStockTotals[p.id] ?? 0;
      
      // Stock level calculations for this product variants
      const variants = stockMap[p.id] || {};
      const hasLowStockVariant = Object.values(variants).some(qty => (qty as number) < 5);
      const hasOutOfStockVariant = Object.values(variants).some(qty => (qty as number) === 0);

      if (selectedFilter === 'low') {
        return hasLowStockVariant;
      }
      if (selectedFilter === 'out') {
        return hasOutOfStockVariant;
      }
      return true;
    });
  }, [products, searchTerm, selectedFilter, productStockTotals, stockMap]);

  return (
    <div className="space-y-6 pb-24" dir="rtl">
      {/* Header Block */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">رصيد المخزن الفعلي</h1>
          <p className="text-xs text-slate-500 font-medium font-sans">جرد المستودعات ومستويات المخزون للموديلات على مستوى المقاس واللون</p>
        </div>
      </div>

      {/* Real-time Inventory Financial Metrics */}
      <div className="grid grid-cols-2 gap-3 text-right">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">رأس المال المخزني (بسعر التكلفة)</span>
          <span className="text-base font-bold text-gray-900 font-mono mt-0.5 inline-block">
            {formatCurrency(dashboardMetrics.totalInventoryCostValue)}
          </span>
          <p className="text-[9px] text-gray-400 mt-1">محسوب حسب تكلفة التصنيع الشاملة</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">القيمة التقديرية للبيع بالكامل</span>
          <span className="text-base font-bold text-indigo-700 font-mono mt-0.5 inline-block">
            {formatCurrency(dashboardMetrics.totalInventorySellValue)}
          </span>
          <p className="text-[9px] text-gray-400 mt-1">القيمة الإجمالية المتوقعة عند تصريف البضائع بالجملة</p>
        </div>
      </div>

      {/* Dispatch adjustments */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          id="inv-quick-stock-in"
          onClick={() => onOpenQuickTx('STOCK_IN')}
          className="flex items-center justify-center gap-1.5 py-2.5 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-xs font-bold text-indigo-700 rounded-xl active:scale-[0.98]"
        >
          <ArrowDownLeft className="w-4 h-4 ml-1" />
          شحن وتوريد بضاعة للمستودع (من المصنع)
        </button>
        <button
          id="inv-quick-stock-out"
          onClick={() => onOpenQuickTx('STOCK_OUT')}
          className="flex items-center justify-center gap-1.5 py-2.5 border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors text-xs font-bold text-amber-700 rounded-xl active:scale-[0.98]"
        >
          <ArrowUpRight className="w-4 h-4 ml-1" />
          تسليم قطع بضاعة أمانة (للمسوقين)
        </button>
      </div>

      {/* Search & Audit Filters Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
          <input
            id="inv-search-bar"
            type="text"
            placeholder="ابحث عن موديل، حذاء، أو فستان بالاسم أو الرمز المرجعي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 text-xs bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-3xs text-right"
          />
        </div>

        {/* Audit Filter Tabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-transform ${selectedFilter === 'all' ? 'bg-white text-gray-900 shadow-3xs' : 'text-gray-500'}`}
          >
            جميع الموديلات
          </button>
          <button
            onClick={() => setSelectedFilter('low')}
            className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-transform flex items-center justify-center gap-1 ${selectedFilter === 'low' ? 'bg-amber-500 text-white shadow-3xs' : 'text-gray-500'}`}
          >
            <AlertTriangle className="w-3 h-3 ml-1" />
            تحت الحد الأدنى (&lt; 5 فطع)
          </button>
          <button
            onClick={() => setSelectedFilter('out')}
            className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-transform flex items-center justify-center gap-1 ${selectedFilter === 'out' ? 'bg-rose-600 text-white shadow-3xs' : 'text-gray-500'}`}
          >
            <Boxes className="w-3 h-3 ml-1" />
            المنتهية تماماً (0 قطع)
          </button>
        </div>
      </div>

      {/* Inventory Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl text-xs text-gray-400 italic font-sans px-4">
          {products.length === 0 
            ? "كتالوج البضائع فارغ بالكامل حالياً. ابدأ بإضافة موديلات في الكتالوج أولاً!" 
            : "لم نجد أي موديلات تطابق فلاتر البحث الحالية."}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => {
            const totalStock = productStockTotals[p.id] ?? 0;
            const isExpanded = expandedProductIds.includes(p.id);
            const valueCost = totalStock * p.costPrice;
            const valueSell = totalStock * p.sellingPrice;

            return (
              <div 
                id={`inv-item-${p.id}`}
                key={p.id} 
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-3xs flex flex-col text-right"
              >
                {/* Core Header item info summary */}
                <div 
                  onClick={() => toggleProductExpand(p.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 pl-3 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] tracking-wider uppercase font-extrabold px-1 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{p.id}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xs truncate">{p.name}</h3>

                    <div className="flex gap-3 text-[10px] text-gray-400 font-semibold font-mono">
                      <span>الرصيد الكلي: <strong className="text-gray-700">{totalStock} قطعة</strong></span>
                      <span>•</span>
                      <span>المثولية المالية: <strong className="text-emerald-600">{formatCurrency(valueCost)}</strong></span>
                    </div>
                  </div>

                  {/* Expansion indicator + global status badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono uppercase ${
                      totalStock === 0 
                        ? 'bg-rose-100 text-rose-700' 
                        : totalStock < 10 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {totalStock === 0 ? 'منفذ' : totalStock < 10 ? 'منخفض' : 'متوفر'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded size/colors matrix list */}
                {isExpanded && (
                  <div className="border-t border-gray-50 bg-slate-50/50 p-3.5 space-y-2.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">تفاصيل المخزون المتوفر لكل توليفة (مقاس / لون)</p>
                    
                    <div className="grid grid-cols-1 divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white overflow-hidden text-xs">
                      {p.sizes.flatMap(size => 
                        p.colors.map(color => {
                          const key = `${size} / ${color}`;
                          const qty = stockMap[p.id]?.[key] ?? 0;

                          return (
                            <div key={key} className="flex justify-between items-center p-2.5 hover:bg-slate-50 transition-all">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono">{size}</span>
                                <span className="text-slate-300 font-medium">/</span>
                                <span className="text-gray-600 font-medium text-[11px]">{color}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold text-[11px] ${
                                  qty === 0 
                                    ? 'text-rose-600' 
                                    : qty < 5 
                                      ? 'text-amber-600' 
                                      : 'text-gray-800'
                                }`}>
                                  {qty === 0 ? 'نفذ تماماً (0 قطع)' : `${qty} قطعة`}
                                </span>
                                {qty < 5 && qty > 0 && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Quick values card */}
                    <div className="bg-indigo-950 text-white rounded-xl p-3 flex justify-between text-[10px] items-center font-sans">
                      <div>
                        <span className="text-indigo-200 uppercase tracking-wide block font-semibold text-[9px]">العائد الإجمالي المتوقع</span>
                        <span className="font-mono text-xs font-bold">{formatCurrency(valueSell)}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-indigo-200 uppercase tracking-wide block font-semibold text-[9px]">صافي الأرباح المتوقعة عند البيع</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">{formatCurrency(valueSell - valueCost)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
