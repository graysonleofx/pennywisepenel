import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserCard } from '@/components/dashboard/UserCard.jsx';
import { UserEditModal } from '@/components/dashboard/UserEditModal.jsx';
import { UserDetailModal } from '@/components/dashboard/UserDetailModal.jsx';
import { mockUsers } from '@/data/mockData';
// import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';

// Firebase imports
import { app } from '../lib/firebase.js';
import { ref, getDatabase, onValue, update as firebaseUpdate, remove } from 'firebase/database';


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
    try {
      // Remove from Firebase first
      await remove(ref(getDatabase(app), `users/${user.id}`));
      
      // Then update local state
      setUsers(prev => prev.filter(u => u.id !== user.id));
      
      toast({
        title: "User Deleted",
        description: `${user.fullName} has been removed from the database.`,
      });
    } catch (err) {
      console.error('Firebase delete error:', err);
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not delete user from database',
        variant: 'destructive',
      });
    }
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-semibold text-foreground">User Management</h2><p className="text-sm text-muted-foreground">Manage registered users</p></div>
        {/* <Button className="min-h-10 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button> */}
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm-custom">
        {/* <div className="border-b border-border p-4 md:p-5">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search users..." className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
        </div> */}
        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[760px]">
            {/* <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.55fr] gap-4 border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"><span>User</span><span>Phone</span><span>Balance</span><span>Details</span><span>Actions</span></div> */}
            {filteredUsers.map((user) => <UserCard key={user.id} user={user} onView={handleViewUser} onEdit={handleEditUser} onDelete={handleDeleteUser} />)}
          </div>
        </div>
        <div className="grid gap-3 p-3 md:hidden">
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
      </section>

      {filteredUsers.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No users found matching your search.</p>
        </div>
      ) : null}

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
