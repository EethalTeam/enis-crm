import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const mockTasks = {
  pending: [
    { id: 1, title: 'Follow-up with John Doe', dueDate: '2025-10-30', priority: 'high' },
    { id: 2, title: 'Send proposal to Jane Smith', dueDate: '2025-10-31', priority: 'medium' },
  ],
  inProgress: [
    { id: 3, title: 'Prepare presentation', dueDate: '2025-11-01', priority: 'high' },
  ],
  completed: [
    { id: 4, title: 'Call Bob Johnson', dueDate: '2025-10-28', priority: 'low' },
  ],
};

const priorityColors = {
  high: 'border-l-4 border-red-500',
  medium: 'border-l-4 border-yellow-500',
  low: 'border-l-4 border-green-500',
};

export default function Tasks() {
  const [tasks] = useState(mockTasks);
  const { toast } = useToast();

  return (
    <>
      <Helmet>
        <title>Tasks - CRM Platform</title>
        <meta name="description" content="Manage your tasks with Kanban-style board for better organization." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <Button onClick={() => toast({ title: "Add Task", description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(tasks).map(([status, taskList]) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="capitalize">{status.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {taskList.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm ${priorityColors[task.priority]}`}
                  >
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Due: {task.dueDate}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}