/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Database, 
  Moon, 
  Sun, 
  LogOut, 
  RotateCcw, 
  CheckCircle2, 
  Smartphone,
  Tag,
  Users,
  FileText
} from 'lucide-react';

export default function ProfileModule() {
  const { 
    user, 
    logout, 
    darkMode, 
    toggleDarkMode, 
    products, 
    resellers, 
    transactions, 
    showCustomConfirm,
    showCustomAlert,
    loginWithGoogle
  } = useApp();

  const handleResetData = () => {
    showCustomConfirm(
      'تأكيد التهيئة وإعادة الضبط',
      'هل أنت متأكد تمامًا من رغبتك في مسح قاعدة البيانات ومزامنة الحساب بالكامل؟ سيتم إعادة ضبط جميع المنتجات، والشركاء المسوقين، والعمليات، وحسابات المخزون. سيبدأ النظام فارغًا بنسبة 100%.',
      () => {
        localStorage.clear();
        window.location.reload();
      }
    );
  };

  return (
    <div className="space-y-6 pb-24 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">إعدادات الحساب والمزامنة</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-sans mt-0.5">مراقبة حالة الاتصال والربط ونظام الألوان</p>
      </div>

      {/* 1. USER IDENTITY CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-4 flex-row-reverse text-right">
          <div className="relative">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-inner"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
                <User className="w-8 h-8" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="نشط ومزامن" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-950 dark:text-gray-50 truncate">
              {user?.displayName || 'مسؤول الحساب (Guest)'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {user?.email || 'وضع استعراض الحساب المحلي'}
            </p>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-2.5 ${
              user 
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-500 border border-amber-100/50 dark:border-amber-900/50'
            }`}>
              {user ? 'مأمن ومزامن بـ Firebase' : 'حساب محلي (ضيف)'}
            </span>

            {!user && (
              <div className="mt-3 flex justify-start">
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:text-white rounded-xl text-[11px] font-bold shadow-md shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  ربط وتأمين بـ Google Auth
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATS & STATUS SYNC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-400 inline-flex items-center gap-1.5 flex-row-reverse">
            <Database className="w-3.5 h-3.5" />
            حالة السحابة وقواعد البيانات
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-right">
              <span className="text-gray-400">نمط التخزين</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 font-sans">
                {user ? 'سحابي (Firestore)' : 'محلي (LocalStorage)'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-right">
              <span className="text-gray-400">معدل التحديث</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">فوري تلقائي</span>
            </div>

            <div className="flex justify-between items-center text-xs text-right">
              <span className="text-gray-400">حالة الربط</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 flex-row-reverse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                متصل ومحمي
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-400 inline-flex items-center gap-1.5 flex-row-reverse">
            <Smartphone className="w-3.5 h-3.5" />
            إحصائيات الملف اليومي
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] text-gray-400 block mb-0.5">الموديلات</span>
              <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 font-sans block">{products.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] text-gray-400 block mb-0.5">المسوقين</span>
              <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 font-sans block">{resellers.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] text-gray-400 block mb-0.5">العمليات</span>
              <span className="font-semibold text-xs text-amber-600 dark:text-amber-400 font-sans block">{transactions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SETTINGS OPTIONS TRAY */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-slate-800">
        
        {/* Toggle Dark Mode */}
        <div className="flex items-center justify-between p-4 flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse text-right">
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/45 text-orange-600 dark:text-orange-400">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">المظهر الداكن (Dark Mode)</h4>
              <p className="text-[10px] text-gray-400">تعديل المظهر لحماية مجهود العين</p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? '-translate-x-6' : '-translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Data resetting button */}
        <div className="flex items-center justify-between p-4 flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse text-right">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">مسح وتهيئة البيانات</h4>
              <p className="text-[10px] text-gray-400">شطب السجلات الحالية وتهيئة الملف للبدء نظيف تماماً</p>
            </div>
          </div>

          <button
            onClick={handleResetData}
            className="px-3.5 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl hover:bg-rose-100/60 dark:hover:bg-rose-950/20 active:scale-95 transition-all"
          >
            مسح شامل
          </button>
        </div>

        {/* Account logout */}
        {user && (
          <div className="flex items-center justify-between p-4 flex-row-reverse">
            <div className="flex items-center gap-3 flex-row-reverse text-right">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">تسجيل الخروج</h4>
                <p className="text-[10px] text-gray-400">حفظ الجلسة وإعادة تأمين قيودك اليومية بكلمة المرور</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              تسجيل الخروج
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
