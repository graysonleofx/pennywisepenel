import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserCard } from '@/components/dashboard/UserCard';
import { UserEditModal } from '@/components/dashboard/UserEditModal';
import { UserDetailModal } from '@/components/dashboard/UserDetailModal';
import { mockUsers } from '@/data/mockData';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchValue, setSearchValue] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
  };

  const handleDeleteUser = (user: User) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    toast({
      title: "User Deleted",
      description: `${user.fullName} has been removed.`,
    });
  };

  const handleSaveUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    toast({
      title: "User Updated",
      description: `${updatedUser.fullName}'s data has been saved.`,
    });
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.country.toLowerCase().includes(searchValue.toLowerCase())
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
