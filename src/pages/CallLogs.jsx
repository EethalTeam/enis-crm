
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const mockCallLogs = [
  { id: 1, caller: 'John Doe', number: '+1234567890', duration: '5:23', status: 'Completed', disposition: 'Interested', type: 'incoming', time: '10:30 AM' },
  { id: 2, caller: 'Jane Smith', number: '+1234567891', duration: '3:45', status: 'Completed', disposition: 'Not Interested', type: 'outgoing', time: '11:15 AM' },
  { id: 3, caller: 'Bob Johnson', number: '+1234567892', duration: '0:00', status: 'Missed', disposition: 'No Answer', type: 'incoming', time: '12:00 PM' },
];

const statusColors = {
  'Completed': 'bg-green-600 text-white',
  'Missed': 'bg-red-600 text-white',
};

export default function CallLogs() {
  const { toast } = useToast();

  const handlePlayRecording = () => {
    toast({
      title: "Play Recording",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Call Logs - ENIS CRM</title>
        <meta name="description" content="View and manage all your call logs with detailed information and recordings." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Call Logs</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Caller</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Disposition</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Recording</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCallLogs.map((call, index) => (
                    <motion.tr
                      key={call.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {call.type === 'incoming' && <PhoneIncoming className="w-5 h-5 text-green-400" />}
                        {call.type === 'outgoing' && <PhoneOutgoing className="w-5 h-5 text-blue-400" />}
                        {call.status === 'Missed' && <PhoneMissed className="w-5 h-5 text-red-400" />}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-white">{call.caller}</td>
                      <td className="py-3 px-4 text-sm text-white">{call.number}</td>
                      <td className="py-3 px-4 text-sm text-white">{call.time}</td>
                      <td className="py-3 px-4 text-sm text-white">{call.duration}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[call.status]}>{call.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">{call.disposition}</td>
                      <td className="py-3 px-4">
                        {call.status === 'Completed' && (
                          <Button variant="ghost" size="sm" onClick={handlePlayRecording} className="text-fuchsia-300 hover:bg-fuchsia-900/20">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
