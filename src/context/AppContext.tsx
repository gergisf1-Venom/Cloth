/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Reseller, Transaction, LowStockAlert } from '../types';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface AppContextProps {
  products: Product[];
  resellers: Reseller[];
  transactions: Transaction[];
  
  // Create / Update / Delete for Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Create / Update / Delete for Resellers
  addReseller: (reseller: Omit<Reseller, 'id' | 'createdAt'>) => Reseller;
  updateReseller: (id: string, updates: Partial<Reseller>) => void;
  deleteReseller: (id: string) => void;

  // Create / Delete for Transactions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;

  // Real-time calculated views and utilities
  stockMap: Record<string, Record<string, number>>; // productId -> "size_color" -> stock
  productStockTotals: Record<string, number>; // productId -> total stock quantity
  resellerStats: Record<string, {
    totalQuantityTaken: number;
    totalAssignedValue: number;
    totalPaid: number;
    debt: number;
  }>;
  dashboardMetrics: {
    totalInventoryCostValue: number;
    totalInventorySellValue: number;
    totalOutstandingDebt: number;
    totalPaidAmount: number;
    activeResellersCount: number;
    topResellers: Array<{ reseller: Reseller; volume: number; value: number }>;
    lowStockAlerts: LowStockAlert[];
  };

  // Auth States and Methods
  user: FirebaseUser | null;
  loadingAuth: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Custom alert & confirm dialogues
  confirmDialog: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null;
  setConfirmDialog: React.Dispatch<React.SetStateAction<any>>;
  alertDialog: {
    title: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
  } | null;
  setAlertDialog: React.Dispatch<React.SetStateAction<any>>;
  showCustomAlert: (title: string, message: string, type?: 'info' | 'error' | 'success' | 'warning') => void;
  showCustomConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. AUTH & USER PROFILE
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 2. DARK MODE (Local & synced to db)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('erp_dark') === 'true';
  });

  // Apply darkMode to HTML element classes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('erp_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('erp_dark', 'false');
    }
  }, [darkMode]);

  // 3. CENTRAL DATA STATES
  const [products, setProducts] = useState<Product[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 4. CUSTOM DIALOGS
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [alertDialog, setAlertDialog] = useState<any>(null);

  const showCustomAlert = (title: string, message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    setAlertDialog({ title, message, type });
  };

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmDialog(null);
      }
    });
  };

  // Listen to Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  // Sync / load products, resellers, and transactions in real-time
  useEffect(() => {
    if (!user) {
      // Revert/load local storage if guest mode
      const localProducts = localStorage.getItem('erp_products');
      const localResellers = localStorage.getItem('erp_resellers');
      const localTransactions = localStorage.getItem('erp_transactions');
      setProducts(localProducts ? JSON.parse(localProducts) : []);
      setResellers(localResellers ? JSON.parse(localResellers) : []);
      setTransactions(localTransactions ? JSON.parse(localTransactions) : []);
      return;
    }

    const userId = user.uid;

    // A. Sync Products
    const unsubProducts = onSnapshot(
      collection(db, 'users', userId, 'products'),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Product);
        });
        setProducts(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/products`);
      }
    );

    // B. Sync Resellers
    const unsubResellers = onSnapshot(
      collection(db, 'users', userId, 'resellers'),
      (snapshot) => {
        const list: Reseller[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Reseller);
        });
        setResellers(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/resellers`);
      }
    );

    // C. Sync Transactions
    const unsubTransactions = onSnapshot(
      collection(db, 'users', userId, 'transactions'),
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Transaction);
        });
        setTransactions(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/transactions`);
      }
    );

    // D. Sync User Document for Settings (Like dark mode)
    const unsubUser = onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.darkMode !== undefined) {
            setDarkMode(data.darkMode);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    );

    return () => {
      unsubProducts();
      unsubResellers();
      unsubTransactions();
      unsubUser();
    };
  }, [user]);

  // Persist guest offline data to local storage when not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('erp_products', JSON.stringify(products));
    }
  }, [products, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('erp_resellers', JSON.stringify(resellers));
    }
  }, [resellers, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('erp_transactions', JSON.stringify(transactions));
    }
  }, [transactions, user]);

  // Generate unique ID
  const generateId = (prefix: string) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomSuffix}`;
  };

  // Google Sign In
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoadingAuth(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const uid = result.user.uid;
        const profilePath = `users/${uid}`;
        let existingDarkMode = darkMode;
        try {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.darkMode !== undefined) {
              existingDarkMode = data.darkMode;
              setDarkMode(existingDarkMode);
            }
          }
        } catch (e) {
          console.log('No user document found, creating one...');
        }

        await setDoc(doc(db, 'users', uid), {
          userId: uid,
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          darkMode: existingDarkMode,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e: any) {
      console.error('Google Sign-In Error:', e);
      showCustomAlert(
        'نشاط معطل أو محظور', 
        'لم نتمكن من فتح نافذة تسجيل الدخول بـ Google بسبب سياسات iFrame. يمكنك تجربة الولوج كـ "ضيف" ومواصلة استخدام واستعراض التطبيق بنطاق كامل فوراً.', 
        'warning'
      );
    } finally {
      setLoadingAuth(false);
    }
  };

  const loginAsGuest = () => {
    setUser(null);
    setLoadingAuth(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (user) {
      const pathForWrite = `users/${user.uid}`;
      setDoc(doc(db, 'users', user.uid), {
        darkMode: nextVal,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, pathForWrite);
      });
    }
  };

  // PRODUCTS CRUD
  const addProduct = (p: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...p,
      id: generateId('PRD'),
      createdAt: new Date().toISOString(),
    };
    if (user) {
      const path = `users/${user.uid}/products`;
      setDoc(doc(db, path, newProduct.id), newProduct).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    } else {
      setProducts((prev) => [newProduct, ...prev]);
    }
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (user) {
      const target = products.find((p) => p.id === id);
      if (target) {
        const updated = { ...target, ...updates };
        const path = `users/${user.uid}/products`;
        setDoc(doc(db, path, id), updated).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, path);
        });
      }
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
  };

  const deleteProduct = (id: string) => {
    if (user) {
      const path = `users/${user.uid}/products`;
      deleteDoc(doc(db, path, id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
      // also clean up any transactions associated with this product on firestore
      transactions.forEach((t) => {
        if (t.type !== 'PAYMENT' && t.productId === id) {
          const tPath = `users/${user.uid}/transactions`;
          deleteDoc(doc(db, tPath, t.id)).catch((err) => {
            handleFirestoreError(err, OperationType.DELETE, tPath);
          });
        }
      });
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTransactions((prev) => prev.filter((t) => !(t.type !== 'PAYMENT' && t.productId === id)));
    }
  };

  // RESELLERS CRUD
  const addReseller = (r: Omit<Reseller, 'id' | 'createdAt'>) => {
    const newReseller: Reseller = {
      ...r,
      id: generateId('RSL'),
      createdAt: new Date().toISOString(),
    };
    if (user) {
      const path = `users/${user.uid}/resellers`;
      setDoc(doc(db, path, newReseller.id), newReseller).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    } else {
      setResellers((prev) => [newReseller, ...prev]);
    }
    return newReseller;
  };

  const updateReseller = (id: string, updates: Partial<Reseller>) => {
    if (user) {
      const target = resellers.find((r) => r.id === id);
      if (target) {
        const updated = { ...target, ...updates };
        const path = `users/${user.uid}/resellers`;
        setDoc(doc(db, path, id), updated).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, path);
        });
      }
    } else {
      setResellers((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    }
  };

  const deleteReseller = (id: string) => {
    if (user) {
      const path = `users/${user.uid}/resellers`;
      deleteDoc(doc(db, path, id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
      // clean up associated transactions
      transactions.forEach((t) => {
        if (t.resellerId === id) {
          const tPath = `users/${user.uid}/transactions`;
          deleteDoc(doc(db, tPath, t.id)).catch((err) => {
            handleFirestoreError(err, OperationType.DELETE, tPath);
          });
        }
      });
    } else {
      setResellers((prev) => prev.filter((r) => r.id !== id));
      setTransactions((prev) => prev.filter((t) => t.resellerId !== id));
    }
  };

  // TRANSACTIONS CRUD
  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: generateId('TX'),
    } as Transaction;

    if (user) {
      const path = `users/${user.uid}/transactions`;
      setDoc(doc(db, path, newTransaction.id), newTransaction).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    } else {
      setTransactions((prev) => [newTransaction, ...prev]);
    }
    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    if (user) {
      const path = `users/${user.uid}/transactions`;
      deleteDoc(doc(db, path, id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Real-time calculated views and utilities
  const stockMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    
    // Initialize empty maps for existing products to easily display variants
    products.forEach((p) => {
      map[p.id] = {};
      p.sizes.forEach((s) => {
        p.colors.forEach((c) => {
          map[p.id][`${s} / ${c}`] = 0;
        });
      });
    });

    // Compute from transactions
    transactions.forEach((tx) => {
      if (tx.type === 'STOCK_IN' || tx.type === 'STOCK_OUT') {
        const { productId, size, color, quantity } = tx;
        if (!map[productId]) map[productId] = {};
        const key = `${size} / ${color}`;
        if (map[productId][key] === undefined) {
          map[productId][key] = 0;
        }
        if (tx.type === 'STOCK_IN') {
          map[productId][key] += quantity;
        } else {
          map[productId][key] -= quantity;
        }
      }
    });

    return map;
  }, [products, transactions]);

  // Product Totals stock quantity
  const productStockTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    products.forEach((p) => {
      totals[p.id] = 0;
      const productVariants = stockMap[p.id] || {};
      Object.values(productVariants).forEach((qty) => {
        totals[p.id] += qty as number;
      });
    });
    return totals;
  }, [products, stockMap]);

  // Reseller calculations: total taken, value, paid, debt
  const resellerStats: Record<string, {
    totalQuantityTaken: number;
    totalAssignedValue: number;
    totalPaid: number;
    debt: number;
  }> = useMemo(() => {
    const stats: Record<string, {
      totalQuantityTaken: number;
      totalAssignedValue: number;
      totalPaid: number;
      debt: number;
    }> = {};

    resellers.forEach((r) => {
      stats[r.id] = {
        totalQuantityTaken: 0,
        totalAssignedValue: 0,
        totalPaid: 0,
        debt: 0,
      };
    });

    // Populate stats from transactions
    transactions.forEach((tx) => {
      if (tx.type === 'STOCK_OUT') {
        const rId = tx.resellerId;
        if (rId && stats[rId]) {
          const product = products.find((p) => p.id === tx.productId);
          const price = product ? product.sellingPrice : 0;
          stats[rId].totalQuantityTaken += tx.quantity;
          stats[rId].totalAssignedValue += tx.quantity * price;
        }
      } else if (tx.type === 'PAYMENT') {
        const rId = tx.resellerId;
        if (rId && stats[rId]) {
          stats[rId].totalPaid += tx.amount;
        }
      }
    });

    // Calculate absolute debts
    Object.keys(stats).forEach((rId) => {
      stats[rId].debt = stats[rId].totalAssignedValue - stats[rId].totalPaid;
    });

    return stats;
  }, [resellers, transactions, products]);

  // Dashboard calculations
  const dashboardMetrics = useMemo(() => {
    let totalInventoryCostValue = 0;
    let totalInventorySellValue = 0;

    products.forEach((p) => {
      const stockQty = productStockTotals[p.id] || 0;
      totalInventoryCostValue += stockQty * p.costPrice;
      totalInventorySellValue += stockQty * p.sellingPrice;
    });

    let totalOutstandingDebt = 0;
    let totalPaidAmount = 0;
    let activeResellersCount = 0;

    Object.values(resellerStats).forEach((stats) => {
      totalOutstandingDebt += stats.debt;
      totalPaidAmount += stats.totalPaid;
      if (stats.totalQuantityTaken > 0 || stats.totalPaid > 0) {
        activeResellersCount++;
      }
    });

    const topResellers = resellers
      .map((r) => {
        const stats = resellerStats[r.id] || { totalQuantityTaken: 0, totalAssignedValue: 0 };
        return {
          reseller: r,
          volume: stats.totalQuantityTaken,
          value: stats.totalAssignedValue,
        };
      })
      .filter((item) => item.volume > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const lowStockAlerts: LowStockAlert[] = [];
    products.forEach((p) => {
      p.sizes.forEach((s) => {
        p.colors.forEach((c) => {
          const qty = stockMap[p.id]?.[`${s} / ${c}`] ?? 0;
          if (qty < 5) {
            lowStockAlerts.push({
              product: p,
              size: s,
              color: c,
              stock: qty,
            });
          }
        });
      });
    });

    return {
      totalInventoryCostValue,
      totalInventorySellValue,
      totalOutstandingDebt,
      totalPaidAmount,
      activeResellersCount,
      topResellers,
      lowStockAlerts: lowStockAlerts.sort((a, b) => a.stock - b.stock),
    };
  }, [products, productStockTotals, resellerStats, resellers, stockMap]);

  return (
    <AppContext.Provider
      value={{
        products,
        resellers,
        transactions,
        addProduct,
        updateProduct,
        deleteProduct,
        addReseller,
        updateReseller,
        deleteReseller,
        addTransaction,
        deleteTransaction,
        stockMap,
        productStockTotals,
        resellerStats,
        dashboardMetrics,

        // Auth
        user,
        loadingAuth,
        loginWithGoogle,
        loginAsGuest,
        logout,

        // Dark Mode
        darkMode,
        toggleDarkMode,

        // Custom dialogues
        confirmDialog,
        setConfirmDialog,
        alertDialog,
        setAlertDialog,
        showCustomAlert,
        showCustomConfirm
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
