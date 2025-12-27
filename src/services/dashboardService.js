import { app } from '@/lib/firebase.js';
import { ref, get, child, remove, update, getDatabase } from 'firebase/database';

export const dashboardService = {
  // Fetch total stats
  async getStats() {
    try {
      const dbRef = ref(getDatabase(app));

      // Get all users
      const usersSnap = await get(child(dbRef, 'users'));
      let totalUsers = 0;
      let totalBalance = 0;
      let totalProfit = 0;

      if (usersSnap.exists()) {
        const usersData = usersSnap.val();
        totalUsers = Object.keys(usersData).length;

        Object.values(usersData).forEach(user => {
          totalBalance += user.balance || 0;
          totalProfit += user.totalProfit || 0;
        });
      }

      return {
        totalUsers,
        totalBalance,
        totalProfit,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Fetch recent users
  async getRecentUsers(limitCount = 5) {
    try {
      const dbRef = ref(getDatabase(app));
      const usersSnap = await get(child(dbRef, 'users'));
      const users = [];

      if (usersSnap.exists()) {
        const usersData = usersSnap.val();

        Object.entries(usersData).forEach(([key, value]) => {
          users.push({
            id: key,
            ...value,
          });
        });

        // Sort by createdAt in descending order and limit
        users.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        return users.slice(0, limitCount);
      }

      return [];
    } catch (error) {
      console.error('Error fetching recent users:', error);
      throw error;
    }
  },

  // Fetch recent transactions
  // async getRecentTransactions(limitCount = 5) {
  //   try {
  //     const dbRef = ref(getDatabase(app));
  //     const transSnap = await get(child(dbRef, 'transactions'));
  //     const transactions = [];

  //     if (transSnap.exists()) {
  //       const transData = transSnap.val();

  //       Object.entries(transData).forEach(([key, value]) => {
  //         transactions.push({
  //           id: key,
  //           ...value,
  //         });
  //       });

  //       // Sort by timestamp in descending order and limit
  //       transactions.sort((a, b) => {
  //         const dateA = new Date(a.timestamp || 0).getTime();
  //         const dateB = new Date(b.timestamp || 0).getTime();
  //         return dateB - dateA;
  //       });

  //       return transactions.slice(0, limitCount);
  //     }

  //     return [];
  //   } catch (error) {
  //     console.error('Error fetching transactions:', error);
  //     throw error;
  //   }
  // },

  // Fetch all users with search
  async getAllUsers(searchValue = '') {
    try {
      const dbRef = ref(getDatabase(app));
      const usersSnap = await get(child(dbRef, 'users'));
      let users = [];

      if (usersSnap.exists()) {
        const usersData = usersSnap.val();

        Object.entries(usersData).forEach(([key, value]) => {
          users.push({
            id: key,
            ...value,
          });
        });

        // Filter by search value
        if (searchValue) {
          users = users.filter(user =>
            user.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchValue.toLowerCase())
          );
        }
      }

      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Fetch all transactions
  // async getAllTransactions() {
  //   try {
  //     const dbRef = ref(getDatabase(app));
  //     const transSnap = await get(child(dbRef, 'transactions'));
  //     const transactions = [];

  //     if (transSnap.exists()) {
  //       const transData = transSnap.val();

  //       Object.entries(transData).forEach(([key, value]) => {
  //         transactions.push({
  //           id: key,
  //           ...value,
  //         });
  //       });

  //       transactions.sort((a, b) => {
  //         const dateA = new Date(a.timestamp || 0).getTime();
  //         const dateB = new Date(b.timestamp || 0).getTime();
  //         return dateB - dateA;
  //       });
  //     }

  //     return transactions;
  //   } catch (error) {
  //     console.error('Error fetching transactions:', error);
  //     throw error;
  //   }
  // },

  // Update user
  async updateUser(userId, updatedData) {
    try {
      const userRef = ref(getDatabase(app), `users/${userId}`);
      await update(userRef, updatedData);
      return { id: userId, ...updatedData };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const userRef = ref(getDatabase(app), `users/${userId}`);
      await remove(userRef);
      return userId;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const dbRef = ref(getDatabase(app));
      const userSnap = await get(child(dbRef, `users/${userId}`));

      if (userSnap.exists()) {
        return {
          id: userId,
          ...userSnap.val(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
};