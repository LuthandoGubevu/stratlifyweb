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
import { PlusCircle, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [newConcept, setNewConcept] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<Idea['status']>('Raw');
  const [newTags, setNewTags] = useState(''); // Comma-separated
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedIdeas = localStorage.getItem(LOCAL_STORAGE_IDEAS_KEY);
    if (storedIdeas) {
      setIdeas(JSON.parse(storedIdeas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_IDEAS_KEY, JSON.stringify(ideas));
  }, [ideas]);

  const handleAddIdea = (e: FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim()) {
      toast({ title: "Error", description: "Idea concept is required.", variant: "destructive" });
      return;
    }
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const newIdea: Idea = {
      id: String(Date.now()),
      concept: newConcept,
      description: newDescription,
      status: newStatus,
      tags: tagsArray,
      createdAt: new Date().toISOString(),
    };
    setIdeas(prev => [newIdea, ...prev]);
    setNewConcept('');
    setNewDescription('');
    setNewStatus('Raw');
    setNewTags('');
    toast({ title: "Idea Captured", description: "New ad concept idea saved." });
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
    toast({ title: "Idea Deleted", description: "Idea removed from tracker." });
  };

  const filteredIdeas = ideas.filter(idea => 
    idea.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Capture Ad Concept Idea</CardTitle>
          <CardDescription>Jot down raw or semi-formed ad concepts. Data saved locally.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddIdea}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="concept">Idea/Concept</Label>
              <Input id="concept" value={newConcept} onChange={(e) => setNewConcept(e.target.value)} placeholder="e.g., AI-powered productivity for writers" />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Briefly describe the idea" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as Idea['status'])} className="w-full p-2 border rounded-md bg-background">
                  <option value="Raw">Raw</option>
                  <option value="Semi-Formed">Semi-Formed</option>
                  <option value="Developed">Developed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (Comma-separated)</Label>
                <Input id="tags" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="e.g., B2B, SaaS, AI, Video Ad" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Idea
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Tracked Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search ideas by concept, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
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
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteIdea(idea.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredIdeas.length === 0 && <p className="text-center text-muted-foreground mt-4">No ideas found. Start by adding a new one!</p>}
        </CardContent>
      </Card>
    </div>
  );
}
