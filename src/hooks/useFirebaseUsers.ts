import { useState, useEffect } from 'react';
import { ref, onValue, update, remove, set, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { User } from '@/types/user';
import { mockUsers } from '@/data/mockData';

export function useFirebaseUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(
      usersRef, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const usersArray: User[] = Object.entries(data).map(([id, userData]) => ({
            id,
            ...(userData as Omit<User, 'id'>)
          }));
          setUsers(usersArray);
        } else {
          // Use mock data as fallback when no Firebase data exists
          setUsers(mockUsers);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase users error:', error);
        setError(error.message);
        // Fallback to mock data on error
        setUsers(mockUsers);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, updates);
      return true;
    } catch (err) {
      console.error('Error updating user:', err);
      // Fallback: update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      // Fallback: update local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      return false;
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      const usersRef = ref(database, 'users');
      const newUserRef = push(usersRef);
      await set(newUserRef, user);
      return newUserRef.key;
    } catch (err) {
      console.error('Error adding user:', err);
      // Fallback: add to local state
      const newId = Date.now().toString();
      setUsers(prev => [...prev, { ...user, id: newId }]);
      return newId;
    }
  };

  return {
    users,
    loading,
    error,
    updateUser,
    deleteUser,
    addUser,
  };
}
