/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, StockTransaction, PaymentTransaction } from '../types';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeft,
  CreditCard, 
  Plus, 
  Trash2, 
  Filter, 
  Search, 
  Calendar, 
  FileText, 
  ShoppingBag, 
  User 
} from 'lucide-react';

interface TransactionsModuleProps {
  initialFormType?: 'STOCK_IN' | 'STOCK_OUT' | 'PAYMENT' | null;
  initialResellerId?: string | null;
  onClearFormTriggers?: () => void;
}

export default function TransactionsModule({ 
  initialFormType = null, 
  initialResellerId = null,
  onClearFormTriggers 
}: TransactionsModuleProps) {
  const { 
    products, 
    resellers, 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    stockMap,
    resellerStats,
    showCustomAlert,
    showCustomConfirm
  } = useApp();

  // View toggles
  const [activeSubView, setActiveSubView] = useState<'list' | 'add'>('list');
  const [selectedTxFilter, setSelectedTxFilter] = useState<'ALL' | 'STOCK_IN' | 'STOCK_OUT' | 'PAYMENT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Core state
  const [txType, setTxType] = useState<TransactionType>('STOCK_IN');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txNotes, setTxNotes] = useState('');

  // Stock Transaction details
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [txQuantity, setTxQuantity] = useState('');
  const [selectedResellerId, setSelectedResellerId] = useState('');

  // Payment Transaction details
  const [paymentAmount, setPaymentAmount] = useState('');

  // Load parent triggers if present
  useEffect(() => {
    if (initialFormType) {
      setTxType(initialFormType);
      
      // Default reset subfields
      setSelectedProductId('');
      setSelectedSize('');
      setSelectedColor('');
      setTxQuantity('');
      setPaymentAmount('');
      setTxNotes('');
      setTxDate(new Date().toISOString().split('T')[0]);

      if (initialResellerId) {
        setSelectedResellerId(initialResellerId);
      } else {
        setSelectedResellerId('');
      }

      setActiveSubView('add');
      
      // Clear triggers after consuming
      if (onClearFormTriggers) {
        onClearFormTriggers();
      }
    }
  }, [initialFormType, initialResellerId, onClearFormTriggers]);

  // Dynamic values loaded on selected product change
  const currentSelectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  // Reset variant selections when selected product changes
  useEffect(() => {
    if (currentSelectedProduct) {
      setSelectedSize(currentSelectedProduct.sizes[0] || '');
      setSelectedColor(currentSelectedProduct.colors[0] || '');
    } else {
      setSelectedSize('');
      setSelectedColor('');
    }
  }, [currentSelectedProduct]);

  // Real-time stock calculator helper for form validation
  const currentAvailableVariantStock = useMemo(() => {
    if (!selectedProductId || !selectedSize || !selectedColor) return 0;
    return stockMap[selectedProductId]?.[`${selectedSize} / ${selectedColor}`] ?? 0;
  }, [selectedProductId, selectedSize, selectedColor, stockMap]);

  // Format currencies
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + " جنيه";
  };

  // Filter transaction list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filter tab
      if (selectedTxFilter !== 'ALL' && t.type !== selectedTxFilter) {
        return false;
      }

      // Search filters
      if (!searchTerm) return true;

      const rName = t.resellerId ? (resellers.find(r => r.id === t.resellerId)?.name || '') : '';
      const notesMatch = t.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
      let pName = '';
      if (t.type !== 'PAYMENT') {
         pName = products.find(p => p.id === t.productId)?.name || '';
      }

      return (
        rName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notesMatch
      );
    });
  }, [transactions, selectedTxFilter, searchTerm, resellers, products]);

  // Create Transaction triggers
  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!txDate) {
      showCustomAlert('بيانات ناقصة', 'يرجى اختيار تاريخ صالح.', 'warning');
      return;
    }

    const executeSaveStockTx = (qty: number) => {
      addTransaction({
        type: txType,
        date: txDate,
        notes: txNotes || undefined,
        productId: selectedProductId,
        size: selectedSize,
        color: selectedColor,
        quantity: qty,
        resellerId: txType === 'STOCK_OUT' ? selectedResellerId : undefined,
      } as Omit<StockTransaction, 'id'>);

      // Success & reset
      setActiveSubView('list');
      setTxNotes('');
      setTxQuantity('');
      setPaymentAmount('');
      setSelectedProductId('');
    };

    const executeSavePaymentTx = (amt: number) => {
      addTransaction({
        type: 'PAYMENT',
        date: txDate,
        notes: txNotes || undefined,
        resellerId: selectedResellerId,
        amount: amt,
      } as Omit<PaymentTransaction, 'id'>);

      // Success & reset
      setActiveSubView('list');
      setTxNotes('');
      setTxQuantity('');
      setPaymentAmount('');
      setSelectedProductId('');
    };

    if (txType === 'STOCK_IN' || txType === 'STOCK_OUT') {
      if (!selectedProductId) {
        showCustomAlert('بيانات ناقصة', 'يرجى تعيين موديل قطعة الملابس أولاً.', 'warning');
        return;
      }
      if (!selectedSize || !selectedColor) {
        showCustomAlert('بيانات ناقصة', 'المقاس واللون مطلوبان لتحديد القطعة بدقة.', 'warning');
        return;
      }
      
      const qty = parseInt(txQuantity);
      if (isNaN(qty) || qty <= 0) {
        showCustomAlert('خطأ في الإدخال', 'يجب أن تكون الكمية رقماً صحيحاً أكبر من الصفر.', 'warning');
        return;
      }

      if (txType === 'STOCK_OUT') {
        if (!selectedResellerId) {
          showCustomAlert('بيانات ناقصة', 'يرجى تحديد الشريك المسوق لتسليم البضاعة إليه.', 'warning');
          return;
        }
        // Stock warning (Allow it as simple ERP but warn)
        if (qty > currentAvailableVariantStock) {
          showCustomConfirm(
            'تحذير المخزون الفعلي',
            `تحذير المستودع: أنت تقوم بتسليم ${qty} قطعة من موديل ${currentSelectedProduct?.name} (مقاس: ${selectedSize} / لون: ${selectedColor})، ولكن المتاح حالياً بالرصيد في المخزن هو ${currentAvailableVariantStock} قطعة فقط.\n\nهل ترغب بالموافقة وتجاوز الرصيد بالصرف المؤقت؟`,
            () => executeSaveStockTx(qty)
          );
          return;
        }
      }

      executeSaveStockTx(qty);

    } else if (txType === 'PAYMENT') {
      if (!selectedResellerId) {
        showCustomAlert('بيانات ناقصة', 'يرجى تحديد الشريك المسوق المسدد للحساب الحالي.', 'warning');
        return;
      }
      
      const amt = parseFloat(paymentAmount);
      if (isNaN(amt) || amt <= 0) {
        showCustomAlert('خطأ في الإدخال', 'يجب أن يكون مبلغ التحصيل المالي قيمة أكبر من الصفر.', 'warning');
        return;
      }

      const activeResellerStats = resellerStats[selectedResellerId];
      if (activeResellerStats && amt > activeResellerStats.debt) {
        showCustomConfirm(
          'تجاوز المديونية الحالية',
          `ملاحظة حسابات: هذا الشريك مدين حالياً بذمة قدرها ${formatCurrency(activeResellerStats.debt)}. سداد مبلغ ${formatCurrency(amt)} أكبر من الدين المتراكم عليه حالياً.\n\nهل ترغب في تسجيل الحوالة واعتمادها كفرق دائن لصالح المسوق؟`,
          () => executeSavePaymentTx(amt)
        );
        return;
      }

      executeSavePaymentTx(amt);
    }
  };

  const handleTxDelete = (id: string) => {
    showCustomConfirm(
      'تأكيد حذف القيد اليومي',
      'هل أنت متأكد من رغبتك في حذف هذا القيد؟ سيتم إرجاع البضاعة وتعديل مديونيات المسوقين تلقائياً على الفور.',
      () => {
        deleteTransaction(id);
      }
    );
  };

  return (
    <div className="space-y-6 pb-24" dir="rtl">
      {/* Dynamic Header */}
      {activeSubView === 'list' ? (
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-right">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">دفتر اليومية والمعاملات</h1>
            <p className="text-xs text-slate-500 font-medium font-sans">تدقيق وأرشفة حركة البضائع وحركات المسحوبات والمدفوعات</p>
          </div>
          
          <button
            id="btn-add-transaction"
            onClick={() => {
              setTxType('STOCK_IN');
              setActiveSubView('add');
            }}
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة قيد جديد
          </button>
        </div>
      ) : (
        <button
          onClick={() => setActiveSubView('list')}
          className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold px-3 py-1.5 bg-indigo-50 rounded-lg w-fit active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5 ml-1" />
          إلغاء والعودة للقائمة
        </button>
      )}

      {/* VIEW 1: TRANSACTIONS CHRONOLOGICAL LEDGER INDEX */}
      {activeSubView === 'list' && (
        <div className="space-y-4 text-right">
          {/* Controls Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              <input
                id="tx-search-bar"
                type="text"
                placeholder="ابحث بالرقم المرجعي، تفاصيل البيان، أسماء الموزعين أو موديل السلعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 text-xs bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-3xs text-right"
              />
            </div>

            {/* Selector Filters Header tabs */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-center text-[10px] font-bold">
              <button
                onClick={() => setSelectedTxFilter('ALL')}
                className={`py-1.5 rounded-lg transition-transform ${selectedTxFilter === 'ALL' ? 'bg-white text-gray-950 shadow-2xs' : 'text-gray-500'}`}
              >
                جميع القيود
              </button>
              <button
                onClick={() => setSelectedTxFilter('STOCK_IN')}
                className={`py-1.5 rounded-lg transition-transform ${selectedTxFilter === 'STOCK_IN' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-gray-500'}`}
              >
                توريد المصنع (+)
              </button>
              <button
                onClick={() => setSelectedTxFilter('STOCK_OUT')}
                className={`py-1.5 rounded-lg transition-transform ${selectedTxFilter === 'STOCK_OUT' ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-500'}`}
              >
                المسوقين أمانة (-)
              </button>
              <button
                onClick={() => setSelectedTxFilter('PAYMENT')}
                className={`py-1.5 rounded-lg transition-transform ${selectedTxFilter === 'PAYMENT' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-500'}`}
              >
                الحوالات والسداد
              </button>
            </div>
          </div>

          {/* Ledger logs */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl text-xs text-gray-400 italic px-4 font-sans">
              {transactions.length === 0 
                ? "سجل اليومية فارغ تماماً حتى الآن. لم تسجل أي حركة تداول بضاعة أو نقدية." 
                : "لم نجد أي حركات قيود مطابقة لبحثك في الدفتر."}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => {
                const isPayment = tx.type === 'PAYMENT';
                const isStockIn = tx.type === 'STOCK_IN';
                
                let title = '';
                let subtitle = '';
                let flowSymbol = '';
                let amountStr = '';
                
                if (isPayment) {
                  const r = resellers.find(item => item.id === tx.resellerId);
                  title = r ? `تحصيل مالي: ${r.name}` : 'استلام دفعة من شريك مجهول';
                  subtitle = tx.notes || 'تسوية أو مستند سداد مالي';
                  flowSymbol = '+';
                  amountStr = formatCurrency(tx.amount);
                } else {
                  const p = products.find(item => item.id === tx.productId);
                  title = p ? p.name : `منتج [${tx.productId}]`;
                  
                  if (isStockIn) {
                    subtitle = `توريد مخزن من المصنع: مقاس ${tx.size} / لون ${tx.color} (${tx.quantity} قطعة)`;
                    flowSymbol = '+';
                    amountStr = `${tx.quantity} قطعة`;
                  } else {
                    const r = resellers.find(item => item.id === tx.resellerId);
                    subtitle = `تسليم أمانة لـ ${r ? r.name : 'مسوق مجهول'}: مقاس ${tx.size} / لون ${tx.color} (${tx.quantity} قطعة)`;
                    flowSymbol = '−';
                    amountStr = `${tx.quantity} قطعة`;
                  }
                }

                return (
                  <div
                    id={`tx-card-${tx.id}`}
                    key={tx.id}
                    className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-3xs flex items-center justify-between text-right"
                  >
                    {/* Visual indicators */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-grow pl-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPayment 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : isStockIn 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'bg-amber-50 text-amber-600'
                      }`}>
                        {isPayment ? <CreditCard className="w-4 h-4" /> : isStockIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5 min-w-0 text-right">
                        <div className="flex items-baseline gap-1.5 justify-start">
                          <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">{tx.id}</span>
                          <span className="text-[9px] text-gray-400 font-mono font-medium">{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-xs truncate leading-snug">{title}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-left font-sans">
                        <span className={`text-xs font-bold font-mono tracking-tight ${
                          isPayment 
                            ? 'text-emerald-600' 
                            : isStockIn 
                              ? 'text-indigo-600' 
                              : 'text-amber-600'
                        }`}>
                          {flowSymbol} {amountStr}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleTxDelete(tx.id)}
                        className="p-1 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-gray-300 hover:text-rose-500 transition-colors mr-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE FLUID FORM */}
      {activeSubView === 'add' && (
        <form onSubmit={handleSubmitTx} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm text-right">
          <div>
            <h2 className="text-base font-bold text-gray-900">إدراج قيد جديد في اليومية</h2>
            <p className="text-xs text-slate-400">سجل حركات تسليم العهد والأمانات، استلام المبالغ النقدية، أو شحن بضائع المستودع.</p>
          </div>

          {/* Form Type Tab Selection */}
          <div className="flex p-0.5 bg-slate-50 border border-gray-100 rounded-xl">
            {(['STOCK_IN', 'STOCK_OUT', 'PAYMENT'] as TransactionType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTxType(tab)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-transform ${
                  txType === tab 
                    ? tab === 'STOCK_IN' 
                      ? 'bg-indigo-600 text-white shadow-2xs' 
                      : tab === 'STOCK_OUT' 
                        ? 'bg-amber-500 text-white shadow-2xs' 
                        : 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'STOCK_IN' ? 'مستند توريد للمستودع' : tab === 'STOCK_OUT' ? 'تسليم أمانة لمسوق' : 'تحصيل واسترداد نقدي'}
              </button>
            ))}
          </div>

          {/* Core Fields wrapper */}
          <div className="space-y-3.5">
            {/* Date Picker */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 flex items-center justify-start gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                تاريخ تسجيل المعاملة *
              </label>
              <input
                id="tx-form-date"
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-right"
                required
              />
            </div>

            {/* IF STOCK TRANSACTION: SHOW PRODUCT SELECTION */}
            {(txType === 'STOCK_IN' || txType === 'STOCK_OUT') && (
              <>
                {/* Product Select */}
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 flex items-center justify-start gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    موديل قطعة الملابس *
                  </label>
                  {products.length === 0 ? (
                    <div className="text-xs text-rose-500 font-medium py-1">
                      لا توجد بضائع مسجلة بالدليل لتوريدها. يرجى أولاً تفعيل كتالوغ الموديلات.
                    </div>
                  ) : (
                    <select
                      id="tx-form-product"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-right"
                      required
                    >
                      <option value="">-- اختر موديل قطعة الملابس --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Sizes and Colors details populated on base select */}
                {currentSelectedProduct && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-right">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">المقاس المطلوب</label>
                      <select
                        id="tx-form-size"
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-1 text-right"
                        required
                      >
                        {currentSelectedProduct.sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">اللون المطلوب</label>
                      <select
                        id="tx-form-color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 text-right"
                        required
                      >
                        {currentSelectedProduct.colors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-100/50 mt-1 text-[10px] text-gray-500 flex justify-between font-mono">
                      <span>الرصيد الفعلي في المستودع حالياً:</span>
                      <span className="font-bold text-slate-800">{currentAvailableVariantStock} قطعة</span>
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">كمية القطع المُرادة *</label>
                  <input
                    id="tx-form-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={txQuantity}
                    onChange={(e) => setTxQuantity(e.target.value)}
                    placeholder="مثال: 25"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-right"
                    required
                  />
                </div>
              </>
            )}

            {/* IF TRANSACTION INVOLVES A RESELLER (STOCK_OUT or PAYMENT) */}
            {(txType === 'STOCK_OUT' || txType === 'PAYMENT') && (
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 flex items-center justify-start gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  الشريك المسوق المستلم للعملية *
                </label>
                {resellers.length === 0 ? (
                  <div className="text-xs text-rose-500 font-medium py-1">
                    لم تقم بتسجيل أي قائمة شركاء تجاريين بعد، يرجى تفعيل حساب شريك أولاً.
                  </div>
                ) : (
                  <select
                    id="tx-form-reseller"
                    value={selectedResellerId}
                    onChange={(e) => setSelectedResellerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-right"
                    required
                  >
                    <option value="">-- اختر الشريك المسوق --</option>
                    {resellers.map((r) => {
                      const stats = resellerStats[r.id] || { debt: 0 };
                      return (
                        <option key={r.id} value={r.id}>
                          {r.name} {stats.debt > 0 ? `(الديون الحالية: ${formatCurrency(stats.debt)})` : '(الحساب صافر)'}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}

            {/* IF THE TRANSACTION IS A PAYMENT */}
            {txType === 'PAYMENT' && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">مبلغ التحصيل النقدي (جنيه) *</label>
                <input
                  id="tx-form-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-right"
                  required
                />
              </div>
            )}

            {/* Notes / Narrative description */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 flex items-center justify-start gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                البيان وملاحظات القيد اليومية
              </label>
              <textarea
                id="tx-form-notes"
                value={txNotes}
                onChange={(e) => setTxNotes(e.target.value)}
                placeholder="اكتب بياناً وافياً للقيد، مثل أرقام سندات القبض، حوالات مصرفية، أو ملاحظات خاصة..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans h-20 text-right"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t border-gray-50 pt-4">
            <button
              id="tx-form-cancel"
              type="button"
              onClick={() => setActiveSubView('list')}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              إلغاء الأمر
            </button>
            <button
              id="tx-form-submit"
              type="submit"
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl active:scale-[0.98] transition-all shadow-md  ${
                txType === 'STOCK_IN' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' 
                  : txType === 'STOCK_OUT' 
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
              }`}
            >
              ترحيل وتسجيل القيد في الدفتر
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
