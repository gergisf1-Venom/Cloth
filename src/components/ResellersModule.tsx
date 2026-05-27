/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reseller } from '../types';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  ArrowUpRight, 
  CreditCard, 
  DollarSign, 
  Instagram, 
  Activity 
} from 'lucide-react';

interface ResellersModuleProps {
  onTriggerTxForm: (resellerId: string, type: 'STOCK_OUT' | 'PAYMENT') => void;
}

export default function ResellersModule({ onTriggerTxForm }: ResellersModuleProps) {
  const { resellers, addReseller, updateReseller, deleteReseller, resellerStats, transactions, products, showCustomAlert, showCustomConfirm } = useApp();

  // Views Navigation
  const [activeSubView, setActiveSubView] = useState<'list' | 'add' | 'edit' | 'detail'>('list');
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSocial, setFormSocial] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + " جنيه";
  };

  const openAddForm = () => {
    setFormName('');
    setFormPhone('');
    setFormSocial('');
    setActiveSubView('add');
  };

  const openEditForm = (r: Reseller) => {
    setSelectedReseller(r);
    setFormName(r.name);
    setFormPhone(r.phone);
    setFormSocial(r.socialMedia || '');
    setActiveSubView('edit');
  };

  const handleSaveReseller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      showCustomAlert('بيانات الشريك ناقصة', 'الاسم الكامل ورقم الهاتف مطلوبان لتسجيل الشريك المسوق.', 'warning');
      return;
    }

    const payload = {
      name: formName,
      phone: formPhone,
      socialMedia: formSocial || undefined,
    };

    if (activeSubView === 'add') {
      addReseller(payload);
    } else if (activeSubView === 'edit' && selectedReseller) {
      updateReseller(selectedReseller.id, payload);
    }

    setActiveSubView('list');
    setSelectedReseller(null);
  };

  const handleDelete = (id: string) => {
    showCustomConfirm(
      'تأكيد حذف المسوق',
      'هل أنت متأكد تمامًا من رغبتك في حذف هذا المسوق؟ سيؤدي ذلك أيضاً لحذف كافة عمليات تسليم البضاعة والمدفوعات المرتبطة به للحفاظ على نزاهة الحسابات وموازين المراجعة.',
      () => {
        deleteReseller(id);
        setActiveSubView('list');
      }
    );
  };

  // Get transaction ledger of specific reseller
  const resellerTxList = selectedReseller 
    ? transactions.filter(t => t.resellerId === selectedReseller.id)
    : [];

  return (
    <div className="space-y-6 pb-24" dir="rtl">
      {/* Sub-header Navigation */}
      {activeSubView !== 'list' && (
        <button
          onClick={() => setActiveSubView('list')}
          className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold px-2 py-1 bg-indigo-50 rounded-lg w-fit active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5 ml-1" />
          العودة للقائمة
        </button>
      )}

      {/* VIEW 1: RESELLERS DIRECTORY LIST */}
      {activeSubView === 'list' && (
        <div className="space-y-4 text-right">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">شبكة المسوقين والشركاء (الأمانات)</h1>
              <p className="text-xs text-slate-500 font-medium font-sans">تتبع بضاعة العهدة المسلمة لهم بصفة أمانة، الحسابات والديون والتحصيل اليومي</p>
            </div>
            
            <button
              id="btn-add-reseller"
              onClick={openAddForm}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
            >
              <Plus className="w-4 h-4 ml-1" />
              تسجيل مسوق جديد
            </button>
          </div>

          {resellers.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 py-16 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-indigo-950 font-bold text-base">لا يوجد أي مسوقين مسجلين بعد</h3>
              <p className="text-gray-500 text-xs mt-1.5 max-w-xs mx-auto text-center">
                لم يتم تسجيل أي صفحات للسوشيال فاشن أو موزعاً معتمداً عهدةً. أضف مسوقك الأول في النظام حالياً.
              </p>
              <button
                id="btn-empty-add-reseller"
                onClick={openAddForm}
                className="mt-5 px-4 py-2 font-semibold text-xs text-white bg-indigo-600 rounded-xl shadow-xs"
              >
                المسوق الأول للتوزيع (+)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {resellers.map((r) => {
                const stats = resellerStats[r.id] || { totalQuantityTaken: 0, totalAssignedValue: 0, totalPaid: 0, debt: 0 };
                return (
                  <div
                    id={`reseller-card-${r.id}`}
                    key={r.id}
                    onClick={() => {
                      setSelectedReseller(r);
                      setActiveSubView('detail');
                    }}
                    className="p-4 bg-white hover:bg-slate-50 border border-gray-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer relative flex flex-col justify-between space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400 font-medium">
                            {r.id}
                          </span>
                          {r.socialMedia && (
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded flex items-center gap-0.5 font-mono">
                              <Instagram className="w-2.5 h-2.5" />
                              {r.socialMedia}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">{r.name}</h3>
                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 font-mono">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          {r.phone}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(r);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors border border-transparent"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reseller Balances stats block */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50/70 p-2 border border-slate-100/30 rounded-lg text-center text-[10px] font-sans">
                      <div>
                        <span className="text-gray-400 font-semibold block uppercase">القطع المستلمة أمانة</span>
                        <span className="font-mono text-xs font-bold text-gray-800">{stats.totalQuantityTaken} قطعة</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block uppercase">إجمالي المدفوعات</span>
                        <span className="font-mono text-xs font-bold text-emerald-600">{formatCurrency(stats.totalPaid)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block uppercase">الديون المتبقية</span>
                        <span className={`font-mono text-xs font-bold ${stats.debt > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          {formatCurrency(stats.debt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ADD / EDIT FLUID FORM */}
      {(activeSubView === 'add' || activeSubView === 'edit') && (
        <form onSubmit={handleSaveReseller} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-5 shadow-sm text-right">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {activeSubView === 'add' ? 'تسجيل شريك جديد' : `تعديل ملف الشريك: ${selectedReseller?.name}`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">أنشئ بطاقة الشريك لمتابعة توازن وتفاصيل جرد البضاعة والعهد الأمانة المسلمة.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">اسم المسوق / الشريك الكامل *</label>
              <input
                id="reseller-form-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: دلال الحربي (فاشن انستغرام)"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">رقم الهاتف أو تطبيق الواتساب *</label>
              <input
                id="reseller-form-phone"
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="مثال: 0544321234"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-right"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">حساب السوشيال ميديا للمتجر (أو رابط خارجي - اختياري)</label>
              <div className="relative">
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold font-mono">@</span>
                <input
                  id="reseller-form-social"
                  type="text"
                  value={formSocial}
                  onChange={(e) => setFormSocial(e.target.value)}
                  placeholder="dalal_boutique"
                  className="w-full pr-7 pl-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-right"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t border-gray-50 pt-4">
            {activeSubView === 'edit' && (
              <button
                type="button"
                onClick={() => handleDelete(selectedReseller!.id)}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl hover:bg-rose-100 active:scale-95 transition-all ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5 ml-1" />
                حذف حساب المسوق
              </button>
            )}
            
            <button
              id="reseller-form-cancel"
              type="button"
              onClick={() => setActiveSubView('list')}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              إلغاء الأمر
            </button>
            <button
              id="reseller-form-submit"
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              حفظ بيانات الشريك
            </button>
          </div>
        </form>
      )}

      {/* VIEW 3: COMPREHENSIVE RESELLER DOSSIER & TRANSACTIONS LOG */}
      {activeSubView === 'detail' && selectedReseller && (() => {
        const stats = resellerStats[selectedReseller.id] || { totalQuantityTaken: 0, totalAssignedValue: 0, totalPaid: 0, debt: 0 };
        return (
          <div className="space-y-4">
            {/* Dossier Header */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 text-right">
              <div className="flex justify-between items-start">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-gray-400 font-medium">{selectedReseller.id}</span>
                    {selectedReseller.socialMedia && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-bold font-mono">
                        <Instagram className="w-3 h-3 text-indigo-500 font-bold" />
                        {selectedReseller.socialMedia}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedReseller.name}</h2>
                  <p className="text-xs text-slate-500 font-medium font-mono mt-1 flex items-center gap-1.5 justify-start">
                    <Phone className="w-3.5 h-3.5 text-slate-300" />
                    {selectedReseller.phone}
                  </p>
                </div>
                
                <button
                  onClick={() => openEditForm(selectedReseller)}
                  className="p-2 hover:bg-slate-50 border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 transition-all font-semibold"
                >
                  تعديل الملف
                </button>
              </div>

              {/* Financial Balance Status */}
              <div className="flex flex-col gap-3 rounded-xl p-4 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white relative overflow-hidden text-right">
                <div className="absolute left-0 bottom-0 translate-x-3 translate-y-3 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                  <span className="text-xs text-indigo-200 font-semibold uppercase">دفتر الحساب الجاري المالي</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stats.debt > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {stats.debt > 0 ? 'توجد مبالغ مستحقة بذمته' : 'الحساب جاري وصافر'}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-200/80 block font-medium">الديون المتبقية بذمته</span>
                    <span className="text-2xl font-bold font-mono tracking-tight text-rose-300">{formatCurrency(stats.debt)}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-indigo-200/80 block font-medium">إجمالي القطوعات المسددة</span>
                    <span className="text-base font-bold font-mono text-emerald-400">{formatCurrency(stats.totalPaid)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-indigo-200 border-t border-white/10 pt-2.5">
                  <span>قيمة عهدة البضائع المستلمة: <span className="font-mono text-white">{formatCurrency(stats.totalAssignedValue || 0)}</span></span>
                  <span>إجمالي عهدة قطع الأمانة: <span className="font-mono text-white">{stats.totalQuantityTaken} قطعة</span></span>
                </div>
              </div>

              {/* CRM Trigger Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  id="crm-btn-dispatch"
                  onClick={() => onTriggerTxForm(selectedReseller.id, 'STOCK_OUT')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition-all text-xs font-bold rounded-xl shadow-xs"
                >
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                  تسليم قطع أمانة
                </button>
                <button
                  id="crm-btn-payment"
                  onClick={() => onTriggerTxForm(selectedReseller.id, 'PAYMENT')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all text-xs font-bold rounded-xl shadow-xs"
                >
                  <CreditCard className="w-4 h-4 ml-1" />
                  تسجيل دفعة مسددة
                </button>
              </div>
            </div>

            {/* Individual Journal/Transactions Ledger */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs text-right">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest mb-3.5 flex items-center gap-1.5 justify-start">
                <Activity className="w-4 h-4 text-indigo-500" />
                اليومية وحركات الحساب ({resellerTxList.length})
              </h3>

              {resellerTxList.length === 0 ? (
                <div className="text-center py-7 text-xs text-gray-400 italic">
                  لا توجد حركات عهدة أو مستندات تحصيل مالي مسجلة لهذا المسوق بعد.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-right">
                  {resellerTxList.map((tx) => {
                    const isPayment = tx.type === 'PAYMENT';
                    let description = '';
                    let subDetail = '';

                    if (!isPayment) {
                      const product = products.find((p) => p.id === tx.productId);
                      description = product ? product.name : `منتج [${tx.productId}]`;
                      subDetail = `المقاس: ${tx.size} | اللون: ${tx.color} | الكمية: ${tx.quantity} قطعة`;
                    } else {
                      description = 'استلام دفعة مالية مسددة';
                      subDetail = tx.notes || 'تسوية نقدية أو حوالة سريعة';
                    }

                    const resellerItemValue = tx.quantity * (products.find(p => p.id === tx.productId)?.sellingPrice || 0);

                    return (
                      <div 
                        key={tx.id} 
                        className="flex justify-between items-center p-2.5 border border-gray-100 rounded-xl bg-slate-50/50 text-right"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1 pl-3 text-right">
                          <div className="flex items-center gap-1.5 justify-start">
                            <span className={`text-[8px] uppercase font-bold px-1 rounded-sm ${isPayment ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {isPayment ? 'دفعة مسددة' : 'تسليم بضاعة'}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <p className="text-xs font-semibold text-gray-800 truncate">{description}</p>
                          <p className="text-[10px] text-gray-500">{subDetail}</p>
                        </div>

                        <div className="text-left flex-shrink-0">
                          <span className={`text-xs font-bold font-mono tracking-tight ${isPayment ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPayment ? `+ ${formatCurrency(tx.amount)}` : `- ${formatCurrency(resellerItemValue)}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
