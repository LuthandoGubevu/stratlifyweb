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
import { PlusCircle, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MassDesire {
  id: string;
  name: string;
  category: string; // e.g., Health, Wealth, Relationships, Status, Security
  description: string; // Core emotional driver
  examples: string; // Comma-separated examples of how this desire manifests
  createdAt: string;
}

const LOCAL_STORAGE_DESIRES_KEY = 'massDesiresEntries';

export default function MassDesiresPage() {
  const [desires, setDesires] = useState<MassDesire[]>([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newExamples, setNewExamples] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedDesires = localStorage.getItem(LOCAL_STORAGE_DESIRES_KEY);
    if (storedDesires) {
      setDesires(JSON.parse(storedDesires));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_DESIRES_KEY, JSON.stringify(desires));
  }, [desires]);

  const handleAddDesire = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCategory.trim()) {
      toast({ title: "Error", description: "Desire Name and Category are required.", variant: "destructive" });
      return;
    }
    const newDesire: MassDesire = {
      id: String(Date.now()),
      name: newName,
      category: newCategory,
      description: newDescription,
      examples: newExamples,
      createdAt: new Date().toISOString(),
    };
    setDesires(prev => [newDesire, ...prev]);
    setNewName('');
    setNewCategory('');
    setNewDescription('');
    setNewExamples('');
    toast({ title: "Mass Desire Added", description: "New mass desire saved." });
  };

  const handleDeleteDesire = (id: string) => {
    setDesires(prev => prev.filter(d => d.id !== id));
    toast({ title: "Mass Desire Deleted", description: "Mass desire removed." });
  };

  const filteredDesires = desires.filter(desire => 
    desire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    desire.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    desire.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    desire.examples.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add Mass Desire</CardTitle>
          <CardDescription>Store and categorize core human desires for your marketing. Data saved locally.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddDesire}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Desire Name</Label>
                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Financial Freedom" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g., Wealth, Security, Status" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Core Emotional Driver</Label>
              <Textarea id="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="e.g., To feel secure and independent, to escape the rat race." />
            </div>
            <div>
              <Label htmlFor="examples">Manifestation Examples (Comma-separated)</Label>
              <Input id="examples" value={newExamples} onChange={(e) => setNewExamples(e.target.value)} placeholder="e.g., Early retirement, passive income, luxury travel" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Desire
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Stored Mass Desires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
             <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search desires..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesires.map((desire) => (
                  <TableRow key={desire.id}>
                    <TableCell className="font-medium">{desire.name}</TableCell>
                    <TableCell><Badge variant="secondary">{desire.category}</Badge></TableCell>
                    <TableCell className="max-w-md break-words">{desire.description}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDesire(desire.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredDesires.length === 0 && <p className="text-center text-muted-foreground mt-4">No mass desires stored yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
