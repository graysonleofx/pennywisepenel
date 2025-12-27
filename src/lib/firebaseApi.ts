import { app } from '../lib/firebase.js';
import { getDatabase, ref, get } from 'firebase/database';

export async function getAdminStats() {
  const db = getDatabase(app);

  const [usersSnap, txSnap] = await Promise.all([
    get(ref(db, 'users')),
    get(ref(db, 'transactions'))
  ]);

  const usersObj = usersSnap.exists() ? usersSnap.val() : {};
  const txObj = txSnap.exists() ? txSnap.val() : {};

  const users = Array.isArray(usersObj)
    ? usersObj.filter(Boolean).map((u, i) => ({ uid: String(i), ...u }))
    : Object.keys(usersObj).map((k) => ({ uid: k, ...usersObj[k] }));

  const transactions = Array.isArray(txObj)
    ? txObj.filter(Boolean).map((t, i) => ({ id: String(i), ...t }))
    : Object.keys(txObj).map((k) => ({ id: k, ...txObj[k] }));

  const totalUsers = users.length;
  const totalBalance = users.reduce((s, u) => s + (Number(u.balance) || 0), 0);
  const totalProfit = users.reduce((s, u) => s + (Number(u.totalProfit ?? u.profit) || 0), 0);
  const totalTransactions = transactions.length;

  const sortByDateDesc = (a, b, field = 'createdAt') => {
    const ta = Number(a?.[field] ?? a?.timestamp ?? 0);
    const tb = Number(b?.[field] ?? b?.timestamp ?? 0);
    return tb - ta;
  };

  const recentUsers = [...users].sort((a, b) => sortByDateDesc(a, b)).slice(0, 5);
  const recentTransactions = [...transactions].sort((a, b) => sortByDateDesc(a, b, 'timestamp')).slice(0, 5);

  return {
    totalUsers,
    totalBalance,
    totalProfit,
    totalTransactions,
    recentUsers,
    recentTransactions,
  };
}