
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdCreationFormValues, hookPatternOptions as HookPatternOptionsType } from '@/app/dashboard/ad-creation/page';
import { ArrowLeft } from 'lucide-react';

interface AdFormProps {
  initialData: AdCreationFormValues;
  isEditing: boolean;
  onSubmitAd: (data: AdCreationFormValues) => Promise<void>;
  onSaveDraft: (data: AdCreationFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  adCreationSchema: z.ZodObject<any, any, any>; // Adjust based on actual schema structure if more specific type needed
  hookPatternOptions: typeof HookPatternOptionsType;
}

export default function AdForm({
  initialData,
  isEditing,
  onSubmitAd,
  onSaveDraft,
  onCancel,
  isSubmitting,
  adCreationSchema,
  hookPatternOptions
}: AdFormProps) {
  const form = useForm<AdCreationFormValues>({
    resolver: zodResolver(adCreationSchema),
    defaultValues: initialData,
  });

  // Reset form if initialData changes (e.g., when switching from new to edit or vice-versa)
  // or when editing a different ad.
  React.useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const desireOptions = ['Health & Wellness', 'Love', 'Productivity', 'Confidence', 'Convenience'];
  const marketAwarenessOptions = ['Unaware', 'Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware'];
  const marketSophisticationOptions = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];
  const ctaOptions = ['Shop Now', 'Learn More', 'Start Free Trial', 'Get Started', 'Sign Up'];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline text-2xl">{isEditing ? 'Edit Ad Creative' : 'Create New Ad Creative'}</CardTitle>
            <CardDescription>{isEditing ? 'Modify the details of your ad creative.' : 'Fill in the details below to structure your new ad.'}</CardDescription>
          </div>
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Ad List
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitAd)} className="space-y-8">
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
                  <FormField control={form.control} name="desireTargeted" render={({ field }) => ( <FormItem> <FormLabel>Desire Targeted</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select a desire" /></SelectTrigger></FormControl> <SelectContent> {desireOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="marketAwareness" render={({ field }) => ( <FormItem> <FormLabel>Market Awareness</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select market awareness stage" /></SelectTrigger></FormControl> <SelectContent> {marketAwarenessOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="marketSophistication" render={({ field }) => ( <FormItem> <FormLabel>Market Sophistication</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select market sophistication stage" /></SelectTrigger></FormControl> <SelectContent> {marketSophisticationOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="font-semibold">Hooks & Angles</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="hookPatterns" render={() => ( <FormItem> <FormLabel>Hook Patterns</FormLabel> <div className="grid grid-cols-2 md:grid-cols-3 gap-4"> {hookPatternOptions.map((item) => ( <FormField key={item.id} control={form.control} name="hookPatterns" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0"> <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange( field.value?.filter( (value) => value !== item.id ) ); }} /></FormControl> <FormLabel className="font-normal">{item.label}</FormLabel> </FormItem> )} /> ))} </div> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="hook1" render={({ field }) => ( <FormItem> <FormLabel>Hook #1</FormLabel> <FormControl><Textarea placeholder="Enter Hook #1" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="hook2" render={({ field }) => ( <FormItem> <FormLabel>Hook #2</FormLabel> <FormControl><Textarea placeholder="Enter Hook #2" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="hook3" render={({ field }) => ( <FormItem> <FormLabel>Hook #3</FormLabel> <FormControl><Textarea placeholder="Enter Hook #3" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="font-semibold">Ad Copy & CTA</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (General)</FormLabel> <FormControl><Textarea placeholder="General description for the ad" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="bodyCopy1Winner" render={({ field }) => ( <FormItem> <FormLabel>Body Copy 1 (Previous Winner)</FormLabel> <FormControl><Textarea placeholder="Enter previous winning body copy" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="bodyCopy2New" render={({ field }) => ( <FormItem> <FormLabel>Body Copy 2 (New)</FormLabel> <FormControl><Textarea placeholder="Enter new body copy" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="headline1Winner" render={({ field }) => ( <FormItem> <FormLabel>Headline 1 (Previous Winner)</FormLabel> <FormControl><Input placeholder="Enter previous winning headline" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="headline2New" render={({ field }) => ( <FormItem> <FormLabel>Headline 2 (New)</FormLabel> <FormControl><Input placeholder="Enter new headline" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="cta" render={({ field }) => ( <FormItem> <FormLabel>Call to Action (CTA)</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select CTA" /></SelectTrigger></FormControl> <SelectContent> {ctaOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="font-semibold">Tracking & Links</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="landingPage" render={({ field }) => ( <FormItem> <FormLabel>Landing Page URL</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/landing" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="utmParameters" render={({ field }) => ( <FormItem> <FormLabel>UTM Parameters</FormLabel> <FormControl><Textarea placeholder="e.g., utm_source=facebook&utm_medium=cpc..." {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="font-semibold">Internal Links</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="notionApprovalLink" render={({ field }) => ( <FormItem> <FormLabel>Notion Approval Link</FormLabel> <FormControl><Input type="url" placeholder="Link to Notion page" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="linkToAdBrief" render={({ field }) => ( <FormItem> <FormLabel>Link to Ad Brief</FormLabel> <FormControl><Input type="url" placeholder="Link to ad brief document" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="canvaLinks" render={({ field }) => ( <FormItem> <FormLabel>Canva Links</FormLabel> <FormControl><Input type="url" placeholder="Link to Canva designs" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <CardFooter className="flex justify-end space-x-4 p-0 pt-6">
              <Button type="button" variant="outline" onClick={() => onSaveDraft(form.getValues())} disabled={isSubmitting}>
                {isEditing ? 'Update Draft' : 'Save Draft'}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? 'Updating Ad...' : 'Submitting Ad...') : (isEditing ? 'Update & Submit Ad' : 'Submit Ad')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    