
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

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

export interface StoredAdCreationEntry { // Exported for potential use elsewhere
  id: string;
  data: AdCreationFormValues;
  createdAt: string;
}

const LOCAL_STORAGE_AD_CREATION_KEY = 'adCreationEntries';

const hookPatternOptions = [
  { id: 'curiosity', label: 'Curiosity' },
  { id: 'promise', label: 'Promise' },
  { id: 'problemSolution', label: 'Problem-Solution' },
  { id: 'beforeAfter', label: 'Before-After' },
  { id: 'socialProof', label: 'Social Proof' },
  { id: 'scarcity', label: 'Scarcity' },
  { id: 'urgency', label: 'Urgency' },
];

export default function AdCreationPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedAdEntries, setStoredAdEntries] = useState<StoredAdCreationEntry[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  const form = useForm<AdCreationFormValues>({
    resolver: zodResolver(adCreationSchema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    const rawEntries = localStorage.getItem(LOCAL_STORAGE_AD_CREATION_KEY);
    if (rawEntries) {
      setStoredAdEntries(JSON.parse(rawEntries));
    }
  }, []);

  const onSubmit = async (data: AdCreationFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting ad:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Ad Submitted",
      description: "Your new ad has been successfully submitted. (This is a placeholder action)",
    });
    // This is where you might save to a backend and then clear the form
    // form.reset(); 
    // setEditingDraftId(null);
    setIsSubmitting(false);
  };

  const onSaveDraft = async () => {
    const data = form.getValues();
    if (!data.adConcept && !data.batchDctNumber) {
        toast({
            title: "Cannot Save Draft",
            description: "Please enter at least an Ad Concept or Batch/DCT # to save a draft.",
            variant: "destructive",
        });
        return;
    }
    
    const existingDraftsRaw = localStorage.getItem(LOCAL_STORAGE_AD_CREATION_KEY);
    let existingDrafts: StoredAdCreationEntry[] = existingDraftsRaw ? JSON.parse(existingDraftsRaw) : [];

    if (editingDraftId) {
        const draftIndex = existingDrafts.findIndex(d => d.id === editingDraftId);
        if (draftIndex > -1) {
            existingDrafts[draftIndex] = { ...existingDrafts[draftIndex], data, createdAt: new Date().toISOString() };
            localStorage.setItem(LOCAL_STORAGE_AD_CREATION_KEY, JSON.stringify(existingDrafts));
            setStoredAdEntries([...existingDrafts]);
            toast({ title: "Draft Updated", description: `Ad draft "${data.adConcept || data.batchDctNumber}" has been updated.` });
        } else {
            toast({ title: "Error", description: "Could not find draft to update.", variant: "destructive"});
            return; // Exit if draft to update not found
        }
    } else {
        const newDraft: StoredAdCreationEntry = {
          id: String(Date.now()),
          data: data,
          createdAt: new Date().toISOString(),
        };
        existingDrafts.unshift(newDraft); // Add new draft to the beginning
        localStorage.setItem(LOCAL_STORAGE_AD_CREATION_KEY, JSON.stringify(existingDrafts));
        setStoredAdEntries([...existingDrafts]);
        toast({ title: "Draft Saved", description: `Ad draft "${data.adConcept || data.batchDctNumber}" has been saved locally.` });
    }
    // Do not reset form here, user might want to continue editing or save multiple similar versions.
    // Resetting form is handled by "New Draft" button or after "Submit Ad".
  };

  const handleEditDraft = (draft: StoredAdCreationEntry) => {
    setEditingDraftId(draft.id);
    form.reset(draft.data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDraft = (idToDelete: string) => {
    const draftToDelete = storedAdEntries.find(d => d.id === idToDelete);
    const draftName = draftToDelete?.data.adConcept || draftToDelete?.data.batchDctNumber || "Untitled Draft";

    const confirmed = window.confirm(`Are you sure you want to delete the draft "${draftName}"?`);
    if (!confirmed) return;

    const updatedDrafts = storedAdEntries.filter(draft => draft.id !== idToDelete);
    localStorage.setItem(LOCAL_STORAGE_AD_CREATION_KEY, JSON.stringify(updatedDrafts));
    setStoredAdEntries(updatedDrafts);
    toast({ title: "Draft Deleted", description: `Ad draft "${draftName}" has been removed.` });
    if (editingDraftId === idToDelete) {
        setEditingDraftId(null);
        form.reset();
    }
  };

  const handleNewDraft = () => {
    setEditingDraftId(null);
    form.reset(); // Resets to defaultValues
    toast({title: "Form Cleared", description: "Ready for a new ad draft."});
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-2xl">{editingDraftId ? 'Edit Ad Draft' : 'Create New Ad'}</CardTitle>
              <CardDescription>{editingDraftId ? 'Modify the details of your existing ad draft.' : 'Fill in the details below to structure your new ad campaign.'}</CardDescription>
            </div>
            <Button variant="outline" onClick={handleNewDraft} className="ml-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> New Draft
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6']} className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold">Basic Information</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="batchDctNumber" render={({ field }) => ( <FormItem> <FormLabel>Batch / DCT #</FormLabel> <FormControl><Input placeholder="e.g., B001 / DCT005" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="adConcept" render={({ field }) => ( <FormItem> <FormLabel>Ad Concept</FormLabel> <FormControl><Input placeholder="Enter the core ad concept" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="productDescription" render={({ field }) => ( <FormItem> <FormLabel>Product Description</FormLabel> <FormControl><Textarea placeholder="Describe the product in detail" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-semibold">Targeting & Positioning</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="desireTargeted" render={({ field }) => ( <FormItem> <FormLabel>Desire Targeted</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select a desire" /></SelectTrigger></FormControl> <SelectContent> {['Health & Wellness', 'Love', 'Productivity', 'Confidence', 'Convenience'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="marketAwareness" render={({ field }) => ( <FormItem> <FormLabel>Market Awareness</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select market awareness stage" /></SelectTrigger></FormControl> <SelectContent> {['Unaware', 'Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="marketSophistication" render={({ field }) => ( <FormItem> <FormLabel>Market Sophistication</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select market sophistication stage" /></SelectTrigger></FormControl> <SelectContent> {['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-semibold">Hooks & Angles</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="hookPatterns" render={() => ( <FormItem> <FormLabel>Hook Patterns</FormLabel> <div className="grid grid-cols-2 md:grid-cols-3 gap-4"> {hookPatternOptions.map((item) => ( <FormField key={item.id} control={form.control} name="hookPatterns" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0"> <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange( field.value?.filter( (value) => value !== item.id ) ); }} /></FormControl> <FormLabel className="font-normal">{item.label}</FormLabel> </FormItem> )} /> ))} </div> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="hook1" render={({ field }) => ( <FormItem> <FormLabel>Hook #1</FormLabel> <FormControl><Textarea placeholder="Enter Hook #1" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="hook2" render={({ field }) => ( <FormItem> <FormLabel>Hook #2</FormLabel> <FormControl><Textarea placeholder="Enter Hook #2" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="hook3" render={({ field }) => ( <FormItem> <FormLabel>Hook #3</FormLabel> <FormControl><Textarea placeholder="Enter Hook #3" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-semibold">Ad Copy & CTA</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (General)</FormLabel> <FormControl><Textarea placeholder="General description for the ad" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="bodyCopy1Winner" render={({ field }) => ( <FormItem> <FormLabel>Body Copy 1 (Previous Winner)</FormLabel> <FormControl><Textarea placeholder="Enter previous winning body copy" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="bodyCopy2New" render={({ field }) => ( <FormItem> <FormLabel>Body Copy 2 (New)</FormLabel> <FormControl><Textarea placeholder="Enter new body copy" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="headline1Winner" render={({ field }) => ( <FormItem> <FormLabel>Headline 1 (Previous Winner)</FormLabel> <FormControl><Input placeholder="Enter previous winning headline" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="headline2New" render={({ field }) => ( <FormItem> <FormLabel>Headline 2 (New)</FormLabel> <FormControl><Input placeholder="Enter new headline" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="cta" render={({ field }) => ( <FormItem> <FormLabel>Call to Action (CTA)</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select CTA" /></SelectTrigger></FormControl> <SelectContent> {['Shop Now', 'Learn More', 'Start Free Trial', 'Get Started', 'Sign Up'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-semibold">Tracking & Links</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="landingPage" render={({ field }) => ( <FormItem> <FormLabel>Landing Page URL</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/landing" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="utmParameters" render={({ field }) => ( <FormItem> <FormLabel>UTM Parameters</FormLabel> <FormControl><Textarea placeholder="e.g., utm_source=facebook&utm_medium=cpc..." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="font-semibold">Internal Links</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField control={form.control} name="notionApprovalLink" render={({ field }) => ( <FormItem> <FormLabel>Notion Approval Link</FormLabel> <FormControl><Input type="url" placeholder="Link to Notion page" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="linkToAdBrief" render={({ field }) => ( <FormItem> <FormLabel>Link to Ad Brief</FormLabel> <FormControl><Input type="url" placeholder="Link to ad brief document" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="canvaLinks" render={({ field }) => ( <FormItem> <FormLabel>Canva Links</FormLabel> <FormControl><Input type="url" placeholder="Link to Canva designs" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <CardFooter className="flex justify-end space-x-4 p-0 pt-6">
                <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSubmitting}>
                  {editingDraftId ? 'Update Draft' : 'Save Draft'}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ad'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      {storedAdEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Saved Ad Drafts</CardTitle>
            <CardDescription>Manage your previously saved ad drafts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storedAdEntries.map(draft => (
              <Card key={draft.id} className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-lg">{draft.data.adConcept || draft.data.batchDctNumber || "Untitled Draft"}</CardTitle>
                  <CardDescription>
                    Saved on: {new Date(draft.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground truncate">
                        <strong>Product:</strong> {draft.data.productDescription.substring(0,100)}...
                    </p>
                     <p className="text-sm text-muted-foreground">
                        <strong>Desire:</strong> {draft.data.desireTargeted}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditDraft(draft)}>
                    <Edit className="mr-2 h-3 w-3"/> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteDraft(draft.id)}>
                    <Trash2 className="mr-2 h-3 w-3"/> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
       {storedAdEntries.length === 0 && (
         <Card className="mt-6">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No ad drafts saved yet. Use the "Save Draft" button in the form above to save your work.</p>
            </CardContent>
         </Card>
       )}
    </div>
  );
}

    