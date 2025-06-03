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
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; // For optional tags

interface HeadlinePattern {
  id: string;
  pattern: string;
  positioning: string;
  tags?: string[]; // Optional tags
}

const LOCAL_STORAGE_HEADLINES_KEY = 'headlinePatterns';

export default function HeadlinePatternsPage() {
  const [patterns, setPatterns] = useState<HeadlinePattern[]>([]);
  const [newPattern, setNewPattern] = useState('');
  const [newPositioning, setNewPositioning] = useState('');
  const [newTags, setNewTags] = useState(''); // Comma-separated tags
  const { toast } = useToast();

  useEffect(() => {
    const storedPatterns = localStorage.getItem(LOCAL_STORAGE_HEADLINES_KEY);
    if (storedPatterns) {
      setPatterns(JSON.parse(storedPatterns));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_HEADLINES_KEY, JSON.stringify(patterns));
  }, [patterns]);

  const handleAddPattern = (e: FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim() || !newPositioning.trim()) {
      toast({ title: "Error", description: "Pattern and Positioning are required.", variant: "destructive" });
      return;
    }
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const newEntry: HeadlinePattern = {
      id: String(Date.now()),
      pattern: newPattern,
      positioning: newPositioning,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    };
    setPatterns(prev => [newEntry, ...prev]);
    setNewPattern('');
    setNewPositioning('');
    setNewTags('');
    toast({ title: "Pattern Added", description: "New headline pattern saved." });
  };

  const handleDeletePattern = (id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id));
    toast({ title: "Pattern Deleted", description: "Headline pattern removed." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add Headline Pattern</CardTitle>
          <CardDescription>Store and manage your headline frameworks.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddPattern}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pattern">Headline Pattern</Label>
              <Input id="pattern" value={newPattern} onChange={(e) => setNewPattern(e.target.value)} placeholder="e.g., How to [Achieve Desired Outcome] Without [Common Pain Point]" />
            </div>
            <div>
              <Label htmlFor="positioning">Positioning</Label>
              <Input id="positioning" value={newPositioning} onChange={(e) => setNewPositioning(e.target.value)} placeholder="e.g., Problem/Solution, Benefit-driven" />
            </div>
             <div>
              <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
              <Input id="tags" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="e.g., Logical, Emotional, Social Proof" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Pattern
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Existing Headline Patterns</CardTitle>
        </CardHeader>
        <CardContent>
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
                {patterns.map((p) => (
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
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePattern(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {patterns.length === 0 && <p className="text-center text-muted-foreground mt-4">No headline patterns stored yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
