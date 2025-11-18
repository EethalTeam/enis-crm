import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully!",
    });
  };

  return (
    <>
      <Helmet>
        <title>Settings - CRM Platform</title>
        <meta name="description" content="Configure your CRM settings, integrations, and preferences." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="ivr">IVR</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Your Company Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="UTC+0" />
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <CardTitle>Channel Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {['WhatsApp', 'Messenger', 'Email', 'Web Chat'].map((channel) => (
                  <div key={channel} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{channel}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Configure {channel} integration</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ivr">
            <Card>
              <CardHeader>
                <CardTitle>IVR Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twilio-key">Twilio API Key</Label>
                  <Input id="twilio-key" type="password" placeholder="Enter API Key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <Input id="webhook" placeholder="https://your-webhook-url.com" />
                </div>
                <Button onClick={handleSave}>Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Admin', 'Manager', 'Agent'].map((role) => (
                    <div key={role} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <h3 className="font-medium text-slate-900 dark:text-white mb-2">{role}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Configure permissions for {role} role
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}