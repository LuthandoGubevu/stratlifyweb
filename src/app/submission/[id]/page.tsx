
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, Timestamp, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MessageSquare, Send, UserCircle, Edit3 } from 'lucide-react';
import Image from 'next/image';

import type { CustomerAvatar } from '@/app/dashboard/customer-avatars/page';
import type { Idea } from '@/app/dashboard/idea-tracker/page';
import type { MassDesire } from '@/app/dashboard/mass-desires/page';
import type { FeatureBenefitPair } from '@/app/dashboard/features-to-benefits/page';
import type { RoadmapEntry } from '@/app/dashboard/creative-roadmap/page';
import type { HeadlinePattern } from '@/app/dashboard/headline-patterns/page';
import type { Mechanism } from '@/app/dashboard/mechanization/page';
import type { AdCreationFormValues } from '@/app/dashboard/ad-creation/page';

interface SubmissionData {
  id?: string;
  submissionTitle: string;
  submittedBy: string;
  submittedAt: Timestamp;
  customerAvatar?: CustomerAvatar | null;
  ideaTracker?: Idea | null;
  massDesire?: MassDesire | null;
  featuresToBenefits?: FeatureBenefitPair | null;
  creativeRoadmap?: RoadmapEntry | null;
  headlinePattern?: HeadlinePattern | null;
  mechanization?: Mechanism | null;
  adCreation?: AdCreationFormValues | null;
}

interface SubmissionNote {
  id: string;
  userId: string;
  userName: string | null;
  text: string;
  createdAt: Timestamp;
}

const DetailCard: React.FC<{ title: string; data?: Record<string, any> | null, children?: React.ReactNode }> = ({ title, data, children }) => {
  if (!data && !children) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {children ? children : 
          data && Object.entries(data).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) return null; // Skip nested objects for simple display
            if (value === undefined || value === null || value === '') return null;
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <div key={key}>
                <span className="font-semibold">{formattedKey}:</span> {String(value)}
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
};


