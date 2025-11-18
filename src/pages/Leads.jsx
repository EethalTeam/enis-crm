
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LeadDialog from '@/components/leads/LeadDialog';
import { useToast } from '@/components/ui/use-toast';

const mockLeads = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', source: 'Website', status: 'New', assignedTo: 'Agent 1', lastContact: '2025-10-28' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', source: 'Referral', status: 'Follow-up', assignedTo: 'Agent 2', lastContact: '2025-10-27' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', source: 'Social Media', status: 'Converted', assignedTo: 'Agent 1', lastContact: '2025-10-26' },
];

const statusColors = {
  'New': 'bg-blue-600 text-white',
  'Follow-up': 'bg-yellow-600 text-white',
  'Converted': 'bg-green-600 text-white',
};

export default function Leads() {
  const [leads, setLeads] = useState(mockLeads);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImport = () => {
    toast({
      title: "Import Feature",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Feature",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Leads - ENIS CRM</title>
        <meta name="description" content="Manage and track all your leads in one place with advanced filtering and search capabilities." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleImport} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExport} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
                />
              </div>
              <Button variant="outline" className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Source</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Assigned To</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Last Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-white">{lead.name}</td>
                      <td className="py-3 px-4 text-sm text-white">{lead.email}</td>
                      <td className="py-3 px-4 text-sm text-white">{lead.phone}</td>
                      <td className="py-3 px-4 text-sm text-white">{lead.source}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">{lead.assignedTo}</td>
                      <td className="py-3 px-4 text-sm text-white">{lead.lastContact}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </>
  );
}
