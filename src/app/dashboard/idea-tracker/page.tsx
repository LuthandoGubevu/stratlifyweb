
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Edit, Search, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


interface Idea {
  id: string;
  concept: string;
  description: string;
  status: 'Raw' | 'Semi-Formed' | 'Developed';
  tags: string[];
  createdAt: string;
}

const LOCAL_STORAGE_IDEAS_KEY = 'ideaTrackerEntries';

export default function IdeaTrackerPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  
  const [currentConcept, setCurrentConcept] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentStatus, setCurrentStatus] = useState<Idea['status']>('Raw');
  const [currentTags, setCurrentTags] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedIdeas = localStorage.getItem(LOCAL_STORAGE_IDEAS_KEY);
    if (storedIdeas) {
      try {
        setIdeas(JSON.parse(storedIdeas));
      } catch (e) {
        console.error("Failed to parse ideas from localStorage", e);
        setIdeas([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_IDEAS_KEY, JSON.stringify(ideas));
  }, [ideas]);

  const resetForm = () => {
    setCurrentConcept('');
    setCurrentDescription('');
    setCurrentStatus('Raw');
    setCurrentTags('');
  };

  const handleCreateNewClick = () => {
    setEditingIdea(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (idea: Idea) => {
    setEditingIdea(idea);
    setCurrentConcept(idea.concept);
    setCurrentDescription(idea.description);
    setCurrentStatus(idea.status);
    setCurrentTags(idea.tags.join(', '));
    setShowForm(true);
  };
  
  const handleBackToList = () => {
    setShowForm(false);
    setEditingIdea(null);
    resetForm();
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentConcept.trim()) {
      toast({ title: "Error", description: "Idea concept is required.", variant: "destructive" });
      return;
    }
    const tagsArray = currentTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    let updatedIdeas;

    if (editingIdea) {
      const ideaToUpdate: Idea = {
        ...editingIdea,
        concept: currentConcept,
        description: currentDescription,
        status: currentStatus,
        tags: tagsArray,
      };
      updatedIdeas = ideas.map(idea => idea.id === editingIdea.id ? ideaToUpdate : idea);
      toast({ title: "Idea Updated", description: `Idea "${currentConcept}" has been updated.` });
    } else {
      const newIdea: Idea = {
        id: String(Date.now()),
        concept: currentConcept,
        description: currentDescription,
        status: currentStatus,
        tags: tagsArray,
        createdAt: new Date().toISOString(),
      };
      updatedIdeas = [newIdea, ...ideas];
      toast({ title: "Idea Captured", description: `New idea "${currentConcept}" has been saved.` });
    }
    setIdeas(updatedIdeas);
    setShowForm(false);
    setEditingIdea(null);
    resetForm();
  };

  const handleDeleteIdea = (idToDelete: string) => {
    const ideaToDelete = ideas.find(d => d.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete the idea "${ideaToDelete?.concept || 'this idea'}"? This cannot be undone.`);
    if (!confirmed) return;

    setIdeas(prev => prev.filter(idea => idea.id !== idToDelete));
    toast({ title: "Idea Deleted", description: `Idea "${ideaToDelete?.concept}" removed from tracker.` });
    if (editingIdea?.id === idToDelete) {
        setShowForm(false);
        setEditingIdea(null);
    }
  };

  const filteredIdeas = ideas.filter(idea => 
    idea.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const statusOptions: Idea['status'][] = ['Raw', 'Semi-Formed', 'Developed'];


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline text-2xl">
              {showForm ? (editingIdea ? 'Edit Idea' : 'Capture Ad Concept Idea') : 'Idea Tracker'}
            </CardTitle>
            <CardDescription>
              {showForm ? 'Modify or enter the details for your ad concept idea.' : 'Manage your ad concepts. Data saved locally.'}
            </CardDescription>
          </div>
          {!showForm ? (
            <Button onClick={handleCreateNewClick}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Idea
            </Button>
          ) : (
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Idea List
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <Label htmlFor="concept">Idea/Concept *</Label>
              <Input id="concept" value={currentConcept} onChange={(e) => setCurrentConcept(e.target.value)} placeholder="e.g., AI-powered productivity for writers" required />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} placeholder="Briefly describe the idea" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={currentStatus} onValueChange={(val) => setCurrentStatus(val as Idea['status'])}>
                    <SelectTrigger id="status"><SelectValue placeholder="Select status"/></SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (Comma-separated)</Label>
                <Input id="tags" value={currentTags} onChange={(e) => setCurrentTags(e.target.value)} placeholder="e.g., B2B, SaaS, AI, Video Ad" />
              </div>
            </div>
            <CardFooter className="p-0 pt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2">
                <Button type="button" variant="outline" onClick={handleBackToList} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">{editingIdea ? 'Save Changes' : 'Add Idea'}</Button>
            </CardFooter>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder="Search ideas by concept, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-1/2 md:w-1/3"
                />
              </div>
            </div>
            {filteredIdeas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concept</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIdeas.map((idea) => (
                      <TableRow key={idea.id}>
                        <TableCell className="font-medium max-w-xs break-words">{idea.concept}</TableCell>
                        <TableCell><Badge variant={idea.status === 'Developed' ? 'default' : idea.status === 'Semi-Formed' ? 'secondary' : 'outline'}>{idea.status}</Badge></TableCell>
                        <TableCell className="max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {idea.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(idea.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(idea)}>
                            <Edit className="h-4 w-4"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteIdea(idea.id)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
               <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-2">
                  {searchTerm ? 'No ideas match your search.' : 'No ideas captured yet.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try a different search term or clear filters.' : 'Click the "Add New Idea" button to start!'}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

        
        