export default function SubmissionViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const submissionId = typeof params.id === 'string' ? params.id : undefined;

  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [notes, setNotes] = useState<SubmissionNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    if (!submissionId) {
      setError("Invalid submission ID.");
      setLoading(false);
      return;
    }

    const fetchSubmission = async () => {
      setLoading(true);
      try {
        const submissionDocRef = doc(db, "submissions", submissionId);
        const submissionDocSnap = await getDoc(submissionDocRef);

        if (submissionDocSnap.exists()) {
          setSubmission({ id: submissionDocSnap.id, ...submissionDocSnap.data() } as SubmissionData);
        } else {
          setError("Submission not found.");
        }
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError("Failed to load submission data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();

    // Subscribe to notes
    const notesQuery = query(collection(db, "submissions", submissionId, "notes"), orderBy("createdAt", "asc"));
    const unsubscribeNotes = onSnapshot(notesQuery, (querySnapshot) => {
      const fetchedNotes: SubmissionNote[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNotes.push({ id: doc.id, ...doc.data() } as SubmissionNote);
      });
      setNotes(fetchedNotes);
    }, (err) => {
      console.error("Error fetching notes:", err);
      toast({ title: "Error", description: "Could not fetch notes.", variant: "destructive" });
    });
    
    return () => unsubscribeNotes();

  }, [submissionId, router]);


  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user || !submissionId) return;
    setIsSubmittingNote(true);
    try {
      await addDoc(collection(db, "submissions", submissionId, "notes"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        text: newNote,
        createdAt: serverTimestamp(),
      });
      setNewNote('');
      toast({ title: "Note Added", description: "Your feedback has been saved." });
    } catch (err) {
      console.error("Error adding note:", err);
      toast({ title: "Error", description: "Failed to save note.", variant: "destructive" });
    } finally {
      setIsSubmittingNote(false);
    }
  };
  
  const { toast } = useToast(); // Must be called unconditionally


  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  if (!submission) {
    return <div className="container mx-auto p-4">Submission data could not be loaded.</div>;
  }
  
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">{submission.submissionTitle}</CardTitle>
          <CardDescription className="text-md">
            Submitted by: {submission.submittedBy} on {formatDate(submission.submittedAt)}
          </CardDescription>
        </CardHeader>
      </Card>

      {submission.customerAvatar && (
        <DetailCard title="Customer Avatar" data={null}>
            <div className="flex items-start space-x-4">
                {submission.customerAvatar.imageUrl && (
                     <Image 
                        src={submission.customerAvatar.imageUrl || `https://placehold.co/100x100.png?text=${submission.customerAvatar.name.charAt(0)}`} 
                        alt={submission.customerAvatar.name} 
                        width={80} height={80} 
                        className="rounded-lg object-cover border"
                        data-ai-hint="profile avatar"
                      />
                )}
                <div className="space-y-1">
                    <p><span className="font-semibold">Name:</span> {submission.customerAvatar.name}</p>
                    <p><span className="font-semibold">Demographics:</span> {submission.customerAvatar.demographics}</p>
                    <p><span className="font-semibold">Psychographics:</span> {submission.customerAvatar.psychographics}</p>
                    <p><span className="font-semibold">Preferred Channels:</span> {submission.customerAvatar.preferredChannels}</p>
                    {submission.customerAvatar.tags && submission.customerAvatar.tags.length > 0 && (
                        <p><span className="font-semibold">Tags:</span> {submission.customerAvatar.tags.join(', ')}</p>
                    )}
                </div>
            </div>
        </DetailCard>
      )}
      {submission.ideaTracker && <DetailCard title="Ad Concept / Idea" data={submission.ideaTracker} />}
      {submission.massDesire && <DetailCard title="Mass Desire" data={submission.massDesire} />}
      {submission.featuresToBenefits && <DetailCard title="Feature to Benefit" data={submission.featuresToBenefits} />}
      {submission.headlinePattern && <DetailCard title="Headline Pattern" data={submission.headlinePattern} />}
      {submission.mechanization && <DetailCard title="Product Mechanism" data={submission.mechanization} />}
      
      {submission.creativeRoadmap && (
        <DetailCard title="Creative Roadmap Details" data={null}>
             <p><span className="font-semibold">DCT Number:</span> {submission.creativeRoadmap.dctNumber}</p>
             <p><span className="font-semibold">Ad Concept:</span> {submission.creativeRoadmap.adConcept}</p>
             <p><span className="font-semibold">Status:</span> {submission.creativeRoadmap.status}</p>
             <p><span className="font-semibold">Persona:</span> {submission.creativeRoadmap.persona}</p>
             <p><span className="font-semibold">Mass Desire:</span> {submission.creativeRoadmap.massDesire}</p>
             <p><span className="font-semibold">Awareness:</span> {submission.creativeRoadmap.awareness}</p>
             <p><span className="font-semibold">Sophistication:</span> {submission.creativeRoadmap.sophistication}</p>
             <p><span className="font-semibold">Format:</span> {submission.creativeRoadmap.format}</p>
             {submission.creativeRoadmap.dateLaunched && <p><span className="font-semibold">Date Launched:</span> {formatDate(Timestamp.fromDate(new Date(submission.creativeRoadmap.dateLaunched)))}</p>}
        </DetailCard>
      )}

      {submission.adCreation && (
         <DetailCard title="Ad Creation Details">
            <div className="space-y-1">
                <p><span className="font-semibold">Batch/DCT #:</span> {submission.adCreation.batchDctNumber}</p>
                <p><span className="font-semibold">Ad Concept:</span> {submission.adCreation.adConcept}</p>
                <p><span className="font-semibold">Product Description:</span> {submission.adCreation.productDescription}</p>
                <p><span className="font-semibold">Desire Targeted:</span> {submission.adCreation.desireTargeted}</p>
                <p><span className="font-semibold">Market Awareness:</span> {submission.adCreation.marketAwareness}</p>
                <p><span className="font-semibold">Market Sophistication:</span> {submission.adCreation.marketSophistication}</p>
                {submission.adCreation.hookPatterns && submission.adCreation.hookPatterns.length > 0 && (
                    <p><span className="font-semibold">Hook Patterns:</span> {submission.adCreation.hookPatterns.join(', ')}</p>
                )}
                <p><span className="font-semibold">New Headline:</span> {submission.adCreation.headline2New}</p>
                <p><span className="font-semibold">New Body Copy:</span> {submission.adCreation.bodyCopy2New}</p>
                <p><span className="font-semibold">CTA:</span> {submission.adCreation.cta}</p>
                <p><span className="font-semibold">Landing Page:</span> {submission.adCreation.landingPage}</p>
            </div>
        </DetailCard>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Feedback & Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user && (
            <form onSubmit={handleAddNote} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="newNote">Add your note:</Label>
                <Textarea
                  id="newNote"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type your feedback here..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isSubmittingNote || !newNote.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmittingNote ? "Saving Note..." : "Save Note"}
              </Button>
            </form>
          )}
          {!user && <p className="text-sm text-muted-foreground mb-4">You must be logged in to add notes.</p>}
          
          <div className="space-y-4">
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            {notes.map((note) => (
              <div key={note.id} className="p-3 border rounded-md bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold flex items-center">
                        <UserCircle className="mr-1.5 h-4 w-4 text-muted-foreground"/>
                        {note.userName || 'User ' + note.userId.substring(0,6)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

    