/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { 
  Package, 
  Trash2, 
  Edit3, 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  Grid, 
  Tag, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

export default function ProductsModule() {
  const { products, addProduct, updateProduct, deleteProduct, stockMap, productStockTotals, showCustomAlert, showCustomConfirm } = useApp();
  
  // Views navigation
  const [activeSubView, setActiveSubView] = useState<'list' | 'add' | 'edit' | 'detail'>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  
  // Size & Color presets and input tags
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [formColors, setFormColors] = useState<string[]>(['أسود', 'أبيض', 'كحلي']);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  // Preset templates helper for fast UI creation
  const defaultSizePresets = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Uni'];
  const defaultColorPresets = ['أسود', 'أبيض', 'كحلي', 'رمادي', 'أحمر', 'بيج', 'أزرق'];

  // Handle Init Form
  const openAddForm = () => {
    setFormName('');
    setFormCategory('');
    setFormCostPrice('');
    setFormSellingPrice('');
    setFormSizes(['S', 'M', 'L', 'XL']);
    setFormColors(['أسود', 'أبيض', 'كحلي']);
    setActiveSubView('add');
  };

  const openEditForm = (p: Product) => {
    setSelectedProduct(p);
    setFormName(p.name);
    setFormCategory(p.category || '');
    setFormCostPrice(p.costPrice.toString());
    setFormSellingPrice(p.sellingPrice.toString());
    setFormSizes(p.sizes);
    setFormColors(p.colors);
    setActiveSubView('edit');
  };

  // Tag list editing helpers
  const appendSize = () => {
    const s = sizeInput.trim().toUpperCase();
    if (s && !formSizes.includes(s)) {
      setFormSizes([...formSizes, s]);
    }
    setSizeInput('');
  };

  const removeSize = (s: string) => {
    setFormSizes(formSizes.filter(item => item !== s));
  };

  const toggleSizePreset = (s: string) => {
    if (formSizes.includes(s)) {
      setFormSizes(formSizes.filter(item => item !== s));
    } else {
      setFormSizes([...formSizes, s]);
    }
  };

  const appendColor = () => {
    const c = colorInput.trim();
    if (c && !formColors.includes(c)) {
      setFormColors([...formColors, c]);
    }
    setColorInput('');
  };

  const removeColor = (c: string) => {
    setFormColors(formColors.filter(item => item !== c));
  };

  const toggleColorPreset = (c: string) => {
    if (formColors.includes(c)) {
      setFormColors(formColors.filter(item => item !== c));
    } else {
      setFormColors([...formColors, c]);
    }
  };

  // Submit Handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCostPrice || !formSellingPrice || formSizes.length === 0 || formColors.length === 0) {
      showCustomAlert('تنبيه الحساب والمخزن', 'يرجى تعبئة كافة الحقول المطلوبة واختيار مقاس وتوليفة ألوان واحدة على الأقل لهذا الموديل.', 'warning');
      return;
    }

    const payload = {
      name: formName,
      category: formCategory || 'غير مصنف',
      sizes: formSizes,
      colors: formColors,
      costPrice: parseFloat(formCostPrice) || 0,
      sellingPrice: parseFloat(formSellingPrice) || 0,
    };

    if (activeSubView === 'add') {
      addProduct(payload);
    } else if (activeSubView === 'edit' && selectedProduct) {
      updateProduct(selectedProduct.id, payload);
    }

    setActiveSubView('list');
    setSelectedProduct(null);
  };

  const handleDelete = (id: string) => {
    showCustomConfirm(
      'تأكيد حذف الموديل',
      'هل أنت متأكد تمامًا من رغبتك في حذف هذا الموديل؟ سيتم حذف جميع قيود الشحن والتوريد وعمليات تسليم الأمانة المرتبطة به لضمان توازن حسابات المخزون.',
      () => {
        deleteProduct(id);
        setActiveSubView('list');
      }
    );
  };

  return (
    <div className="space-y-6 pb-24" dir="rtl">
      {/* Dynamic Sub-header Navigation */}
      {activeSubView !== 'list' && (
        <button
          onClick={() => setActiveSubView('list')}
          className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold px-2 py-1 bg-indigo-50 rounded-lg w-fit active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5 ml-1" />
          العودة للموديلات
        </button>
      )}

      {/* VIEW 1: PRODUCT LISTING */}
      {activeSubView === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">كتالوج الموديلات والمنتجات</h1>
              <p className="text-xs text-slate-500 font-medium">عرض جميع الموديلات، التكلفة والأسعار وعينات المقاسات</p>
            </div>
            
            <button
              id="btn-add-product"
              onClick={openAddForm}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
            >
              <Plus className="w-4 h-4 ml-1" />
              أضف موديل جديد
            </button>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 py-16 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-indigo-950 font-bold text-base">قاعدة البيانات فارغة تماماً</h3>
              <p className="text-gray-500 text-xs mt-1.5 max-w-xs mx-auto">
                لم يتم إنشاء موديلات ملابس بعد. أضف موديلك الأول مع حاسبة التكاليف وتوليفة المقاسات المعتمدة.
              </p>
              <button
                id="btn-empty-add-product"
                onClick={openAddForm}
                className="mt-5 px-4 py-2 font-semibold text-xs text-white bg-indigo-600 rounded-xl shadow-xs"
              >
                أضف موديلك الأول الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {products.map((p) => {
                const totalStock = productStockTotals[p.id] ?? 0;
                return (
                  <div
                    id={`prd-card-${p.id}`}
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setActiveSubView('detail');
                    }}
                    className="p-4 bg-white hover:bg-slate-50 border border-gray-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between relative group text-right"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 font-bold bg-slate-100 text-slate-600 rounded-md">
                          {p.category}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 font-medium">
                          {p.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm truncate">{p.name}</h3>
                      
                      <div className="flex gap-4 text-xs font-semibold py-0.5">
                        <div>
                          <span className="text-gray-400 font-normal">تكلفة التصنيع:</span>{' '}
                          <span className="text-gray-600 font-mono">{p.costPrice} جنيه</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-normal">سعر الجملة:</span>{' '}
                          <span className="text-emerald-600 font-mono">{p.sellingPrice} جنيه</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-normal">الهامش:</span>{' '}
                          <span className="text-indigo-600 font-mono">
                            {Math.round(((p.sellingPrice - p.costPrice) / p.costPrice) * 100 || 0)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] text-gray-400 py-0.5 font-medium ml-1">الأحجام:</span>
                        {p.sizes.slice(0, 4).map(s => (
                          <span key={s} className="text-[9px] px-1 font-mono font-bold bg-gray-50 border border-gray-100 rounded-xs text-slate-500">{s}</span>
                        ))}
                        {p.sizes.length > 4 && <span className="text-[9px] text-gray-400 font-mono">+{p.sizes.length - 4}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(p);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors border border-transparent"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-left">
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">المتوفر بالمخازن</span>
                        <span className={`font-mono text-xs font-bold ${totalStock === 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                          {totalStock === 0 ? 'بدون رصيد مخزني' : `${totalStock} قطعة`}
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
        <form onSubmit={handleSaveProduct} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-5 shadow-sm text-right">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {activeSubView === 'add' ? 'تسجيل موديل جديد للمجموعة' : `تعديل بيانات الموديل: ${selectedProduct?.name}`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">خصص ثنائيات الألوان/المقاسات المعتمدة وحدد تكلفة الشراء وسعر الجملة.</p>
          </div>

          {/* Catalog Information */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">اسم الموديل / المنتج المطبوع *</label>
              <input
                id="product-form-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: فستان مخمل طويل، سترة كابتشو بحياكة فرنسية"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">التصنيف أو الفئة</label>
              <input
                id="product-form-category"
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="مثال: فساتين، بناطيل، جواكت، شتوي"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
              />
            </div>

            {/* Financial Calculations */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  تكلفة التصنيع والإنتاج (جنيه) *
                </label>
                <input
                  id="product-form-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-right"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  سعر بيع الجملة للمسوقين (جنيه) *
                </label>
                <input
                  id="product-form-selling"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formSellingPrice}
                  onChange={(e) => setFormSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-right"
                  required
                />
              </div>
            </div>

            {/* Sizes Array Config */}
            <div className="space-y-2 border-t border-gray-50 pt-3">
              <label className="text-xs font-bold text-gray-700 block">المقاسات المعتمدة لهذا الموديل *</label>
              <div className="flex flex-wrap gap-1 bg-slate-50/50 p-2 border border-gray-100 rounded-xl">
                {formSizes.length === 0 ? (
                  <span className="text-[10px] text-gray-400 italic">لا توجد مقاسات مختارة. اضغط على الخيارات السريعة أدناه لتفعيل المقاس.</span>
                ) : (
                  formSizes.map((s) => (
                    <span 
                      key={s} 
                      className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md"
                    >
                      {s}
                      <button type="button" onClick={() => removeSize(s)} className="p-0.5 text-indigo-400 hover:text-indigo-800 font-normal">×</button>
                    </span>
                  ))
                )}
              </div>
              
              {/* Manual Input + Presets Row */}
              <div className="flex gap-2">
                <input
                  id="product-form-size-input"
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="اكتب المقاس يدوياً (مثال L، 38L، Standard)"
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none flex-1 font-mono text-right"
                />
                <button
                  type="button"
                  onClick={appendSize}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200"
                >
                  أضف مقاساً
                </button>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase self-center ml-1">تحديد سريع:</span>
                {defaultSizePresets.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSizePreset(s)}
                    className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md transition-all ${
                      formSizes.includes(s) 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Array Config */}
            <div className="space-y-2 border-t border-gray-50 pt-3">
              <label className="text-xs font-bold text-gray-700 block">الألوان المتاحة للموديل *</label>
              <div className="flex flex-wrap gap-1 bg-slate-50/50 p-2 border border-gray-100 rounded-xl">
                {formColors.length === 0 ? (
                  <span className="text-[10px] text-gray-400 italic">لا توجد ألوان محددة. أضف أو اختر من الأسفل.</span>
                ) : (
                  formColors.map((c) => (
                    <span 
                      key={c} 
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-md"
                    >
                      {c}
                      <button type="button" onClick={() => removeColor(c)} className="p-0.5 text-amber-500 hover:text-amber-800 font-normal">×</button>
                    </span>
                  ))
                )}
              </div>
              
              {/* Manual Input + Presets Row */}
              <div className="flex gap-2">
                <input
                  id="product-form-color-input"
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="أضف اسم لون (كريستال، زيتي، صوف حراري)"
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none flex-1 text-right"
                />
                <button
                  type="button"
                  onClick={appendColor}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200"
                >
                  أضف اللون
                </button>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase self-center ml-1">تحديد سريع:</span>
                {defaultColorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleColorPreset(c)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${
                      formColors.includes(c) 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t border-gray-50 pt-4">
            {activeSubView === 'edit' && (
              <button
                type="button"
                onClick={() => handleDelete(selectedProduct!.id)}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl hover:bg-rose-100 active:scale-95 transition-all ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5 ml-1" />
                حذف هذا الموديل نهائياً
              </button>
            )}
            
            <button
              id="product-form-cancel"
              type="button"
              onClick={() => setActiveSubView('list')}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              إلغاء الأمر
            </button>
            <button
              id="product-form-submit"
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              حفظ وتثبيت البيانات
            </button>
          </div>
        </form>
      )}

      {/* VIEW 3: STYLISH PRODUCT DETAILS & VARIANT STOCK MATRIX */}
      {activeSubView === 'detail' && selectedProduct && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 text-right">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  {selectedProduct.category}
                </span>
                <span className="text-[10px] font-mono text-gray-400 font-medium">{selectedProduct.id}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">تاريخ التسجيل: {new Date(selectedProduct.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>

            {/* Price block info */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50/50 p-3.5 border border-slate-100/60 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">تكلفة القطعة</span>
                <span className="text-xs font-bold text-gray-900 font-mono">{selectedProduct.costPrice} جنيه</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">البيع بالجملة</span>
                <span className="text-xs font-bold text-emerald-600 font-mono">{selectedProduct.sellingPrice} جنيه</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">هامش الربح لكل قطعة</span>
                <span className="text-xs font-bold text-indigo-600 font-mono">
                  {(selectedProduct.sellingPrice - selectedProduct.costPrice).toFixed(2)} جنيه
                </span>
              </div>
            </div>

            {/* Sizes & Colors dynamic Stock Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-gray-800 tracking-wider uppercase flex items-center gap-1.5 justify-start">
                <Grid className="w-3.5 h-3.5" />
                مصفوفة حالة المخزون الفعلي بالمستودع
              </h3>
              
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-gray-100 text-gray-500 font-bold">
                    <tr>
                      <th className="p-3 text-right">المتغير (المقاس / اللون)</th>
                      <th className="p-3 text-left">الرصيد المتوفر حالياً</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {selectedProduct.sizes.flatMap(size => 
                      selectedProduct.colors.map(color => {
                        const key = `${size} / ${color}`;
                        const qty = stockMap[selectedProduct.id]?.[key] ?? 0;
                        return (
                          <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 font-semibold text-gray-800 flex items-center gap-1.5 justify-start">
                              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-mono text-[10px] font-extrabold">{size}</span>
                              <span className="text-slate-400 font-medium">/</span>
                              <span className="text-gray-600 font-medium">{color}</span>
                            </td>
                            <td className="p-3 text-left">
                              <span className={`px-2 py-0.5 font-mono font-bold rounded-full text-[10px] ${
                                qty === 0 
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100/40' 
                                  : qty < 5 
                                    ? 'bg-amber-100 text-amber-700 font-semibold' 
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {qty === 0 ? 'نفذ بالكامل (0 قطع)' : `${qty} قطعة متوفرة`}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions for this product */}
            <div className="flex gap-2.5 pt-2">
              <button
                id="btn-edit-selected-product"
                onClick={() => openEditForm(selectedProduct)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-slate-100 text-gray-800 rounded-xl hover:bg-slate-200 active:scale-95 transition-all border border-slate-200/40"
              >
                <Edit3 className="w-4 h-4 ml-1" />
                تعديل وتحديث بيانات الموديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
