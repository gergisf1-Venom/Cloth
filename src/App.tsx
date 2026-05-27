/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ProductsModule from './components/ProductsModule';
import ResellersModule from './components/ResellersModule';
import InventoryModule from './components/InventoryModule';
import TransactionsModule from './components/TransactionsModule';
import ProfileModule from './components/ProfileModule';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Boxes, 
  FileText, 
  HelpCircle,
  Zap,
  RotateCcw,
  User,
  ShieldCheck,
  Globe,
  Settings,
  Moon,
  Sun
} from 'lucide-react';

type Tab = 'dashboard' | 'products' | 'resellers' | 'inventory' | 'transactions' | 'profile';

function MainAppShell() {
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  
  const { 
    user, 
    loadingAuth, 
    loginWithGoogle, 
    logout, 
    confirmDialog, 
    alertDialog, 
    setAlertDialog,
    darkMode,
    toggleDarkMode,
    showCustomConfirm
  } = useApp();

  // Guard state for local Guest view
  const [bypassLogin, setBypassLogin] = useState(() => {
    return localStorage.getItem('erp_bypass_login') === 'true';
  });

  // Cross-module transaction trigger bridges
  const [pendingTxType, setPendingTxType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'PAYMENT' | null>(null);
  const [pendingResellerId, setPendingResellerId] = useState<string | null>(null);

  // Trigger from Dashboard Quick Action
  const handleOpenQuickTx = (type: 'STOCK_IN' | 'STOCK_OUT' | 'PAYMENT') => {
    setPendingTxType(type);
    setPendingResellerId(null);
    setCurrentTab('transactions');
  };

  // Trigger from Reseller Profile Actions
  const handleTriggerResellerTx = (resellerId: string, type: 'STOCK_OUT' | 'PAYMENT') => {
    setPendingTxType(type);
    setPendingResellerId(resellerId);
    setCurrentTab('transactions');
  };

  // Clean trigger states after consumption
  const handleClearTriggers = () => {
    setPendingTxType(null);
    setPendingResellerId(null);
  };

  const handleResetData = () => {
    showCustomConfirm(
      'تأكيد التهيئة وإعادة الضبط',
      'هل أنت متأكد تمامًا من رغبتك في مسح قاعدة البيانات بالكامل؟ سيؤدي هذا إلى إعادة ضبط جميع المنتجات، والشركاء المسوقين، والعمليات، وحسابات المخزون لتجربة فحص نظيف تمامًا.',
      () => {
        localStorage.clear();
        window.location.reload();
      }
    );
  };

  const handleEnterAsGuest = () => {
    localStorage.setItem('erp_bypass_login', 'true');
    setBypassLogin(true);
  };

  const handleLogoutWithBypassReset = async () => {
    localStorage.removeItem('erp_bypass_login');
    setBypassLogin(false);
    await logout();
  };

  // Rendering Loader
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center font-sans" dir="rtl">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">يرجى الانتظار...</p>
        <p className="text-xs text-slate-400 mt-1">تأمين حماية الجلسة والربط بـ Firebase</p>
      </div>
    );
  }

  // 1. GATEWAY VIEW: Require login unless authenticated OR bypassed as Guest
  if (!user && !bypassLogin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-10 font-sans" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden p-6 md:p-8 space-y-8 text-center">
          
          <div className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white font-black text-2xl">
              S
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-950 dark:text-gray-50 tracking-tight leading-none">بوابة التوزيع SewnERP</h1>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1.5 inline-block">نظام حوكمة ومخزون ملابس الجملة</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            تطبيق متكامل وسريع مصمم لشركات وموزعي قطاع الملابس. يقوم بحساب مخازن الموديلات، مبيعات المسوقين، حركات الإرجاع، ومتابعة مدفوعات ديون الشركاء بالجنيه المصري.
          </p>

          <div className="space-y-3 pt-2">
            {/* Google Sign In option */}
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white transition-all active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              تأمين الجلسة وربط سحابي (Google Auth)
            </button>

            {/* Guest / Bypass login option */}
            <button
              onClick={handleEnterAsGuest}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              تجاوز سريع (وضع الاختبار المحلي كضيف)
            </button>
          </div>

          <div className="pt-4 border-t border-gray-50 dark:border-slate-800 text-[10px] text-gray-400 font-medium">
            مؤمن كودياً ببروتوكولات Firebase وملتزم بمعايير السرعة صفر تواصل
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 antialiased flex flex-col md:flex-row-reverse" dir="rtl" lang="ar">
      
      {/* 2. DESKTOP NAVIGATION SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-l border-slate-800 text-slate-100 p-5 self-stretch">
        <div className="pb-6 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20">
              S
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-none text-white">استوديو SewnERP</h1>
              <span className="text-[10px] text-indigo-400 font-bold uppercase mt-1 inline-block">بوابة البيع والتوزيع بالجملة</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation list */}
        <nav className="space-y-1.5 flex-grow">
          <button
            id="tab-btn-dashboard"
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 ml-1" />
            لوحة التحكم العامة
          </button>

          <button
            id="tab-btn-products"
            onClick={() => setCurrentTab('products')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'products' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 ml-1" />
            كتالوج المنتجات
          </button>

          <button
            id="tab-btn-resellers"
            onClick={() => setCurrentTab('resellers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'resellers' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 ml-1" />
            المسوقين (الشركاء)
          </button>

          <button
            id="tab-btn-inventory"
            onClick={() => setCurrentTab('inventory')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'inventory' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4 ml-1" />
            المخزون الفعلي
          </button>

          <button
            id="tab-btn-transactions"
            onClick={() => setCurrentTab('transactions')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'transactions' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 ml-1" />
            دفتر القيود والعمليات
          </button>

          <button
            id="tab-btn-profile"
            onClick={() => setCurrentTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'profile' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 ml-1" />
            الإعدادات والمزامنة
          </button>
        </nav>

        {/* Footer actions helper */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5 text-[11px] text-slate-400">
          {user ? (
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/60 flex items-center gap-2.5 flex-row-reverse text-right">
              {user.photoURL ? (
                <img src={user.photoURL} alt="V" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-100">U</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-200 truncate leading-none text-[10px]">{user.displayName}</p>
                <button onClick={handleLogoutWithBypassReset} className="text-rose-400 underline dark:text-rose-400 hover:text-rose-300 mt-1 block font-semibold text-[9px]">خروج</button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-900/30">
              <p className="font-semibold text-amber-500 flex items-center gap-1.5 mb-1 flex-row-reverse text-right">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                وضع الحساب المحلي (الضيف)
              </p>
              <p className="leading-relaxed">قاعدة البيانات محلية. لربطها سحابياً احفظها بـ Google Auth.</p>
              <button 
                onClick={handleLogoutWithBypassReset} 
                className="mt-2 text-indigo-400 hover:underline font-bold text-[10px] block"
              >
                التحويل لحساب سحابي
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>إصدار التطبيق v1.5</span>
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="تغيير المظهر"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative overflow-y-auto">
        <div className="w-full max-w-lg mx-auto md:max-w-xl lg:max-w-2xl px-4 py-6 md:py-10">
          
          {/* Active Router views */}
          {currentTab === 'dashboard' && (
            <Dashboard 
              onNavigate={(tab) => setCurrentTab(tab as Tab)} 
              onOpenQuickTx={handleOpenQuickTx} 
            />
          )}

          {currentTab === 'products' && (
            <ProductsModule />
          )}

          {currentTab === 'resellers' && (
            <ResellersModule onTriggerTxForm={handleTriggerResellerTx} />
          )}

          {currentTab === 'inventory' && (
            <InventoryModule onOpenQuickTx={handleOpenQuickTx} />
          )}

          {currentTab === 'transactions' && (
            <TransactionsModule 
              initialFormType={pendingTxType}
              initialResellerId={pendingResellerId}
              onClearFormTriggers={handleClearTriggers}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileModule />
          )}

        </div>

        {/* Dynamic Mobile diagnostic info strip */}
        <div className="text-center pb-24 pt-2 text-[10px] text-gray-400 font-medium">
          SewnERP v1.5 • {user ? 'وضع مزامنة Firebase السحابي' : 'وضع التصفح المحلي المستقل'} • <button onClick={handleResetData} className="underline text-gray-500 font-bold cursor-pointer">مسح شامل لجميع السجلات</button>
        </div>
      </main>

      {/* 4. COMFORTABLE MOBILE BOTTOM NAVIGATION DOCK */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-around px-2 py-1 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] z-50" dir="rtl">
        <button
          id="mob-btn-dashboard"
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all py-1 px-2.5 rounded-xl ${
            currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          <span>الرئيسية</span>
        </button>

        <button
          id="mob-btn-products"
          onClick={() => setCurrentTab('products')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all py-1 px-2.5 rounded-xl ${
            currentTab === 'products' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Package className="w-4.5 h-4.5" />
          <span>الموديلات</span>
        </button>

        <button
          id="mob-btn-resellers"
          onClick={() => setCurrentTab('resellers')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all py-1 px-2.5 rounded-xl ${
            currentTab === 'resellers' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>المسوقين</span>
        </button>

        <button
          id="mob-btn-inventory"
          onClick={() => setCurrentTab('inventory')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all py-1 px-2.5 rounded-xl ${
            currentTab === 'inventory' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Boxes className="w-4.5 h-4.5" />
          <span>المخزون</span>
        </button>

        <button
          id="mob-btn-transactions"
          onClick={() => setCurrentTab('transactions')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all py-1 px-2.5 rounded-xl ${
            currentTab === 'transactions' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          <span>القيود</span>
        </button>

        <button
          id="mob-btn-profile"
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all py-1 px-2.5 rounded-xl ${
            currentTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Settings className="w-4.5 h-4.5" />
          <span>الإعدادات</span>
        </button>
      </div>

      {/* 5. CUSTOM CONFIRM DIALOG OVERLAY */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800 text-right animate-fade-in">
            <h3 className="text-base font-bold text-gray-950 dark:text-gray-50">{confirmDialog.title}</h3>
            <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{confirmDialog.message}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={confirmDialog.onCancel}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-850 active:scale-95 transition-all cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl active:scale-95 transition-all shadow-md shadow-rose-600/10 cursor-pointer"
              >
                تأكيد وبدء العمل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CUSTOM ALERT DIALOG OVERLAY */}
      {alertDialog && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800 text-center animate-fade-in">
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4 ${
              alertDialog.type === 'error' 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450' 
                : alertDialog.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-500'
                : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
            }`}>
              <HelpCircle className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-gray-950 dark:text-gray-50">{alertDialog.title}</h3>
            <p className="mt-3.5 text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">{alertDialog.message}</p>
            <button
              onClick={() => setAlertDialog(null)}
              className="mt-6 w-full px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl active:scale-95 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              حسناً، استمر
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
