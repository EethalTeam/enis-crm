import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { MessageSquare, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const channels = [
  { id: 'whatsapp', name: 'WhatsApp', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' },
  { id: 'messenger', name: 'Messenger', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  { id: 'email', name: 'Email', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'chat', name: 'Web Chat', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900' },
];

const mockConversations = [
  { id: 1, name: 'John Doe', lastMessage: 'Thanks for the information!', time: '10:30 AM', unread: 2 },
  { id: 2, name: 'Jane Smith', lastMessage: 'When can we schedule a call?', time: '11:15 AM', unread: 0 },
  { id: 3, name: 'Bob Johnson', lastMessage: 'I have a question about pricing', time: '12:00 PM', unread: 1 },
];

export default function OmniChannel() {
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully!",
      });
      setMessage('');
    }
  };

  return (
    <>
      <Helmet>
        <title>Omni-Channel Inbox - CRM Platform</title>
        <meta name="description" content="Unified inbox for WhatsApp, Messenger, Email, and Web Chat communications." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Omni-Channel Inbox</h1>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          <Card className="col-span-3">
            <CardContent className="p-4">
              <Tabs value={selectedChannel} onValueChange={setSelectedChannel}>
                <TabsList className="grid grid-cols-2 mb-4">
                  {channels.map((channel) => (
                    <TabsTrigger key={channel.id} value={channel.id} className="text-xs">
                      {channel.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                {mockConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">{conv.name}</span>
                      <span className="text-xs text-slate-500">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-9">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-slate-900 dark:text-white">Hello! How can I help you today?</p>
                    <span className="text-xs text-slate-500 mt-1 block">10:30 AM</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">I'd like to know more about your services</p>
                    <span className="text-xs opacity-80 mt-1 block">10:31 AM</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}