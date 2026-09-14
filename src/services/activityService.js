import { app } from '@/lib/firebase.js';
import { ref, get, child, getDatabase, push, update } from 'firebase/database';

const isPermissionDenied = (error) => String(error?.message || error || '').includes('PERMISSION_DENIED') || String(error?.message || error || '').includes('permission denied');

export const activityService = {
  // Fetch all activity logs
  async getAllActivityLogs(limit = 50) {
    try {
      const dbRef = ref(getDatabase(app));
      const logsSnap = await get(child(dbRef, 'activityLogs'));
      let logs = [];

      if (logsSnap.exists()) {
        const logsData = logsSnap.val();

        Object.entries(logsData).forEach(([key, value]) => {
          logs.push({
            id: key,
            ...value,
          });
        });

        // Sort by timestamp descending
        logs.sort((a, b) => {
          const dateA = new Date(a.timestamp || 0).getTime();
          const dateB = new Date(b.timestamp || 0).getTime();
          return dateB - dateA;
        });
      }

      return logs.slice(0, limit);
    } catch (error) {
      if (isPermissionDenied(error)) {
        return [];
      }
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  // Get activity logs by user ID
  async getActivityLogsByUserId(userId, limit = 20) {
    try {
      const allLogs = await this.getAllActivityLogs(200);
      return allLogs.filter(log => log.userId === userId).slice(0, limit);
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      throw error;
    }
  },

  // Get activity logs by type
  async getActivityLogsByType(type, limit = 20) {
    try {
      const allLogs = await this.getAllActivityLogs(200);
      return allLogs.filter(log => log.type === type).slice(0, limit);
    } catch (error) {
      console.error('Error fetching activity logs by type:', error);
      throw error;
    }
  },

  // Create activity log
  async createActivityLog(logData) {
    try {
      const activityRef = ref(getDatabase(app), 'activityLogs');
      const newLogRef = push(activityRef);
      
      const log = {
        ...logData,
        timestamp: new Date().toISOString(),
      };

      await update(newLogRef, log);
      
      return {
        id: newLogRef.key,
        ...log,
      };
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  },
};
