
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, ListChecks, Eye, Copy, PlusCircle, ArrowLeft, Trash2, Edit, UserCircle, Lightbulb, Heart, Gift, Map, PenSquare, Sparkles, Package } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SubmissionDetailTile from '@/components/dashboard/submissions/SubmissionDetailTile';


import type { CustomerAvatar } from '../customer-avatars/page';
import type { Idea } from '../idea-tracker/page';
import type { MassDesire } from '../mass-desires/page';
import type { FeatureBenefitPair } from '../features-to-benefits/page';
import type { RoadmapEntry } from '../creative-roadmap/page';
import type { HeadlinePattern } from '../headline-patterns/page';
import type { Mechanism } from '../mechanization/page';
import type { AdCreationFormValues, StoredAdCreationEntry } from '../ad-creation/page'; 

// Firestore imports
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore'; 

const LOCAL_STORAGE_AVATARS_KEY = 'customerAvatarsEntries';
const LOCAL_STORAGE_IDEAS_KEY = 'ideaTrackerEntries';
const LOCAL_STORAGE_DESIRES_KEY = 'massDesiresEntries';
const LOCAL_STORAGE_FB_KEY = 'featuresBenefitsEntries';
const LOCAL_STORAGE_ROADMAP_KEY = 'creativeRoadmapEntries';
const LOCAL_STORAGE_HEADLINES_KEY = 'headlinePatterns';
const LOCAL_STORAGE_MECHANISMS_KEY = 'productMechanisms';
const LOCAL_STORAGE_AD_CREATION_KEY = 'adCreationEntries';
const LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY = 'compiledCampaignSubmissions'; 

export interface CompiledCampaignSubmission { 
  id: string; 
  submissionTitle: string;
  submittedBy: string;
  submittedAt: string | Timestamp; 
  customerAvatarId?: string;
  ideaTrackerId?: string;
  massDesireId?: string;
  featuresToBenefitsId?: string;
  creativeRoadmapId?: string;
  headlinePatternId?: string;
  mechanizationId?: string;
  adCreationId?: string;
  customerAvatar?: CustomerAvatar | null;
  ideaTracker?: Idea | null;
  massDesire?: MassDesire | null;
  featuresToBenefits?: FeatureBenefitPair | null;
  creativeRoadmap?: RoadmapEntry | null;
  headlinePattern?: HeadlinePattern | null;
  mechanization?: Mechanism | null;
  adCreation?: AdCreationFormValues | null;
  firestoreId?: string; 
}

interface TileInfo {
    label: string;
    value?: string;
    icon: React.ReactNode;
    included: boolean;
}


