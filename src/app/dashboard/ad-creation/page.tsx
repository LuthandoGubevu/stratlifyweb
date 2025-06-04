
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, ArrowLeft, Trash2 } from 'lucide-react';
import AdCard from '@/components/dashboard/ad-creation/AdCard';
import AdForm from '@/components/dashboard/ad-creation/AdForm';
import * as z from 'zod';

// Schema and types are kept here as they are fundamental to this page's data structure
// and are used by both the main page and the AdForm component.
const adCreationSchema = z.object({
  batchDctNumber: z.string().min(1, 'Batch/DCT # is required'),
  adConcept: z.string().min(1, 'Ad Concept is required'),
  productDescription: z.string().min(1, 'Product Description is required'),
  desireTargeted: z.enum(['Health & Wellness', 'Love', 'Productivity', 'Confidence', 'Convenience']),
  marketAwareness: z.enum(['Unaware', 'Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware']),
  marketSophistication: z.enum(['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5']),
  hookPatterns: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one hook pattern.",
  }),
  hook1: z.string().optional(),
  hook2: z.string().optional(),
  hook3: z.string().optional(),
  description: z.string().optional(),
  bodyCopy1Winner: z.string().optional(),
  bodyCopy2New: z.string().min(1, 'New Body Copy is required'),
  cta: z.enum(['Shop Now', 'Learn More', 'Start Free Trial', 'Get Started', 'Sign Up']),
  landingPage: z.string().url({ message: "Please enter a valid URL." }),
  utmParameters: z.string().optional(),
  notionApprovalLink: z.string().url({ message: "Please enter a valid URL." }).optional(),
  linkToAdBrief: z.string().url({ message: "Please enter a valid URL." }).optional(),
  canvaLinks: z.string().url({ message: "Please enter a valid URL." }).optional(),
  headline1Winner: z.string().optional(),
  headline2New: z.string().min(1, 'New Headline is required'),
});

export type AdCreationFormValues = z.infer<typeof adCreationSchema>;

export interface StoredAdCreationEntry {
  id: string;
  data: AdCreationFormValues;
  createdAt: string;
}

export const LOCAL_STORAGE_AD_CREATION_KEY = 'adCreationEntries';

export const hookPatternOptions = [
  { id: 'curiosity', label: 'Curiosity' },
  { id: 'promise', label: 'Promise' },
  { id: 'problemSolution', label: 'Problem-Solution' },
  { id: 'beforeAfter', label: 'Before-After' },
  { id: 'socialProof', label: 'Social Proof' },
  { id: 'scarcity', label: 'Scarcity' },
  { id: 'urgency', label: 'Urgency' },
];

export const defaultAdCreationValues: AdCreationFormValues = {
  batchDctNumber: '',
  adConcept: '',
  productDescription: '',
  desireTargeted: 'Health & Wellness',
  marketAwareness: 'Unaware',
  marketSophistication: 'Stage 1',
  hookPatterns: [],
  cta: 'Shop Now',
  landingPage: '',
  bodyCopy2New: '',
  headline2New: '',
  utmParameters: '',
  canvaLinks: '',
  notionApprovalLink: '',
  linkToAdBrief: ''
};

