import { app } from '@/lib/firebase.js';
import { ref, get, child, update, getDatabase, push, runTransaction } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export const depositsService = {
  // Fetch all deposits
  async getAllDeposits(filters = {}) {
    try {
      const dbRef = ref(getDatabase(app));
      const depositsSnap = await get(child(dbRef, 'deposits'));
      let deposits = [];

      if (depositsSnap.exists()) {
        const depositsData = depositsSnap.val();

        Object.entries(depositsData).forEach(([key, value]) => {
          deposits.push({
            id: key,
            ...value,
          });
        });

        // Apply filters
        if (filters.status) {
          deposits = deposits.filter(d => d.status === filters.status);
        }

        if (filters.userId) {
          deposits = deposits.filter(d => d.userId === filters.userId);
        }

        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate).getTime();
          const end = new Date(filters.endDate).getTime();
          deposits = deposits.filter(d => {
            const depositDate = new Date(d.submittedDate).getTime();
            return depositDate >= start && depositDate <= end;
          });
        }

        // Sort by date descending
        deposits.sort((a, b) => {
          const dateA = new Date(a.submittedDate || 0).getTime();
          const dateB = new Date(b.submittedDate || 0).getTime();
          return dateB - dateA;
        });
      }

      return deposits;
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  },

  // Fetch pending deposits
  async getPendingDeposits() {
    try {
      const allDeposits = await this.getAllDeposits({ status: 'pending' });
      return allDeposits;
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
      throw error;
    }
  },

  // Get pending deposits count
  async getPendingCount() {
    try {
      const pending = await this.getPendingDeposits();
      return pending.length;
    } catch (error) {
      console.error('Error fetching pending count:', error);
      throw error;
    }
  },

  // Get deposit by ID
  async getDepositById(depositId) {
    try {
      const dbRef = ref(getDatabase(app));
      const depositSnap = await get(child(dbRef, `deposits/${depositId}`));

      if (depositSnap.exists()) {
        return {
          id: depositId,
          ...depositSnap.val(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching deposit:', error);
      throw error;
    }
  },

  // Get deposits by user ID
  async getDepositsByUserId(userId) {
    try {
      const allDeposits = await this.getAllDeposits({ userId });
      return allDeposits;
    } catch (error) {
      console.error('Error fetching user deposits:', error);
      throw error;
    }
  },

  // Create new deposit (user submits)
  async createDeposit(depositData) {
    try {
      const dbRef = ref(getDatabase(app), 'deposits');
      const newDepositRef = push(dbRef);
      
      const deposit = {
        ...depositData,
        status: 'pending',
        submittedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await update(newDepositRef, deposit);
      
      return {
        id: newDepositRef.key,
        ...deposit,
      };
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  },

  // Approve deposit
  async approveDeposit(depositId, userId, amount) {
    try {
      const dbRef = ref(getDatabase(app));
      const depositRef = ref(getDatabase(app), `deposits/${depositId}`);

      const [depositSnap, userSnap] = await Promise.all([
        get(child(dbRef, `deposits/${depositId}`)),
        get(child(dbRef, `users/${userId}`)),
      ]);

      if (!depositSnap.exists()) throw new Error('Deposit not found');
      if (!userSnap.exists()) throw new Error('User not found');
      if (depositSnap.val().status !== 'pending') {
        throw new Error('This deposit has already been processed');
      }

      const userData = userSnap.val();
      const depositData = depositSnap.val();
      if (depositData.userId !== userId) throw new Error('Deposit user mismatch');
      const approvedAmount = Number(depositData.amount);
      if (!Number.isFinite(approvedAmount) || approvedAmount <= 0 || approvedAmount !== Number(amount)) {
        throw new Error('Invalid deposit amount');
      }
      const claimResult = await runTransaction(depositRef, currentDeposit => {
        if (!currentDeposit || currentDeposit.status !== 'pending') return;
        return { ...currentDeposit, status: 'approved' };
      });
      if (!claimResult.committed) throw new Error('This deposit has already been processed');
      const currentBalance = parseFloat(userData.accountBalance || userData.balance || 0);
      const now = new Date().toISOString();
      const adminUid = getAuth(app).currentUser?.uid;
      if (!adminUid) throw new Error('Admin authentication required');
      const activityKey = push(child(dbRef, 'activityLogs')).key;
      const transactionKey = depositData.transactionId || depositId;
      const userTransactionPath = `users/${userId}/transactions/${transactionKey}`;
      const newBalance = currentBalance + approvedAmount;
      const updates = {
        [`deposits/${depositId}/status`]: 'approved',
        [`deposits/${depositId}/approvedDate`]: now,
        [`deposits/${depositId}/approvedBy`]: adminUid,
        [`${userTransactionPath}/status`]: 'approved',
        [`${userTransactionPath}/approvedAt`]: now,
        [`${userTransactionPath}/approvedBy`]: adminUid,
        [`users/${userId}/accountBalance`]: newBalance,
        [`users/${userId}/balance`]: newBalance,
        [`users/${userId}/totalDeposit`]: parseFloat(userData.totalDeposit || 0) + approvedAmount,
        [`users/${userId}/lastUpdated`]: now,
        [`activityLogs/${activityKey}`]: {
          type: 'deposit_approved', userId, depositId, amount: approvedAmount, performedBy: adminUid,
          message: `Deposit of $${approvedAmount} approved`, timestamp: now,
        },
        [`transactions/${transactionKey}`]: {
          type: 'deposit', status: 'approved', userId, depositId,
          transactionId: transactionKey, amount: approvedAmount, createdAt: depositData.createdAt || depositData.submittedDate,
          approvedAt: now, approvedBy: adminUid,
        },
      };

      await update(dbRef, updates);

      return true;
    } catch (error) {
      console.error('Error approving deposit:', error);
      throw error;
    }
  },

  // Reject deposit
  async rejectDeposit(depositId, userId, reason = '') {
    try {
      const dbRef = ref(getDatabase(app));
      const depositRef = ref(getDatabase(app), `deposits/${depositId}`);
      const depositSnap = await get(child(dbRef, `deposits/${depositId}`));
      if (!depositSnap.exists()) throw new Error('Deposit not found');
      if (depositSnap.val().status !== 'pending') {
        throw new Error('This deposit has already been processed');
      }
      if (depositSnap.val().userId !== userId) throw new Error('Deposit user mismatch');
      const claimResult = await runTransaction(depositRef, currentDeposit => {
        if (!currentDeposit || currentDeposit.status !== 'pending') return;
        return { ...currentDeposit, status: 'rejected' };
      });
      if (!claimResult.committed) throw new Error('This deposit has already been processed');

      const now = new Date().toISOString();
      const adminUid = getAuth(app).currentUser?.uid;
      if (!adminUid) throw new Error('Admin authentication required');
      const activityKey = push(child(dbRef, 'activityLogs')).key;
      const transactionKey = depositSnap.val().transactionId || depositId;
      await update(dbRef, {
        [`deposits/${depositId}/status`]: 'rejected',
        [`deposits/${depositId}/rejectedDate`]: now,
        [`deposits/${depositId}/rejectionReason`]: reason,
        [`deposits/${depositId}/rejectedBy`]: adminUid,
        [`users/${userId}/transactions/${transactionKey}/status`]: 'rejected',
        [`users/${userId}/transactions/${transactionKey}/rejectedAt`]: now,
        [`users/${userId}/transactions/${transactionKey}/rejectedBy`]: adminUid,
        [`users/${userId}/transactions/${transactionKey}/rejectionReason`]: reason,
        [`activityLogs/${activityKey}`]: {
          type: 'deposit_rejected', userId, depositId,
          amount: depositSnap.val().amount, reason, performedBy: adminUid,
          message: `Deposit rejected${reason ? `: ${reason}` : ''}`,
          timestamp: now,
        },
      });

      return true;
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      throw error;
    }
  },

  // Get deposit statistics
  async getDepositStats() {
    try {
      const dbRef = ref(getDatabase(app));
      const depositsSnap = await get(child(dbRef, 'deposits'));
      
      let totalDeposits = 0;
      let pendingCount = 0;
      let approvedCount = 0;
      let rejectedCount = 0;
      let totalAmount = 0;
      let pendingAmount = 0;

      if (depositsSnap.exists()) {
        const depositsData = depositsSnap.val();

        Object.values(depositsData).forEach(deposit => {
          totalDeposits++;
          const amount = parseFloat(deposit.amount || 0);
          totalAmount += amount;

          if (deposit.status === 'pending') {
            pendingCount++;
            pendingAmount += amount;
          } else if (deposit.status === 'approved') {
            approvedCount++;
          } else if (deposit.status === 'rejected') {
            rejectedCount++;
          }
        });
      }

      return {
        totalDeposits,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalAmount,
        pendingAmount,
      };
    } catch (error) {
      console.error('Error fetching deposit stats:', error);
      throw error;
    }
  },

  // Search deposits
  async searchDeposits(searchValue) {
    try {
      const allDeposits = await this.getAllDeposits();
      
      return allDeposits.filter(deposit =>
        deposit.userId?.toLowerCase().includes(searchValue.toLowerCase()) ||
        deposit.reference?.toLowerCase().includes(searchValue.toLowerCase()) ||
        deposit.paymentMethod?.toLowerCase().includes(searchValue.toLowerCase()) ||
        String(deposit.amount).includes(searchValue)
      );
    } catch (error) {
      console.error('Error searching deposits:', error);
      throw error;
    }
  },
};
