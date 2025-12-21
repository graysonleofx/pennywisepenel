import { useState, useEffect } from 'react';
import { ref, onValue, update, remove, set, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Transaction } from '@/types/user';
import { mockTransactions } from '@/data/mockData';

export function useFirebaseTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const transactionsRef = ref(database, 'transactions');
    
    const unsubscribe = onValue(
      transactionsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const transactionsArray: Transaction[] = Object.entries(data).map(([id, txData]) => ({
            id,
            ...(txData as Omit<Transaction, 'id'>)
          }));
          // Sort by date descending
          transactionsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(transactionsArray);
        } else {
          // Use mock data as fallback
          setTransactions(mockTransactions);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase transactions error:', error);
        setError(error.message);
        // Fallback to mock data
        setTransactions(mockTransactions);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      const txRef = ref(database, `transactions/${transactionId}`);
      await update(txRef, updates);
      return true;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates } : t));
      return false;
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const txRef = ref(database, `transactions/${transactionId}`);
      await remove(txRef);
      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      return false;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const txRef = ref(database, 'transactions');
      const newTxRef = push(txRef);
      await set(newTxRef, transaction);
      return newTxRef.key;
    } catch (err) {
      console.error('Error adding transaction:', err);
      const newId = Date.now().toString();
      setTransactions(prev => [{ ...transaction, id: newId }, ...prev]);
      return newId;
    }
  };

  return {
    transactions,
    loading,
    error,
    updateTransaction,
    deleteTransaction,
    addTransaction,
  };
}
