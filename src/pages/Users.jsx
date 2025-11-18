import React from 'react';
import { Helmet } from 'react-helmet';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function Users() {
  const { toast } = useToast();

  return (
    <>
      <Helmet>
        <title>Users - CRM Platform</title>
        <meta name="description" content="Manage user accounts and team members." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Users</h1>
          <Button onClick={() => toast({ title: "Add User", description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">User management interface coming soon!</p>
        </div>
      </div>
    </>
  );
}