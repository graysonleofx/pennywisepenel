import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserCard } from '@/components/dashboard/UserCard.jsx';
import { UserEditModal } from '@/components/dashboard/UserEditModal.jsx';
import { UserDetailModal } from '@/components/dashboard/UserDetailModal.jsx';
import { mockUsers } from '@/data/mockData';
// import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Firebase imports
import { app } from '../lib/firebase.js';
import { ref, getDatabase, onValue, update as firebaseUpdate } from 'firebase/database';


const UsersPage = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchValue, setSearchValue] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const { toast } = useToast();

  const sanitizeBalance = (raw) => {
    const rawBalance = raw ?? 0;
    const cleaned = String(rawBalance).replace(/,/g, '').replace(/[^0-9.\-]+/g, '');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Subscribe to /users in Firebase Realtime Database
  useEffect(() => {
    const usersRef = ref(getDatabase(app), 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const val = snapshot.val() || {};
      console.debug('Firebase /users snapshot:', val);
      // snapshot is an object keyed by uid; map to User[]
      const list = Object.entries(val).map(([key, raw]) => {
        const r = raw;
        // normalize account balance from possible formats (strings with symbols/commas etc.)
        const rawBalance = r.accountBalance ?? r.balance ?? r.account_balance ?? 0;
        const safeBalance = sanitizeBalance(rawBalance);
        console.debug('user raw balance:', { id: key, rawBalance, safeBalance });

        return {
          // Ensure id matches the DB key so we can update by id
          id: key,
          fullName: r.fullName || r.fullname || r.username || r.name || '',
          email: r.email || '',
          country: r.country || '',
          // preserve other fields, but override/ensure a numeric accountBalance
          ...r,
          accountBalance: safeBalance,
        };
      });
      setUsers(list);
    }, (err) => {
      console.error('Firebase onValue error (users):', err);
      toast({ title: 'Failed to load users', description: String(err) });
    });

    return () => {
      // onValue returns an unsubscribe function
      try { unsubscribe(); } catch (e) { /* ignore */ }
    };
  }, [toast]);

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
  };

  const handleDeleteUser = async (user) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    toast({
      title: "User Deleted",
      description: `${user.fullName} has been removed.`,
    });
    // Optionally remove from Firebase as well (uncomment to enable)
    // await remove(ref(database, `users/${user.id}`));
  };

  // Persist changes locally and to Firebase
  const handleSaveUser = async (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    try {
      // ensure numeric balance saved
      const payload = { ...updatedUser, accountBalance: sanitizeBalance(updatedUser.accountBalance) };
       // update the DB node for this user
      await firebaseUpdate(ref(getDatabase(app), `users/${updatedUser.id}`), payload);
      toast({
        title: "User Updated",
        description: `${updatedUser.fullName}'s data has been saved.`,
      });
      setEditingUser(null);
    } catch (err) {
      console.error('Firebase update error:', err);
      toast({
        title: 'Update failed',
        description: (err).message || 'Could not update user in database'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    (user.fullName || '').toLowerCase().includes(searchValue.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchValue.toLowerCase()) ||
    (user.country || '').toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Users" 
      searchValue={searchValue} 
      onSearchChange={setSearchValue}
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8 ">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found matching your search.</p>
        </div>
      )}

      <UserEditModal
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
      />
      <UserDetailModal
        user={viewingUser}
        open={!!viewingUser}
        onClose={() => setViewingUser(null)}
      />
    </DashboardLayout>
  );
};

export default UsersPage;
