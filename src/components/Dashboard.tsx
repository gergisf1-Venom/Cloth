/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenQuickTx: (type: 'STOCK_IN' | 'STOCK_OUT' | 'PAYMENT') => void;
}

export default function Dashboard({ onNavigate, onOpenQuickTx }: DashboardProps) {
  const { products, resellers, transactions, dashboardMetrics } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + " جنيه";
  };

  // Filter low stock instances that have actually been created or default empty alerts
  const lowStockCount = dashboardMetrics.lowStockAlerts.length;

  return (
    <div className="space-y-6 pb-24" dir="rtl">
      {/* Header with App Title & Core Concept */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">نظرة عامة</h1>
          <p className="text-xs text-gray-500 font-medium">نظام تخطيط موارد توزيع الملابس (Wholesale)</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-1"></span>
          مزامنة فورية (محلية)
        </span>
      </div>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          id="btn-quick-stock-in"
          onClick={() => onOpenQuickTx('STOCK_IN')}
          className="flex flex-col items-center justify-center p-3.5 bg-white border border-gray-100 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] shadow-xs text-center group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2 group-hover:bg-indigo-100 transition-colors">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-800">شحن مخزن (+)</span>
        </button>

        <button
          id="btn-quick-stock-out"
          onClick={() => onOpenQuickTx('STOCK_OUT')}
          className="flex flex-col items-center justify-center p-3.5 bg-white border border-gray-100 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] shadow-xs text-center group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-100 transition-colors">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-800">تسليم أمانة (-)</span>
        </button>

        <button
          id="btn-quick-payment"
          onClick={() => onOpenQuickTx('PAYMENT')}
          className="flex flex-col items-center justify-center p-3.5 bg-white border border-gray-100 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] shadow-xs text-center group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 group-hover:bg-emerald-100 transition-colors">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-800">تحصيل مالي (ج.م)</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="space-y-3">
        {/* Total Inventory Value Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">تقييم القيمة الشرائية للمخزون (التكلفة)</p>
              <h2 className="text-3xl font-bold font-mono tracking-tight mt-1">
                {formatCurrency(dashboardMetrics.totalInventoryCostValue)}
              </h2>
            </div>
            <div className="p-2.5 bg-white/10 rounded-lg">
              <Layers className="w-5 h-5 text-indigo-200" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-indigo-100 border-t border-white/10 pt-3">
            <span>القيمة التقديرية للبيع بالتجزئة (المبيعات):</span>
            <span className="font-mono font-medium">{formatCurrency(dashboardMetrics.totalInventorySellValue)}</span>
          </div>
        </div>

        {/* Double Metrics row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Outstanding Debt */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 font-medium">ذمم المسوقين المستحقة</span>
              <DollarSign className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-lg font-bold text-gray-900 font-mono tracking-tight">
              {formatCurrency(dashboardMetrics.totalOutstandingDebt)}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">إجمالي الفواتير قيد التحصيل</p>
          </div>

          {/* Paid Amount */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 font-medium">التحصيلات النقدية</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg font-bold text-gray-900 font-mono tracking-tight">
              {formatCurrency(dashboardMetrics.totalPaidAmount)}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">إجمالي المقبوضات المستلمة</p>
          </div>
        </div>

        {/* Reseller Count */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 font-medium block">المسوقين المسجلين</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 inline-block">{resellers.length} شريك متعاون</span>
            <span className="text-xs text-emerald-600 font-medium mr-2">({dashboardMetrics.activeResellersCount} نشط)</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Core Logic Warnings / Empty States */}
      {products.length === 0 && resellers.length === 0 && (
        <div className="bg-indigo-50/50 border border-dashed border-indigo-200 rounded-2xl p-6 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-3">
            <Plus className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">البدء في استخدام SewnERP</h3>
          <p className="text-xs text-gray-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
            قاعدة البيانات فارغة تمامًا حاليًا. ابدأ بإنشاء <strong>منتج (موديل) جديد</strong> وتجربة تسجيل <strong>أول مسوق شريك</strong>.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2" dir="ltr">
            <button
              id="dash-add-product"
              onClick={() => onNavigate('products')}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              إضافة منتج جديد
            </button>
            <button
              id="dash-add-reseller"
              onClick={() => onNavigate('resellers')}
              className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إضافة مسوّق شريك
            </button>
          </div>
        </div>
      )}

      {/* Top Performing Resellers List */}
      {resellers.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800">أعلى المسوقين والشركاء مبيعاً وقيمة</h3>
            <button 
              onClick={() => onNavigate('resellers')}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              عرض الكل
            </button>
          </div>
          {dashboardMetrics.topResellers.length === 0 ? (
            <div className="text-center py-5 text-xs text-gray-400 italic">
              لا توجد عمليات جارية مع المسوقين بصفة أمانة بعد
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {dashboardMetrics.topResellers.map((item, idx) => (
                <div key={item.reseller.id} className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{item.reseller.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium font-bold">استلم {item.volume} قطعة بصفة أمانة</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 font-mono">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Critical Low Stock Alert Modules */}
      {products.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              تنبيهات نقص المخزون الفعلي (أقل من 5 قطع)
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              عرض المخزون بالكامل
            </button>
          </div>
          
          {lowStockCount === 0 ? (
            <div className="text-center py-5 text-xs text-slate-400 italic">
              جميع الموديلات والمقاسات متوفرة بشكل ممتاز بالمستودع!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {dashboardMetrics.lowStockAlerts.slice(0, 10).map((alert, index) => (
                <div 
                  key={`${alert.product.id}-${alert.size}-${alert.color}-${index}`}
                  className="flex justify-between items-center p-2.5 rounded-lg bg-amber-50/50 border border-amber-100/40 text-xs"
                >
                  <div className="text-right">
                    <span className="font-semibold text-gray-800 block">{alert.product.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 inline-block">
                      المتغير: {alert.size} / اللون: {alert.color}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${alert.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {alert.stock === 0 ? 'نفذ بالكامل' : `متبقي ${alert.stock} قطعة`}
                  </span>
                </div>
              ))}
              {lowStockCount > 10 && (
                <p className="text-center text-[10px] text-gray-400 pt-1">
                  + {lowStockCount - 10} تفاصيل مقاسات إضافية تحت الحد الأدنى
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
