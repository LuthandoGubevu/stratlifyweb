
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
import { Send, ListChecks, Eye, Copy, PlusCircle, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { CustomerAvatar } from '../customer-avatars/page';
import type { Idea } from '../idea-tracker/page';
import type { MassDesire } from '../mass-desires/page';
import type { FeatureBenefitPair } from '../features-to-benefits/page';
import type { RoadmapEntry } from '../creative-roadmap/page';
import type { HeadlinePattern } from '../headline-patterns/page';
import type { Mechanism } from '../mechanization/page';
import type { AdCreationFormValues, StoredAdCreationEntry } from '../ad-creation/page'; // Ensure StoredAdCreationEntry is exported

// Firestore imports
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore'; // Added updateDoc, doc, deleteDoc

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
  // Store full objects for Firestore to simplify viewer, or just IDs for local and resolve on view?
  // For now, let's store full objects in Firestore version, and IDs for local.
  // Firestore version will have full nested objects. Local version is lighter.
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
    if (!editingSubmission) setLastFirestoreSubmissionId(null); // Reset for new submissions
    
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
      if (docId) { // Update existing Firestore document
        const docRef = doc(db, "submissions", docId);
        await updateDoc(docRef, firestoreCampaignData);
        setLastFirestoreSubmissionId(docId);
        toast({ title: 'Campaign Updated in Firestore!', description: `"${submissionTitle}" updated. Share link available.` });
      } else { // Add new Firestore document
        const docRef = await addDoc(collection(db, "submissions"), firestoreCampaignData);
        docId = docRef.id;
        setLastFirestoreSubmissionId(docId);
        toast({ title: 'Campaign Submitted to Firestore!', description: `"${submissionTitle}" saved with ID: ${docId}. Share link available.` });
      }

      // Update local storage list
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
        // For local display convenience, we can choose to store full objects too or just IDs.
        // Let's stick to IDs primarily for local, and resolve them if needed for display later.
        // Or, for consistency with Firestore, we can store the objects directly.
        // For simplicity, mirroring the firestore data structure (with full objects for what was selected) in local display
        ...firestoreCampaignData, 
        submittedAt: new Date().toISOString(), // ensure local submittedAt is string
      };

      setCompiledSubmissions(prev => 
        editingSubmission 
        ? prev.map(s => s.id === editingSubmission.id ? localCampaignData : s)
        : [localCampaignData, ...prev]
      );

      setShowForm(false);
      setEditingSubmission(null);
      resetForm(); // Also resets submissionTitle and submittedBy

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

    // Delete from Firestore if firestoreId exists
    if (submission.firestoreId) {
      try {
        await deleteDoc(doc(db, "submissions", submission.firestoreId));
        toast({ title: "Firestore Deletion Successful", description: `Submission "${submission.submissionTitle}" removed from Firestore.`});
      } catch (error) {
        console.error("Error deleting submission from Firestore: ", error);
        toast({ title: "Firestore Deletion Failed", description: "Could not remove submission from database.", variant: "destructive" });
      }
    }

    // Delete from local state and localStorage
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


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-2xl">
                        {showForm ? (editingSubmission ? 'Edit Campaign Submission' : 'New Campaign Submission') : 'Campaign Submissions'}
                    </CardTitle>
                    <CardDescription>
                        {showForm ? 'Modify or compile elements for the campaign submission.' : 'Compile elements into a single campaign. Saved to Firestore & locally.'}
                    </CardDescription>
                </div>
                {!showForm ? (
                    <Button onClick={handleCreateNewClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Submission
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleBackToList}>
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
                        {/* Customer Avatar */}
                        <div className="space-y-2"> <Label htmlFor="customer-avatar">Customer Avatar</Label> <Select value={selectedAvatar} onValueChange={setSelectedAvatar}> <SelectTrigger id="customer-avatar"><SelectValue placeholder="Select Avatar" /></SelectTrigger> <SelectContent> {avatars.length > 0 ? avatars.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>) : <SelectItem value="no-avatars" disabled>No avatars defined.</SelectItem>} </SelectContent> </Select> </div>
                        {/* Ad Concept (Idea Tracker) */}
                        <div className="space-y-2"> <Label htmlFor="ad-concept">Ad Concept (Idea Tracker)</Label> <Select value={selectedAdConcept} onValueChange={setSelectedAdConcept}> <SelectTrigger id="ad-concept"><SelectValue placeholder="Select Ad Concept" /></SelectTrigger> <SelectContent> {adConcepts.length > 0 ? adConcepts.map(item => <SelectItem key={item.id} value={item.id}>{item.concept}</SelectItem>) : <SelectItem value="no-concepts" disabled>No concepts found.</SelectItem>} </SelectContent> </Select> </div>
                        {/* Mass Desire */}
                        <div className="space-y-2"> <Label htmlFor="mass-desire">Mass Desire</Label> <Select value={selectedMassDesire} onValueChange={setSelectedMassDesire}> <SelectTrigger id="mass-desire"><SelectValue placeholder="Select Mass Desire" /></SelectTrigger> <SelectContent> {massDesires.length > 0 ? massDesires.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>) : <SelectItem value="no-desires" disabled>No mass desires defined.</SelectItem>} </SelectContent> </Select> </div>
                        {/* Feature & Benefit */}
                        <div className="space-y-2"> <Label htmlFor="feature-benefit">Feature & Benefit</Label> <Select value={selectedFeatureBenefit} onValueChange={setSelectedFeatureBenefit}> <SelectTrigger id="feature-benefit"><SelectValue placeholder="Select Feature & Benefit" /></SelectTrigger> <SelectContent> {featuresBenefits.length > 0 ? featuresBenefits.map(item => <SelectItem key={item.id} value={item.id}>{`${item.productFeature.substring(0,20)}... -> ${item.directBenefit.substring(0,20)}...`}</SelectItem>) : <SelectItem value="no-fb" disabled>No feature-benefit pairs.</SelectItem>} </SelectContent> </Select> </div>
                    </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="font-semibold">Strategy & Execution Elements</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Creative Roadmap Entry */}
                        <div className="space-y-2"> <Label htmlFor="creative-roadmap">Creative Roadmap Entry</Label> <Select value={selectedRoadmapEntry} onValueChange={setSelectedRoadmapEntry}> <SelectTrigger id="creative-roadmap"><SelectValue placeholder="Select Roadmap Entry" /></SelectTrigger> <SelectContent> {roadmapEntries.length > 0 ? roadmapEntries.map(item => <SelectItem key={item.id} value={item.id}>{item.dctNumber} - {item.adConcept}</SelectItem>) : <SelectItem value="no-roadmap" disabled>No roadmap entries.</SelectItem>} </SelectContent> </Select> </div>
                        {/* Headline Pattern */}
                        <div className="space-y-2"> <Label htmlFor="headline-pattern">Headline Pattern</Label> <Select value={selectedHeadlinePattern} onValueChange={setSelectedHeadlinePattern}> <SelectTrigger id="headline-pattern"><SelectValue placeholder="Select Headline Pattern" /></SelectTrigger> <SelectContent> {headlinePatterns.length > 0 ? headlinePatterns.map(item => <SelectItem key={item.id} value={item.id}>{item.pattern.substring(0,50)}...</SelectItem>) : <SelectItem value="no-headlines" disabled>No headline patterns.</SelectItem>} </SelectContent> </Select> </div>
                        {/* Product Mechanism */}
                        <div className="space-y-2"> <Label htmlFor="mechanization">Product Mechanism</Label> <Select value={selectedMechanism} onValueChange={setSelectedMechanism}> <SelectTrigger id="mechanization"><SelectValue placeholder="Select Mechanism" /></SelectTrigger> <SelectContent> {mechanisms.length > 0 ? mechanisms.map(item => <SelectItem key={item.id} value={item.id}>{item.mechanismName} ({item.product})</SelectItem>) : <SelectItem value="no-mechanisms" disabled>No mechanisms defined.</SelectItem>} </SelectContent> </Select> </div>
                        {/* Ad Creation Draft */}
                        <div className="space-y-2"> <Label htmlFor="ad-creation-entry">Ad Creation Draft</Label> <Select value={selectedAdCreation} onValueChange={setSelectedAdCreation}> <SelectTrigger id="ad-creation-entry"><SelectValue placeholder="Select Ad Draft" /></SelectTrigger> <SelectContent> {adCreationEntries.length > 0 ? adCreationEntries.map(item => <SelectItem key={item.id} value={item.id}>{(item.data.adConcept || item.data.batchDctNumber || "Untitled Ad Draft").substring(0,40)}... (Saved: {new Date(item.createdAt).toLocaleDateString()})</SelectItem>) : <SelectItem value="no-ad-drafts" disabled>No ad drafts saved.</SelectItem>} </SelectContent> </Select> </div>
                    </div>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>

            </CardContent>
            <CardFooter className="flex-col items-start space-y-4">
                <div className="flex w-full justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToList}>Cancel</Button>
                    <Button type="submit" className="" disabled={isSubmitting}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : (editingSubmission ? 'Update Submission' : 'Compile & Save Submission')}
                    </Button>
                </div>
                {lastFirestoreSubmissionId && (
                <div className="w-full p-3 border rounded-md bg-secondary/50 flex items-center justify-between">
                    <p className="text-sm text-foreground truncate">
                    Share link: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}/submission/{lastFirestoreSubmissionId}</code>
                    </p>
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
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
            <CardDescription>This is a list of submissions saved in your browser. Click to view details or edit. (Firestore saved entries are also listed here).</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedCompiledSubmissions.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                {sortedCompiledSubmissions.map(submission => (
                    <AccordionItem value={submission.id} key={submission.id}>
                    <AccordionTrigger className="font-semibold hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                        <span className="truncate pr-2">{submission.submissionTitle}</span>
                        <div className="flex items-center flex-shrink-0">
                            <span className="text-xs text-muted-foreground mr-2">
                                By: {submission.submittedBy} on {new Date(submission.submittedAt instanceof Timestamp ? submission.submittedAt.toDate() : submission.submittedAt as string).toLocaleDateString()}
                                {submission.firestoreId && <span className="ml-2 text-green-600 font-medium">(DB)</span>}
                            </span>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                        {JSON.stringify(submission, (key, value) => 
                            key === 'submittedAt' && typeof value === 'object' && value && 'seconds' in value ? new Date(value.seconds * 1000).toISOString() : value, 
                        2)}
                        </pre>
                        {submission.firestoreId && (
                            <Button variant="link" size="sm" asChild className="px-0">
                                <a href={`/submission/${submission.firestoreId}`} target="_blank" rel="noopener noreferrer">
                                    View Full Submission Page <Eye className="ml-1 h-4 w-4"/>
                                </a>
                            </Button>
                        )}
                    </AccordionContent>
                    </AccordionItem>
                ))}
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
