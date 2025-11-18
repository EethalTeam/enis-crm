
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function LeadDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'New',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Lead Added",
      description: `${formData.name} has been added successfully!`,
    });
    onOpenChange(false);
    setFormData({ name: '', email: '', phone: '', source: '', status: 'New' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#2a133b] border-fuchsia-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source" className="text-white">Source</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger className="bg-purple-900/50 border-fuchsia-700 text-white">
                <SelectValue placeholder="Select source" className="text-white" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a133b] border-fuchsia-700/50 text-white">
                <SelectItem value="Website" className="text-white">Website</SelectItem>
                <SelectItem value="Referral" className="text-white">Referral</SelectItem>
                <SelectItem value="Social Media" className="text-white">Social Media</SelectItem>
                <SelectItem value="Direct" className="text-white">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/20">
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold">Add Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
