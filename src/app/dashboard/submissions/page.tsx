
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
import { Send, ListChecks, Eye, Copy, PlusCircle, ArrowLeft, Trash2, Edit, UserCircle, Lightbulb, Heart, Gift, Map, PenSquare, Sparkles, Package, Loader2 } from 'lucide-react';
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
import {
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';


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
  id: string; // This will be the local/UI ID. Firestore ID is separate.
  submissionTitle: string;
  submittedBy: string;
  submittedAt: string; // Always store as ISO string in local state/storage
  customerAvatarId?: string;
  ideaTrackerId?: string;
  massDesireId?: string;
  featuresToBenefitsId?: string;
  creativeRoadmapId?: string;
  headlinePatternId?: string;
  mechanizationId?: string;
  adCreationId?: string;
  // Full objects for easier display, populated on load/compile
  customerAvatar?: CustomerAvatar | null;
  ideaTracker?: Idea | null;
  massDesire?: MassDesire | null;
  featuresToBenefits?: FeatureBenefitPair | null;
  creativeRoadmap?: RoadmapEntry | null;
  headlinePattern?: HeadlinePattern | null;
  mechanization?: Mechanism | null;
  adCreation?: AdCreationFormValues | null;
  firestoreId?: string; // ID of the document in Firestore
}

interface TileInfo {
    label: string;
    value?: string;
    icon: React.ReactNode;
    included: boolean;
}


