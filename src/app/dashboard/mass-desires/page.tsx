
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
import { PlusCircle, Trash2, Edit, Search, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MassDesire {
  id: string;
  name: string;
  category: string;
  description: string;
  examples: string;
  createdAt: string;
}

const LOCAL_STORAGE_DESIRES_KEY = 'massDesiresEntries';

export default function MassDesiresPage() {
  const [desires, setDesires] = useState<MassDesire[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDesire, setEditingDesire] = useState<MassDesire | null>(null);

  const [currentName, setCurrentName] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentExamples, setCurrentExamples] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedDesires = localStorage.getItem(LOCAL_STORAGE_DESIRES_KEY);
    if (storedDesires) {
        try {
            setDesires(JSON.parse(storedDesires));
        } catch(e) {
            console.error("Failed to parse mass desires from localStorage", e);
            setDesires([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_DESIRES_KEY, JSON.stringify(desires));
  }, [desires]);

  const resetForm = () => {
    setCurrentName('');
    setCurrentCategory('');
    setCurrentDescription('');
    setCurrentExamples('');
  };

  const handleCreateNewClick = () => {
    setEditingDesire(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (desire: MassDesire) => {
    setEditingDesire(desire);
    setCurrentName(desire.name);
    setCurrentCategory(desire.category);
    setCurrentDescription(desire.description);
    setCurrentExamples(desire.examples);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingDesire(null);
    resetForm();
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentName.trim() || !currentCategory.trim()) {
      toast({ title: "Error", description: "Desire Name and Category are required.", variant: "destructive" });
      return;
    }
    
    let updatedDesires;

    if (editingDesire) {
        const desireToUpdate: MassDesire = {
            ...editingDesire,
            name: currentName,
            category: currentCategory,
            description: currentDescription,
            examples: currentExamples,
        };
        updatedDesires = desires.map(d => d.id === editingDesire.id ? desireToUpdate : d);
        toast({ title: "Mass Desire Updated", description: `Desire "${currentName}" has been updated.`});
    } else {
        const newDesire: MassDesire = {
          id: String(Date.now()),
          name: currentName,
          category: currentCategory,
          description: currentDescription,
          examples: currentExamples,
          createdAt: new Date().toISOString(),
        };
        updatedDesires = [newDesire, ...desires];
        toast({ title: "Mass Desire Added", description: `New desire "${currentName}" saved.` });
    }
    setDesires(updatedDesires);
    setShowForm(false);
    setEditingDesire(null);
    resetForm();
  };

  const handleDeleteDesire = (idToDelete: string) => {
    const desireToDelete = desires.find(d => d.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete the desire "${desireToDelete?.name || 'this desire'}"? This cannot be undone.`);
    if(!confirmed) return;

    setDesires(prev => prev.filter(d => d.id !== idToDelete));
    toast({ title: "Mass Desire Deleted", description: `Desire "${desireToDelete?.name}" removed.` });
    if (editingDesire?.id === idToDelete) {
        setShowForm(false);
        setEditingDesire(null);
    }
  };

  const filteredDesires = desires.filter(desire => 
    desire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    desire.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    desire.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    desire.examples.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-2xl">
                        {showForm ? (editingDesire ? 'Edit Mass Desire' : 'Add Mass Desire') : 'Mass Desires'}
                    </CardTitle>
                    <CardDescription>
                        {showForm ? 'Modify or enter details for the mass desire.' : 'Store and categorize core human desires. Data saved locally.'}
                    </CardDescription>
                </div>
                {!showForm ? (
                    <Button onClick={handleCreateNewClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Desire
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleBackToList}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Desire List
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
        {showForm ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="name">Desire Name *</Label>
                    <Input id="name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} placeholder="e.g., Financial Freedom" required />
                    </div>
                    <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input id="category" value={currentCategory} onChange={(e) => setCurrentCategory(e.target.value)} placeholder="e.g., Wealth, Security, Status" required />
                    </div>
                </div>
                <div>
                    <Label htmlFor="description">Core Emotional Driver</Label>
                    <Textarea id="description" value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} placeholder="e.g., To feel secure and independent, to escape the rat race." />
                </div>
                <div>
                    <Label htmlFor="examples">Manifestation Examples (Comma-separated)</Label>
                    <Input id="examples" value={currentExamples} onChange={(e) => setCurrentExamples(e.target.value)} placeholder="e.g., Early retirement, passive income, luxury travel" />
                </div>
                <CardFooter className="p-0 pt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToList} className="w-full sm:w-auto">Cancel</Button>
                    <Button type="submit" className="w-full sm:w-auto">{editingDesire ? 'Save Changes' : 'Add Desire'}</Button>
                </CardFooter>
            </form>
        ) : (
          <>
            <div className="mb-4">
                <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search desires..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-1/2 md:w-1/3"
                />
                </div>
            </div>
            {filteredDesires.length > 0 ? (
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
                            <TableCell className="space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(desire)}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDesire(desire.id)}>
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
                    {searchTerm ? 'No desires match your search.' : 'No mass desires stored yet.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try a different search term or clear filters.' : 'Click the "Add New Desire" button to start!'}
                    </p>
                </div>
                )}
            </>
            )}
        </CardContent>
    </Card>
  );
}