export default function SubmissionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<CompiledCampaignSubmission | null>(null);

  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedAdConcept, setSelectedAdConcept] = useState('');
  const [selectedMassDesire, setSelectedMassDesire] = useState('');
  const [selectedFeatureBenefit, setSelectedFeatureBenefit] = useState('');
  const [selectedRoadmapEntry, setSelectedRoadmapEntry] = useState('');
  const [selectedHeadlinePattern, setSelectedHeadlinePattern] = useState('');
  const [selectedMechanism, setSelectedMechanism] = useState('');
  const [selectedAdCreation, setSelectedAdCreation] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [avatars, setAvatars] = useState<CustomerAvatar[]>([]);
  const [adConcepts, setAdConcepts] = useState<Idea[]>([]);
  const [massDesires, setMassDesires] = useState<MassDesire[]>([]);
  const [featuresBenefits, setFeaturesBenefits] = useState<FeatureBenefitPair[]>([]);
  const [roadmapEntries, setRoadmapEntries] = useState<RoadmapEntry[]>([]);
  const [headlinePatterns, setHeadlinePatterns] = useState<HeadlinePattern[]>([]);
  const [mechanisms, setMechanisms] = useState<Mechanism[]>([]);
  const [adCreationEntries, setAdCreationEntries] = useState<StoredAdCreationEntry[]>([]);
  
  const [compiledSubmissions, setCompiledSubmissions] = useState<CompiledCampaignSubmission[]>([]);
  const [lastFirestoreSubmissionId, setLastFirestoreSubmissionId] = useState<string | null>(null);

  const loadData = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T[]>>, name: string) => {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) setter(JSON.parse(storedData));
    } catch (error) {
      console.error(`Error loading ${name} from localStorage:`, error);
      toast({ title: `Error Loading ${name}`, description: `Could not load ${name} data.`, variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData<CustomerAvatar>(LOCAL_STORAGE_AVATARS_KEY, setAvatars, "Avatars");
    loadData<Idea>(LOCAL_STORAGE_IDEAS_KEY, setAdConcepts, "Ad Concepts");
    loadData<MassDesire>(LOCAL_STORAGE_DESIRES_KEY, setMassDesires, "Mass Desires");
    loadData<FeatureBenefitPair>(LOCAL_STORAGE_FB_KEY, setFeaturesBenefits, "Features/Benefits");
    loadData<RoadmapEntry>(LOCAL_STORAGE_ROADMAP_KEY, setRoadmapEntries, "Roadmap Entries");
    loadData<HeadlinePattern>(LOCAL_STORAGE_HEADLINES_KEY, setHeadlinePatterns, "Headline Patterns");
    loadData<Mechanism>(LOCAL_STORAGE_MECHANISMS_KEY, setMechanisms, "Mechanisms");
    loadData<StoredAdCreationEntry>(LOCAL_STORAGE_AD_CREATION_KEY, setAdCreationEntries, "Ad Creation Entries");
    loadData<CompiledCampaignSubmission>(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY, setCompiledSubmissions, "Compiled Submissions (Local)");
  }, [toast]);

  useEffect(() => {
    if (compiledSubmissions.length > 0 || localStorage.getItem(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY, JSON.stringify(compiledSubmissions));
    }
  }, [compiledSubmissions]);

  const resetForm = () => {
    setSubmissionTitle('');
    setSubmittedBy('');
    setSelectedAvatar('');
    setSelectedAdConcept('');
    setSelectedMassDesire('');
    setSelectedFeatureBenefit('');
    setSelectedRoadmapEntry('');
    setSelectedHeadlinePattern('');
    setSelectedMechanism('');
    setSelectedAdCreation('');
  };

  const handleCreateNewClick = () => {
    setEditingSubmission(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (submission: CompiledCampaignSubmission) => {
    setEditingSubmission(submission);
    setSubmissionTitle(submission.submissionTitle);
    setSubmittedBy(submission.submittedBy);
    setSelectedAvatar(submission.customerAvatarId || '');
    setSelectedAdConcept(submission.ideaTrackerId || '');
    setSelectedMassDesire(submission.massDesireId || '');
    setSelectedFeatureBenefit(submission.featuresToBenefitsId || '');
    setSelectedRoadmapEntry(submission.creativeRoadmapId || '');
    setSelectedHeadlinePattern(submission.headlinePatternId || '');
    setSelectedMechanism(submission.mechanizationId || '');
    setSelectedAdCreation(submission.adCreationId || '');
    setLastFirestoreSubmissionId(submission.firestoreId || null);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingSubmission(null);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!editingSubmission) setLastFirestoreSubmissionId(null); 
    
    if (!submissionTitle.trim() || !submittedBy.trim()) {
      toast({ title: "Missing Information", description: "Submission Title and Submitted By are required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const findItemById = <T extends {id: string}>(items: T[], id: string): T | undefined => items.find(item => item.id === id);
    const findAdCreationById = (items: StoredAdCreationEntry[], id: string): AdCreationFormValues | undefined => {
        const found = items.find(item => item.id === id);
        return found?.data;
    };

    const firestoreCampaignData = {
      submissionTitle,
      submittedBy,
      submittedAt: editingSubmission?.firestoreId ? (editingSubmission.submittedAt instanceof Timestamp ? editingSubmission.submittedAt : Timestamp.fromDate(new Date(editingSubmission.submittedAt as string))) : Timestamp.now(),
      customerAvatar: findItemById(avatars, selectedAvatar) || null,
      ideaTracker: findItemById(adConcepts, selectedAdConcept) || null,
      massDesire: findItemById(massDesires, selectedMassDesire) || null,
      featuresToBenefits: findItemById(featuresBenefits, selectedFeatureBenefit) || null,
      creativeRoadmap: findItemById(roadmapEntries, selectedRoadmapEntry) || null,
      headlinePattern: findItemById(headlinePatterns, selectedHeadlinePattern) || null,
      mechanization: findItemById(mechanisms, selectedMechanism) || null,
      adCreation: findAdCreationById(adCreationEntries, selectedAdCreation) || null,
    };
    
    try {
      let docId = editingSubmission?.firestoreId;
      if (docId) { 
        const docRef = doc(db, "submissions", docId);
        await updateDoc(docRef, firestoreCampaignData);
        setLastFirestoreSubmissionId(docId);
        toast({ title: 'Campaign Updated in Firestore!', description: `"${submissionTitle}" updated. Share link available.` });
      } else { 
        const docRef = await addDoc(collection(db, "submissions"), firestoreCampaignData);
        docId = docRef.id;
        setLastFirestoreSubmissionId(docId);
        toast({ title: 'Campaign Submitted to Firestore!', description: `"${submissionTitle}" saved with ID: ${docId}. Share link available.` });
      }

      const localCampaignData: CompiledCampaignSubmission = {
        id: editingSubmission?.id || String(Date.now()), 
        submissionTitle,
        submittedBy,
        submittedAt: new Date().toISOString(), 
        customerAvatarId: selectedAvatar,
        ideaTrackerId: selectedAdConcept,
        massDesireId: selectedMassDesire,
        featuresToBenefitsId: selectedFeatureBenefit,
        creativeRoadmapId: selectedRoadmapEntry,
        headlinePatternId: selectedHeadlinePattern,
        mechanizationId: selectedMechanism,
        adCreationId: selectedAdCreation,
        firestoreId: docId,
        ...firestoreCampaignData, 
        submittedAt: new Date().toISOString(), 
      };

      setCompiledSubmissions(prev => 
        editingSubmission 
        ? prev.map(s => s.id === editingSubmission.id ? localCampaignData : s)
        : [localCampaignData, ...prev]
      );

      setShowForm(false);
      setEditingSubmission(null);
      resetForm(); 

    } catch (error) {
      console.error("Error saving document to Firestore: ", error);
      toast({ title: 'Firestore Submission Failed', description: 'Could not save the campaign to the database. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSubmission = async (submission: CompiledCampaignSubmission) => {
    const confirmed = window.confirm(`Are you sure you want to delete submission "${submission.submissionTitle}"? This will remove it from local storage and Firestore (if applicable). This cannot be undone.`);
    if (!confirmed) return;

    if (submission.firestoreId) {
      try {
        await deleteDoc(doc(db, "submissions", submission.firestoreId));
        toast({ title: "Firestore Deletion Successful", description: `Submission "${submission.submissionTitle}" removed from Firestore.`});
      } catch (error) {
        console.error("Error deleting submission from Firestore: ", error);
        toast({ title: "Firestore Deletion Failed", description: "Could not remove submission from database.", variant: "destructive" });
      }
    }

    setCompiledSubmissions(prev => prev.filter(s => s.id !== submission.id));
    toast({ title: "Local Submission Deleted", description: `Submission "${submission.submissionTitle}" removed locally.` });
    
    if (editingSubmission?.id === submission.id) {
      handleBackToList();
    }
    if (lastFirestoreSubmissionId === submission.firestoreId) {
      setLastFirestoreSubmissionId(null);
    }
  };


  const handleCopyLink = () => {
    if (!lastFirestoreSubmissionId) return;
    const link = `${window.location.origin}/submission/${lastFirestoreSubmissionId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({ title: "Link Copied!", description: "Shareable link copied to clipboard." });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
      console.error('Failed to copy link: ', err);
    });
  };
  
  const sortedCompiledSubmissions = [...compiledSubmissions].sort((a,b) => {
    const dateA = a.submittedAt instanceof Timestamp ? a.submittedAt.toDate() : new Date(a.submittedAt as string);
    const dateB = b.submittedAt instanceof Timestamp ? b.submittedAt.toDate() : new Date(b.submittedAt as string);
    return dateB.getTime() - dateA.getTime();
  });
  
  const getSubmissionTiles = (submission: CompiledCampaignSubmission): TileInfo[] => {
    const tiles: TileInfo[] = [];

    tiles.push({ label: "Avatar", value: submission.customerAvatar?.name, icon: <UserCircle />, included: !!submission.customerAvatar });
    tiles.push({ label: "Idea", value: submission.ideaTracker?.concept, icon: <Lightbulb />, included: !!submission.ideaTracker });
    tiles.push({ label: "Mass Desire", value: submission.massDesire?.name, icon: <Heart />, included: !!submission.massDesire });
    tiles.push({ label: "Benefit", value: submission.featuresToBenefits?.productFeature.substring(0,15) + (submission.featuresToBenefits?.productFeature && submission.featuresToBenefits.productFeature.length > 15 ? '...' : ''), icon: <Gift />, included: !!submission.featuresToBenefits });
    tiles.push({ label: "Roadmap", value: submission.creativeRoadmap?.adConcept, icon: <Map />, included: !!submission.creativeRoadmap });
    tiles.push({ label: "Headline", value: "Pattern", icon: <PenSquare />, included: !!submission.headlinePattern });
    tiles.push({ label: "Mechanism", value: submission.mechanization?.mechanismName, icon: <Sparkles />, included: !!submission.mechanization });
    tiles.push({ label: "Ad Creative", value: submission.adCreation?.adConcept || submission.adCreation?.batchDctNumber, icon: <Package />, included: !!submission.adCreation });
    
    return tiles.filter(tile => tile.included); // Only return tiles for included modules
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-grow">
                    <CardTitle className="font-headline text-2xl">
                        {showForm ? (editingSubmission ? 'Edit Campaign Submission' : 'New Campaign Submission') : 'Campaign Submissions'}
                    </CardTitle>
                    <CardDescription>
                        {showForm ? 'Modify or compile elements for the campaign submission.' : 'Compile elements into a single campaign. Saved to Firestore & locally.'}
                    </CardDescription>
                </div>
                {!showForm ? (
                    <Button onClick={handleCreateNewClick} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Submission
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleBackToList} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Submission List
                    </Button>
                )}
            </div>
        </CardHeader>
        {showForm && (
            <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="submissionTitle">Submission Title *</Label>
                    <Input id="submissionTitle" value={submissionTitle} onChange={(e) => setSubmissionTitle(e.target.value)} placeholder="e.g., Q4 Holiday Push - Phase 1" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="submittedBy">Submitted By (Initials) *</Label>
                    <Input id="submittedBy" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} placeholder="e.g., JD" maxLength={5} required />
                </div>
                </div>
                
                <Accordion type="multiple" className="w-full" defaultValue={['item-1', 'item-2']}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="font-semibold">Core Campaign Elements</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"> <Label htmlFor="customer-avatar">Customer Avatar</Label> <Select value={selectedAvatar} onValueChange={setSelectedAvatar}> <SelectTrigger id="customer-avatar"><SelectValue placeholder="Select Avatar" /></SelectTrigger> <SelectContent> {avatars.length > 0 ? avatars.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>) : <SelectItem value="no-avatars" disabled>No avatars defined.</SelectItem>} </SelectContent> </Select> </div>
                        <div className="space-y-2"> <Label htmlFor="ad-concept">Ad Concept (Idea Tracker)</Label> <Select value={selectedAdConcept} onValueChange={setSelectedAdConcept}> <SelectTrigger id="ad-concept"><SelectValue placeholder="Select Ad Concept" /></SelectTrigger> <SelectContent> {adConcepts.length > 0 ? adConcepts.map(item => <SelectItem key={item.id} value={item.id}>{item.concept}</SelectItem>) : <SelectItem value="no-concepts" disabled>No concepts found.</SelectItem>} </SelectContent> </Select> </div>
                        <div className="space-y-2"> <Label htmlFor="mass-desire">Mass Desire</Label> <Select value={selectedMassDesire} onValueChange={setSelectedMassDesire}> <SelectTrigger id="mass-desire"><SelectValue placeholder="Select Mass Desire" /></SelectTrigger> <SelectContent> {massDesires.length > 0 ? massDesires.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>) : <SelectItem value="no-desires" disabled>No mass desires defined.</SelectItem>} </SelectContent> </Select> </div>
                        <div className="space-y-2"> <Label htmlFor="feature-benefit">Feature & Benefit</Label <Select value={selectedFeatureBenefit} onValueChange={setSelectedFeatureBenefit}> <SelectTrigger id="feature-benefit"><SelectValue placeholder="Select Feature & Benefit" /></SelectTrigger> <SelectContent> {featuresBenefits.length > 0 ? featuresBenefits.map(item => <SelectItem key={item.id} value={item.id}>{`${item.productFeature.substring(0,20)}... -> ${item.directBenefit.substring(0,20)}...`}</SelectItem>) : <SelectItem value="no-fb" disabled>No feature-benefit pairs.</SelectItem>} </SelectContent> </Select> </div>
                    </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="font-semibold">Strategy & Execution Elements</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"> <Label htmlFor="creative-roadmap">Creative Roadmap Entry</Label> <Select value={selectedRoadmapEntry} onValueChange={setSelectedRoadmapEntry}> <SelectTrigger id="creative-roadmap"><SelectValue placeholder="Select Roadmap Entry" /></SelectTrigger> <SelectContent> {roadmapEntries.length > 0 ? roadmapEntries.map(item => <SelectItem key={item.id} value={item.id}>{item.dctNumber} - {item.adConcept}</SelectItem>) : <SelectItem value="no-roadmap" disabled>No roadmap entries.</SelectItem>} </SelectContent> </Select> </div>
                        <div className="space-y-2"> <Label htmlFor="headline-pattern">Headline Pattern</Label> <Select value={selectedHeadlinePattern} onValueChange={setSelectedHeadlinePattern}> <SelectTrigger id="headline-pattern"><SelectValue placeholder="Select Headline Pattern" /></SelectTrigger> <SelectContent> {headlinePatterns.length > 0 ? headlinePatterns.map(item => <SelectItem key={item.id} value={item.id}>{item.pattern.substring(0,50)}...</SelectItem>) : <SelectItem value="no-headlines" disabled>No headline patterns.</SelectItem>} </SelectContent> </Select> </div>
                        <div className="space-y-2"> <Label htmlFor="mechanization">Product Mechanism</Label> <Select value={selectedMechanism} onValueChange={setSelectedMechanism}> <SelectTrigger id="mechanization"><SelectValue placeholder="Select Mechanism" /></SelectTrigger> <SelectContent> {mechanisms.length > 0 ? mechanisms.map(item => <SelectItem key={item.id} value={item.id}>{item.mechanismName} ({item.product})</SelectItem>) : <SelectItem value="no-mechanisms" disabled>No mechanisms defined.</SelectItem>} </SelectContent> </Select> </div>
                        <div className="space-y-2"> <Label htmlFor="ad-creation-entry">Ad Creation Draft</Label> <Select value={selectedAdCreation} onValueChange={setSelectedAdCreation}> <SelectTrigger id="ad-creation-entry"><SelectValue placeholder="Select Ad Draft" /></SelectTrigger> <SelectContent> {adCreationEntries.length > 0 ? adCreationEntries.map(item => <SelectItem key={item.id} value={item.id}>{(item.data.adConcept || item.data.batchDctNumber || "Untitled Ad Draft").substring(0,40)}... (Saved: {new Date(item.createdAt).toLocaleDateString()})</SelectItem>) : <SelectItem value="no-ad-drafts" disabled>No ad drafts saved.</SelectItem>} </SelectContent> </Select> </div>
                    </div>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>

            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-4">
                <div className="flex flex-col items-stretch space-y-2 sm:flex-row sm:space-y-0 sm:items-center w-full justify-end sm:space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToList} className="w-full sm:w-auto">Cancel</Button>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : (editingSubmission ? 'Update Submission' : 'Compile & Save Submission')}
                    </Button>
                </div>
                {lastFirestoreSubmissionId && (
                <div className="w-full p-3 border rounded-md bg-secondary/50 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center justify-between">
                    <p className="text-sm text-foreground truncate">
                    Share link: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}/submission/{lastFirestoreSubmissionId}</code>
                    </p>
                    <Button variant="outline" size="sm" onClick={handleCopyLink} className="w-full sm:w-auto">
                    <Copy className="mr-2 h-3 w-3"/> Copy Link
                    </Button>
                </div>
                )}
            </CardFooter>
            </form>
        )}
      </Card>

      {!showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Campaign Submissions Log</CardTitle>
            <CardDescription>This is a list of submissions saved in your browser. Expand to view details or edit. (Firestore saved entries are also listed here).</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedCompiledSubmissions.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                {sortedCompiledSubmissions.map(submission => {
                  const tiles = getSubmissionTiles(submission);
                  return (
                    <AccordionItem value={submission.id} key={submission.id}>
                    <AccordionTrigger className="font-semibold hover:no-underline text-left">
                       <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-2 group">
                        <span className="truncate pr-2 font-medium flex-grow">{submission.submissionTitle}</span>
                        <div className="flex flex-col items-start sm:items-center sm:flex-row flex-shrink-0 gap-x-2">
                            <span className="text-xs text-muted-foreground">
                                By: {submission.submittedBy} on {new Date(submission.submittedAt instanceof Timestamp ? submission.submittedAt.toDate() : submission.submittedAt as string).toLocaleDateString()}
                                {submission.firestoreId && <span className="ml-2 text-green-600 font-medium">(DB)</span>}
                            </span>
                            <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity mt-1 sm:mt-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); handleEditClick(submission);}}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); handleDeleteSubmission(submission);}}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-2 md:p-4 overflow-y-auto max-h-[220px] rounded-md bg-muted/30">
                            {tiles.map((tile, index) => (
                                <SubmissionDetailTile 
                                    key={index} 
                                    label={tile.label} 
                                    value={tile.value} 
                                    icon={tile.icon} 
                                    included={tile.included}
                                />
                            ))}
                             {!tiles.length && <p className="col-span-full text-center text-muted-foreground py-4">No modules selected for this submission.</p>}
                        </div>
                        {submission.firestoreId && (
                            <Button variant="link" size="sm" asChild className="px-0 mt-2">
                                <a href={`/submission/${submission.firestoreId}`} target="_blank" rel="noopener noreferrer">
                                    View Full Submission Page <Eye className="ml-1 h-4 w-4"/>
                                </a>
                            </Button>
                        )}
                    </AccordionContent>
                    </AccordionItem>
                  );
                })}
                </Accordion>
            ) : (
                <div className="text-center py-12">
                    <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg mt-4 mb-2">No submissions compiled yet.</p>
                    <p className="text-sm text-muted-foreground">Click the "Create New Submission" button to get started!</p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