export default function SubmissionsPage() {
  const { user } = useAuth();
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
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
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

  function loadData<T>(key: string, setter: React.Dispatch<React.SetStateAction<T[]>>, name: string) {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setter(parsedData);
      }
    } catch (error) {
      console.error(`Error loading ${name} from localStorage:`, error);
      toast({ title: `Error Loading ${name}`, description: `Could not load ${name} data.`, variant: "destructive" });
    }
  }

  useEffect(() => {
    console.log("Submissions Page Auth User UID:", user?.uid || "No user");

    // Load non-submission data (dropdowns etc.) from localStorage
    loadData<CustomerAvatar>(LOCAL_STORAGE_AVATARS_KEY, setAvatars, "Avatars");
    loadData<Idea>(LOCAL_STORAGE_IDEAS_KEY, setAdConcepts, "Ad Concepts");
    loadData<MassDesire>(LOCAL_STORAGE_DESIRES_KEY, setMassDesires, "Mass Desires");
    loadData<FeatureBenefitPair>(LOCAL_STORAGE_FB_KEY, setFeaturesBenefits, "Features/Benefits");
    loadData<RoadmapEntry>(LOCAL_STORAGE_ROADMAP_KEY, setRoadmapEntries, "Roadmap Entries");
    loadData<HeadlinePattern>(LOCAL_STORAGE_HEADLINES_KEY, setHeadlinePatterns, "Headline Patterns");
    loadData<Mechanism>(LOCAL_STORAGE_MECHANISMS_KEY, setMechanisms, "Mechanisms");
    loadData<StoredAdCreationEntry>(LOCAL_STORAGE_AD_CREATION_KEY, setAdCreationEntries, "Ad Creation Entries");

    // Fetch submissions from Firestore
    const fetchSubmissions = async () => {
      setIsLoadingSubmissions(true);
      try {
        // Note: Add .where("userId", "==", user.uid) if submissions are user-specific
        const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const firestoreSubmissions: CompiledCampaignSubmission[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firestoreSubmissions.push({
            ...data,
            id: doc.id, // Use Firestore doc ID as the primary 'id' for items fetched from Firestore
            firestoreId: doc.id,
            submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(), // Convert Timestamp to ISO string
          } as CompiledCampaignSubmission);
        });
        setCompiledSubmissions(firestoreSubmissions);
        localStorage.setItem(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY, JSON.stringify(firestoreSubmissions));
        console.log(`Fetched ${firestoreSubmissions.length} submissions from Firestore.`);
      } catch (error) {
        console.error("Error fetching submissions from Firestore:", error);
        toast({ title: "Error Fetching Submissions", description: "Could not load submissions from the database. Displaying local data if available.", variant: "destructive" });
        // Fallback to local storage if Firestore fetch fails
        const localSubmissionsRaw = localStorage.getItem(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY);
        if (localSubmissionsRaw) {
          setCompiledSubmissions(JSON.parse(localSubmissionsRaw));
        }
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [toast, user]); // Added user dependency if you implement user-specific queries

  useEffect(() => {
    // This effect now primarily serves to update localStorage if compiledSubmissions is changed by other means (e.g., after a new submission)
    // The initial load from Firestore also updates localStorage.
    if (compiledSubmissions.length > 0 || !isLoadingSubmissions) { // Only save if not loading and there's data or loading finished
        localStorage.setItem(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY, JSON.stringify(compiledSubmissions));
    }
  }, [compiledSubmissions, isLoadingSubmissions]);

  function resetForm() {
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
  }

  function handleCreateNewClick() {
    setEditingSubmission(null);
    resetForm();
    setShowForm(true);
  }

  function handleEditClick(submission: CompiledCampaignSubmission) {
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
  }

  function handleBackToList() {
    setShowForm(false);
    setEditingSubmission(null);
    resetForm();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting form. User UID:", user?.uid || "No user");

    if (!submissionTitle.trim() || !submittedBy.trim()) {
      toast({ title: "Missing Information", description: "Submission Title and Submitted By are required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    function findItemById<T extends {id: string}>(items: T[], id: string): T | undefined {
        return items.find(item => item.id === id);
    }
    function findAdCreationById(items: StoredAdCreationEntry[], id: string): AdCreationFormValues | undefined {
        const found = items.find(item => item.id === id);
        return found?.data;
    }
    
    // Prepare data for Firestore
    const submissionDataForFirestore: any = {
      submissionTitle,
      submittedBy,
      // userId: user?.uid, // Add this if submissions are user-specific
      customerAvatar: findItemById(avatars, selectedAvatar) || null,
      ideaTracker: findItemById(adConcepts, selectedAdConcept) || null,
      massDesire: findItemById(massDesires, selectedMassDesire) || null,
      featuresToBenefits: findItemById(featuresBenefits, selectedFeatureBenefit) || null,
      creativeRoadmap: findItemById(roadmapEntries, selectedRoadmapEntry) || null,
      headlinePattern: findItemById(headlinePatterns, selectedHeadlinePattern) || null,
      mechanization: findItemById(mechanisms, selectedMechanism) || null,
      adCreation: findAdCreationById(adCreationEntries, selectedAdCreation) || null,
      // submittedAt will be handled by serverTimestamp or existing value
    };

    try {
      let docId = editingSubmission?.firestoreId;
      let submissionTimestamp: Timestamp;

      if (docId) { // Editing existing submission
        submissionDataForFirestore.submittedAt = serverTimestamp(); // Or update a different field like 'updatedAt'
        const docRef = doc(db, "submissions", docId);
        await updateDoc(docRef, submissionDataForFirestore);
        // For optimistic update, we'd get the timestamp after the update or use client's.
        // For simplicity, we'll use client time if serverTimestamp was just set.
        // A more robust solution might re-fetch the item or get the confirmed server timestamp.
        submissionTimestamp = Timestamp.now(); // Approximation
        setLastFirestoreSubmissionId(docId);
        toast({ title: 'Campaign Updated in Firestore!', description: `"${submissionTitle}" updated.` });
        console.log(`Submission ${docId} updated in Firestore.`);
      } else { // Creating new submission
        submissionDataForFirestore.submittedAt = serverTimestamp();
        const docRef = await addDoc(collection(db, "submissions"), submissionDataForFirestore);
        docId = docRef.id;
        submissionTimestamp = Timestamp.now(); // Approximation, server will set actual
        setLastFirestoreSubmissionId(docId);
        toast({ title: 'Campaign Submitted to Firestore!', description: `"${submissionTitle}" saved.` });
        console.log(`New submission ${docId} added to Firestore.`);
      }
      
      const newOrUpdatedSubmission: CompiledCampaignSubmission = {
        id: editingSubmission?.id || docId, // Use existing local ID or new Firestore ID
        firestoreId: docId,
        submissionTitle,
        submittedBy,
        submittedAt: submissionTimestamp.toDate().toISOString(),
        customerAvatarId: selectedAvatar,
        ideaTrackerId: selectedAdConcept,
        massDesireId: selectedMassDesire,
        featuresToBenefitsId: selectedFeatureBenefit,
        creativeRoadmapId: selectedRoadmapEntry,
        headlinePatternId: selectedHeadlinePattern,
        mechanizationId: selectedMechanism,
        adCreationId: selectedAdCreation,
        customerAvatar: submissionDataForFirestore.customerAvatar,
        ideaTracker: submissionDataForFirestore.ideaTracker,
        massDesire: submissionDataForFirestore.massDesire,
        featuresToBenefits: submissionDataForFirestore.featuresToBenefits,
        creativeRoadmap: submissionDataForFirestore.creativeRoadmap,
        headlinePattern: submissionDataForFirestore.headlinePattern,
        mechanization: submissionDataForFirestore.mechanization,
        adCreation: submissionDataForFirestore.adCreation,
      };

      setCompiledSubmissions(prev => {
        const newArray = editingSubmission
          ? prev.map(s => s.id === editingSubmission.id ? newOrUpdatedSubmission : s)
          : [newOrUpdatedSubmission, ...prev];
        // Re-sort as new/updated item might change order
        return newArray.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      });

      setShowForm(false);
      setEditingSubmission(null);
      resetForm();

    } catch (error) {
      console.error("Error saving document to Firestore: ", error);
      toast({ title: 'Firestore Submission Failed', description: 'Could not save the campaign to the database. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSubmission(submission: CompiledCampaignSubmission) {
    const confirmed = window.confirm(`Are you sure you want to delete submission "${submission.submissionTitle}"? This will remove it from local storage and Firestore (if applicable). This cannot be undone.`);
    if (!confirmed) return;
    console.log(`Attempting to delete submission. Local ID: ${submission.id}, Firestore ID: ${submission.firestoreId}. User UID: ${user?.uid || "No user"}`);

    if (submission.firestoreId) {
      try {
        await deleteDoc(doc(db, "submissions", submission.firestoreId));
        toast({ title: "Firestore Deletion Successful", description: `Submission "${submission.submissionTitle}" removed from Firestore.`});
        console.log(`Submission ${submission.firestoreId} deleted from Firestore.`);
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
  }

  function handleCopyLink() {
    if (!lastFirestoreSubmissionId) return;
    const link = `${window.location.origin}/submission/${lastFirestoreSubmissionId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({ title: "Link Copied!", description: "Shareable link copied to clipboard." });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
      console.error('Failed to copy link: ', err);
    });
  }

  const sortedCompiledSubmissions = compiledSubmissions; // Already sorted by Firestore query or after edit/add

  function getSubmissionTiles(submission: CompiledCampaignSubmission): TileInfo[] {
    const tiles: TileInfo[] = [];
    let tileValue: string | undefined;
  
    if (submission.customerAvatar) {
      tiles.push({ label: "Avatar", value: submission.customerAvatar.name, icon: <UserCircle className="h-5 w-5"/>, included: true });
    }
    if (submission.ideaTracker) {
      tiles.push({ label: "Idea", value: submission.ideaTracker.concept, icon: <Lightbulb className="h-5 w-5"/>, included: true });
    }
    if (submission.massDesire) {
      tiles.push({ label: "Mass Desire", value: submission.massDesire.name, icon: <Heart className="h-5 w-5"/>, included: true });
    }
    if (submission.featuresToBenefits) {
      tileValue = submission.featuresToBenefits.productFeature;
      if (tileValue && tileValue.length > 15) { 
        tileValue = tileValue.substring(0, 15) + '...';
      }
      tiles.push({ label: "Benefit", value: tileValue, icon: <Gift className="h-5 w-5"/>, included: true });
    }
    if (submission.creativeRoadmap) {
      tiles.push({ label: "Roadmap", value: submission.creativeRoadmap.adConcept, icon: <Map className="h-5 w-5"/>, included: true });
    }
    if (submission.headlinePattern) {
      tiles.push({ label: "Headline", value: "Pattern", icon: <PenSquare className="h-5 w-5"/>, included: true });
    }
    if (submission.mechanization) {
      tiles.push({ label: "Mechanism", value: submission.mechanization.mechanismName, icon: <Sparkles className="h-5 w-5"/>, included: true });
    }
    if (submission.adCreation) {
      tileValue = submission.adCreation.adConcept || submission.adCreation.batchDctNumber || "Ad Creative";
      if (tileValue && tileValue.length > 15) {
         tileValue = tileValue.substring(0, 15) + '...';
      }
      tiles.push({ label: "Ad Creative", value: tileValue, icon: <Package className="h-5 w-5"/>, included: true });
    }
    return tiles;
  }


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
                        {showForm ? 'Modify or compile elements for the campaign submission.' : 'Compile elements into a single campaign. Data synced with Firestore.'}
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
                        <div className="space-y-2"> <Label htmlFor="feature-benefit">Feature & Benefit</Label> <Select value={selectedFeatureBenefit} onValueChange={setSelectedFeatureBenefit}> <SelectTrigger id="feature-benefit"><SelectValue placeholder="Select Feature & Benefit" /></SelectTrigger> <SelectContent> {featuresBenefits.length > 0 ? featuresBenefits.map(item => <SelectItem key={item.id} value={item.id}>{`${item.productFeature.substring(0,20)}... -> ${item.directBenefit.substring(0,20)}...`}</SelectItem>) : <SelectItem value="no-fb" disabled>No feature-benefit pairs.</SelectItem>} </SelectContent> </Select> </div>
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
                    Share link: <code className="bg-muted px-1 rounded text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/submission/{lastFirestoreSubmissionId}</code>
                    </p>
                    <Button variant="outline" size="sm" onClick={handleCopyLink} className="w-full sm:w-auto">
                       <span><Copy className="mr-2 h-3 w-3"/> Copy Link</span>
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
            <CardDescription>This is a list of submissions. Expand to view details or edit.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSubmissions ? (
                 <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading submissions...</p>
                 </div>
            ) : sortedCompiledSubmissions.length > 0 ? (
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
                                By: {submission.submittedBy} on {new Date(submission.submittedAt).toLocaleDateString()}
                                {submission.firestoreId && <span className="ml-2 text-green-600 font-medium">(DB)</span>}
                            </span>
                            <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity mt-1 sm:mt-0">
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); handleEditClick(submission);}}>
                                    <span><Edit className="h-4 w-4"/></span>
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); handleDeleteSubmission(submission);}}>
                                    <span><Trash2 className="h-4 w-4 text-destructive"/></span>
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
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Button variant="link" size="sm" asChild className="px-0">
                                    <a href={`/submission/${submission.firestoreId}`} target="_blank" rel="noopener noreferrer">
                                        View Full Submission Page <Eye className="ml-1 h-4 w-4"/>
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        const link = `${window.location.origin}/submission/${submission.firestoreId}`;
                                        navigator.clipboard.writeText(link).then(() => {
                                            toast({ title: "Link Copied!", description: "Shareable link copied to clipboard." });
                                        }).catch(err => {
                                            toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
                                            console.error('Failed to copy link: ', err);
                                        });
                                    }}
                                >
                                   <span><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link</span>
                                </Button>
                            </div>
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