export default function AdCreationPage() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [storedAdEntries, setStoredAdEntries] = useState<StoredAdCreationEntry[]>([]);
  const [editingAd, setEditingAd] = useState<StoredAdCreationEntry | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);


  useEffect(() => {
    const rawEntries = localStorage.getItem(LOCAL_STORAGE_AD_CREATION_KEY);
    if (rawEntries) {
      try {
        setStoredAdEntries(JSON.parse(rawEntries));
      } catch (e) {
        console.error("Failed to parse ad entries from localStorage", e);
        setStoredAdEntries([]);
      }
    }
  }, []);

  const saveEntriesToLocalStorage = (entries: StoredAdCreationEntry[]) => {
    localStorage.setItem(LOCAL_STORAGE_AD_CREATION_KEY, JSON.stringify(entries));
  };

  const handleCreateNewAd = () => {
    setEditingAd(null);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingAd(null);
  };

  const handleEditAd = (adToEdit: StoredAdCreationEntry) => {
    setEditingAd(adToEdit);
    setShowForm(true);
  };

  const handleDeleteAd = (idToDelete: string) => {
    const adToDelete = storedAdEntries.find(d => d.id === idToDelete);
    const adName = adToDelete?.data.adConcept || adToDelete?.data.batchDctNumber || "Untitled Ad";

    const confirmed = window.confirm(`Are you sure you want to delete the ad "${adName}"? This cannot be undone.`);
    if (!confirmed) return;

    const updatedEntries = storedAdEntries.filter(ad => ad.id !== idToDelete);
    setStoredAdEntries(updatedEntries);
    saveEntriesToLocalStorage(updatedEntries);
    toast({ title: "Ad Deleted", description: `Ad "${adName}" has been removed.` });
    if (editingAd?.id === idToDelete) {
        setShowForm(false);
        setEditingAd(null);
    }
  };
  
  const handleViewLandingPage = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({ title: "No URL", description: "This ad does not have a landing page URL specified.", variant: "destructive" });
    }
  };

  const handleSubmitAd = async (data: AdCreationFormValues) => {
    setIsSubmittingForm(true);
    console.log("Submitting ad to backend (placeholder):", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const entryIdentifier = data.adConcept || data.batchDctNumber;
    let updatedEntries;

    if (editingAd) {
        updatedEntries = storedAdEntries.map(entry =>
            entry.id === editingAd.id ? { ...entry, data, createdAt: new Date().toISOString() } : entry
        );
        toast({ title: "Ad Updated & Submitted", description: `Ad "${entryIdentifier}" has been updated and submitted.` });
    } else {
        const newAdEntry: StoredAdCreationEntry = {
          id: String(Date.now()),
          data: data,
          createdAt: new Date().toISOString(),
        };
        updatedEntries = [newAdEntry, ...storedAdEntries]; // Add new to the beginning
        toast({ title: "Ad Submitted", description: `New ad "${entryIdentifier}" has been submitted.` });
    }
    
    setStoredAdEntries(updatedEntries);
    saveEntriesToLocalStorage(updatedEntries);
    
    setShowForm(false);
    setEditingAd(null);
    setIsSubmittingForm(false);
  };

  const handleSaveDraft = async (data: AdCreationFormValues) => {
    setIsSubmittingForm(true);
    if (!data.adConcept && !data.batchDctNumber) {
        toast({
            title: "Cannot Save Draft",
            description: "Please enter at least an Ad Concept or Batch/DCT # to save a draft.",
            variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
    }
    
    let updatedEntries;
    const entryIdentifier = data.adConcept || data.batchDctNumber;

    if (editingAd) {
        updatedEntries = storedAdEntries.map(entry =>
            entry.id === editingAd.id ? { ...entry, data, createdAt: new Date().toISOString() } : entry
        );
        setEditingAd({ ...editingAd, data, createdAt: new Date().toISOString() }); // Update current editing ad state
        toast({ title: "Draft Updated", description: `Ad draft "${entryIdentifier}" has been updated locally.` });
    } else {
        const newDraft: StoredAdCreationEntry = {
          id: String(Date.now()),
          data: data,
          createdAt: new Date().toISOString(),
        };
        updatedEntries = [newDraft, ...storedAdEntries];
        setEditingAd(newDraft); // Set the new draft as the one being "edited" if user continues
        toast({ title: "Draft Saved", description: `Ad draft "${entryIdentifier}" has been saved locally.` });
    }
    setStoredAdEntries(updatedEntries);
    saveEntriesToLocalStorage(updatedEntries);
    // Don't hide form on save draft, user might want to continue editing
    setIsSubmittingForm(false);
    // setShowForm(false); // Optional: hide form and return to list after saving draft
  };


  return (
    <div className="space-y-6">
      {!showForm ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline text-2xl">Your Ads</CardTitle>
                <CardDescription>Manage your existing ad creatives or create new ones.</CardDescription>
              </div>
              <Button onClick={handleCreateNewAd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Ad
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {storedAdEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storedAdEntries.map(ad => (
                  <AdCard 
                    key={ad.id} 
                    ad={ad} 
                    onEdit={() => handleEditAd(ad)} 
                    onViewLandingPage={() => handleViewLandingPage(ad.data.landingPage)}
                    onDelete={() => handleDeleteAd(ad.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-2">No ads created yet.</p>
                <p className="text-sm text-muted-foreground">Click the button above to start creating your first ad!</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <AdForm
          initialData={editingAd ? editingAd.data : defaultAdCreationValues}
          isEditing={!!editingAd}
          onSubmitAd={handleSubmitAd}
          onSaveDraft={handleSaveDraft}
          onCancel={handleBackToList}
          isSubmitting={isSubmittingForm}
          adCreationSchema={adCreationSchema}
          hookPatternOptions={hookPatternOptions}
        />
      )}
    </div>
  );
}

    