import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Briefcase, DollarSign, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { config } from '@/components/CustomComponents/config.js';

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 mt-6 first:mt-0">
    <Icon className="w-4 h-4 text-fuchsia-500" />
    <h3 className="text-sm font-bold text-fuchsia-100 uppercase tracking-wider">{title}</h3>
  </div>
);

const initialFormState = {
  // Contact Info
  firstName: '', lastName: '', email: '', phone: '', jobTitle: '', linkedinProfile: '',
  // Company Details
  // companyName: '', website: '', industry: '', size: '',
  // Address
  street: '', city: '', state: '', country: '', zipCode: '',
  // Deal Info
  leadStatus: 'New', leadSource: 'Website', leadScore: 0,
  amount: 0, currency: 'USD',
  // Meta
  tags: '' 
};

export default function LeadDialog({ open, onOpenChange, onSuccess, initialData, mode = 'create' }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isViewMode = mode === 'view';

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          firstName: initialData.contactInfo?.firstName || '',
          lastName: initialData.contactInfo?.lastName || '',
          email: initialData.contactInfo?.email || '',
          phone: initialData.contactInfo?.phone || '',
          jobTitle: initialData.contactInfo?.jobTitle || '',
          linkedinProfile: initialData.contactInfo?.linkedinProfile || '',
          
          companyName: initialData.companyDetails?.name || '',
          website: initialData.companyDetails?.website || '',
          industry: initialData.companyDetails?.industry || '',
          size: initialData.companyDetails?.size || '',
          
          street: initialData.companyDetails?.address?.street || '',
          city: initialData.companyDetails?.address?.city || '',
          state: initialData.companyDetails?.address?.state || '',
          country: initialData.companyDetails?.address?.country || '',
          zipCode: initialData.companyDetails?.address?.zipCode || '',
          
          leadStatus: initialData.leadStatus || 'New',
          leadSource: initialData.leadSource || 'Website',
          leadScore: initialData.leadScore || 0,
          
          amount: initialData.potentialValue?.amount || 0,
          currency: initialData.potentialValue?.currency || 'USD',
          
          tags: initialData.tags ? (Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags) : ''
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    setIsSubmitting(true);

    try {
      const isEdit = mode === 'edit';
      const endpoint = isEdit ? 'Lead/updateLead' : 'Lead/createLead';
      
      const payload = {
        contactInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          linkedinProfile: formData.linkedinProfile
        },
        // companyDetails: {
        //   name: formData.companyName,
        //   website: formData.website,
        //   industry: formData.industry,
        //   size: formData.size,
        //   address: {
        //     street: formData.street,
        //     city: formData.city,
        //     state: formData.state,
        //     country: formData.country,
        //     zipCode: formData.zipCode
        //   }
        // },
        leadStatus: formData.leadStatus,
        leadSource: formData.leadSource,
        leadScore: Number(formData.leadScore),
        potentialValue: {
          amount: Number(formData.amount),
          currency: formData.currency
        },
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (isEdit) {
        payload.leadId = initialData._id;
        // payload.updateData = payload; 
      }
       const url = `${config.Api}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: isEdit ? "Lead Updated" : "Lead Created",
          description: result.message,
          variant: "default" 
        });
        onSuccess();
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error("Submit Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-slate-950 text-white border-slate-800 flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {mode === 'create' && 'Add New Lead'}
            {mode === 'edit' && 'Edit Lead'}
            {mode === 'view' && 'Lead Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto py-4 pr-2 custom-scrollbar">
          <form id="lead-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* CONTACT INFO */}
            <div>
              <SectionHeader icon={User} title="Contact Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <Input id="linkedinProfile" name="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange} placeholder="https://linkedin.com/in/..." disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
              </div>
            </div>

            {/* COMPANY DETAILS */}
            {/* <div>
              <SectionHeader icon={Briefcase} title="Company Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" value={formData.website} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <select 
                    name="size" 
                    value={formData.size} 
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600"
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200+">200+ employees</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div> */}

            {/* ADDRESS */}
            <div>
              <SectionHeader icon={MapPin} title="Address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" name="street" value={formData.street} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} disabled={isViewMode} className="bg-slate-900 border-slate-700" />
                </div>
              </div>
            </div>

            {/* DEAL INFO */}
            <div>
              <SectionHeader icon={DollarSign} title="Deal & Status" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <select 
                    name="leadStatus"
                    value={formData.leadStatus} 
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <Label>Source</Label>
                  <select 
                    name="leadSource"
                    value={formData.leadSource} 
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Paid Ads">Paid Ads</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Organic Search">Organic Search</option>
                  </select>
                </div>

                <div>
                   <Label htmlFor="amount">Potential Value</Label>
                   <div className="flex gap-2">
                      <Input 
                        id="amount" 
                        name="amount" 
                        type="number" 
                        value={formData.amount} 
                        onChange={handleChange} 
                        disabled={isViewMode} 
                        className="bg-slate-900 border-slate-700"
                      />
                      <Input 
                         name="currency" 
                         value={formData.currency} 
                         onChange={handleChange} 
                         className="w-24 text-center bg-slate-900 border-slate-700" 
                         disabled={isViewMode} 
                      />
                   </div>
                </div>

                <div>
                  <Label htmlFor="leadScore">Lead Score (0-100)</Label>
                  <Input 
                    id="leadScore" 
                    name="leadScore" 
                    type="number" 
                    value={formData.leadScore} 
                    onChange={handleChange} 
                    disabled={isViewMode} 
                    className="bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input 
                    id="tags" 
                    name="tags" 
                    value={formData.tags} 
                    onChange={handleChange} 
                    placeholder="vip, urgent, q4-target" 
                    disabled={isViewMode} 
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        <DialogFooter className="shrink-0 pt-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          
          {!isViewMode && (
            <Button 
              type="submit" 
              form="lead-form"
              disabled={isSubmitting}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'edit' ? 'Save Changes' : 'Create Lead'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}