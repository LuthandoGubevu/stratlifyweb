
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PlusCircle, Trash2, Edit, Search, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; 

export interface HeadlinePattern { // Exported for Submissions page
  id: string;
  pattern: string;
  positioning: string;
  tags?: string[]; 
  createdAt: string; // Added createdAt for sorting
}

const LOCAL_STORAGE_HEADLINES_KEY = 'headlinePatterns';

export default function HeadlinePatternsPage() {
  const [patterns, setPatterns] = useState<HeadlinePattern[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<HeadlinePattern | null>(null);

  const [currentPattern, setCurrentPattern] = useState('');
  const [currentPositioning, setCurrentPositioning] = useState('');
  const [currentTags, setCurrentTags] = useState(''); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedPatterns = localStorage.getItem(LOCAL_STORAGE_HEADLINES_KEY);
    if (storedPatterns) {
        try {
            setPatterns(JSON.parse(storedPatterns));
        } catch(e) {
            console.error("Failed to parse headline patterns from localStorage", e);
            setPatterns([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_HEADLINES_KEY, JSON.stringify(patterns));
  }, [patterns]);

  const resetForm = () => {
    setCurrentPattern('');
    setCurrentPositioning('');
    setCurrentTags('');
  };

  const handleCreateNewClick = () => {
    setEditingPattern(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (patternItem: HeadlinePattern) => {
    setEditingPattern(patternItem);
    setCurrentPattern(patternItem.pattern);
    setCurrentPositioning(patternItem.positioning);
    setCurrentTags(patternItem.tags?.join(', ') || '');
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingPattern(null);
    resetForm();
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPattern.trim() || !currentPositioning.trim()) {
      toast({ title: "Error", description: "Pattern and Positioning are required.", variant: "destructive" });
      return;
    }
    const tagsArray = currentTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    let updatedPatterns;

    if (editingPattern) {
        const patternToUpdate: HeadlinePattern = {
            ...editingPattern,
            pattern: currentPattern,
            positioning: currentPositioning,
            tags: tagsArray.length > 0 ? tagsArray : undefined,
        };
        updatedPatterns = patterns.map(p => p.id === editingPattern.id ? patternToUpdate : p);
        toast({ title: "Pattern Updated", description: "Headline pattern has been updated."});
    } else {
        const newEntry: HeadlinePattern = {
          id: String(Date.now()),
          pattern: currentPattern,
          positioning: currentPositioning,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          createdAt: new Date().toISOString(),
        };
        updatedPatterns = [newEntry, ...patterns];
        toast({ title: "Pattern Added", description: "New headline pattern saved." });
    }
    setPatterns(updatedPatterns);
    setShowForm(false);
    setEditingPattern(null);
    resetForm();
  };

  const handleDeletePattern = (idToDelete: string) => {
    const patternToDelete = patterns.find(p => p.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete the pattern "${patternToDelete?.pattern.substring(0,30) || 'this pattern'}"? This cannot be undone.`);
    if (!confirmed) return;

    setPatterns(prev => prev.filter(p => p.id !== idToDelete));
    toast({ title: "Pattern Deleted", description: "Headline pattern removed." });
     if (editingPattern?.id === idToDelete) {
        setShowForm(false);
        setEditingPattern(null);
    }
  };

  const filteredPatterns = patterns.filter(p => 
    p.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.positioning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-2xl">
                        {showForm ? (editingPattern ? 'Edit Headline Pattern' : 'Add Headline Pattern') : 'Headline Patterns'}
                    </CardTitle>
                    <CardDescription>
                        {showForm ? 'Modify or enter details for the headline pattern.' : 'Store and manage your headline frameworks.'}
                    </CardDescription>
                </div>
                {!showForm ? (
                    <Button onClick={handleCreateNewClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Pattern
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleBackToList}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pattern List
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
        {showForm ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                <Label htmlFor="pattern">Headline Pattern *</Label>
                <Input id="pattern" value={currentPattern} onChange={(e) => setCurrentPattern(e.target.value)} placeholder="e.g., How to [Achieve Desired Outcome] Without [Common Pain Point]" required/>
                </div>
                <div>
                <Label htmlFor="positioning">Positioning *</Label>
                <Input id="positioning" value={currentPositioning} onChange={(e) => setCurrentPositioning(e.target.value)} placeholder="e.g., Problem/Solution, Benefit-driven" required/>
                </div>
                <div>
                <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
                <Input id="tags" value={currentTags} onChange={(e) => setCurrentTags(e.target.value)} placeholder="e.g., Logical, Emotional, Social Proof" />
                </div>
                <CardFooter className="p-0 pt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToList} className="w-full sm:w-auto">Cancel</Button>
                    <Button type="submit" className="w-full sm:w-auto">{editingPattern ? 'Save Changes' : 'Add Pattern'}</Button>
                </CardFooter>
            </form>
        ) : (
          <>
            <div className="mb-4">
                <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search patterns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-1/2 md:w-1/3"
                />
                </div>
            </div>
            {filteredPatterns.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Headline Pattern</TableHead>
                        <TableHead>Positioning</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatterns.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium max-w-md break-words">{p.pattern}</TableCell>
                            <TableCell className="max-w-xs break-words">{p.positioning}</TableCell>
                            <TableCell className="max-w-xs">
                            {p.tags && p.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                {p.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                </div>
                            ) : '-'}
                            </TableCell>
                            <TableCell className="space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(p)}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeletePattern(p.id)}>
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
                        {searchTerm ? 'No patterns match your search.' : 'No headline patterns stored yet.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Try a different search term or clear filters.' : 'Click the "Add New Pattern" button to start!'}
                    </p>
                </div>
            )}
          </>
        )}
        </CardContent>
    </Card>
  );
}

