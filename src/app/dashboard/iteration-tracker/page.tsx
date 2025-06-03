'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IterationEntry {
  id: string;
  batchDctNumber: string;
  adConcept: string;
  linkToAdset: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
}

const LOCAL_STORAGE_KEY = 'iterationTrackerEntries';

export default function IterationTrackerPage() {
  const [entries, setEntries] = useState<IterationEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<IterationEntry>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleAddOrUpdateEntry = () => {
    if (!currentEntry.batchDctNumber || !currentEntry.adConcept) {
      toast({ title: "Error", description: "Batch/DCT # and Ad Concept are required.", variant: "destructive" });
      return;
    }

    if (isEditing && currentEntry.id) {
      setEntries(prev => prev.map(e => e.id === currentEntry.id ? { ...e, ...currentEntry } as IterationEntry : e));
      toast({ title: "Entry Updated", description: "Iteration details saved." });
    } else {
      const newEntry: IterationEntry = {
        id: String(Date.now()),
        batchDctNumber: currentEntry.batchDctNumber || '',
        adConcept: currentEntry.adConcept || '',
        linkToAdset: currentEntry.linkToAdset || '',
        level1: currentEntry.level1 || '',
        level2: currentEntry.level2 || '',
        level3: currentEntry.level3 || '',
        level4: currentEntry.level4 || '',
      };
      setEntries(prev => [newEntry, ...prev]);
      toast({ title: "Entry Added", description: "New iteration tracked." });
    }
    setIsDialogOpen(false);
    setCurrentEntry({});
    setIsEditing(false);
  };

  const openEditModal = (entry: IterationEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
    setIsDialogOpen(true);
  };
  
  const openAddModal = () => {
    setCurrentEntry({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({ title: "Entry Deleted", description: "Iteration removed from tracker." });
  };
  
  const levels: (keyof IterationEntry)[] = ['level1', 'level2', 'level3', 'level4'];

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline text-2xl">Iteration Tracker</CardTitle>
          <CardDescription>Track how ad concepts are iterated over time. Data saved to local storage.</CardDescription>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" /> Add Entry
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch / DCT #</TableHead>
                <TableHead>Ad Concept</TableHead>
                <TableHead>Link to Adset</TableHead>
                {levels.map(level => <TableHead key={level}>Level {level.charAt(level.length-1)}</TableHead>)}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.batchDctNumber}</TableCell>
                  <TableCell>{entry.adConcept}</TableCell>
                  <TableCell>
                    <a href={entry.linkToAdset} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {entry.linkToAdset ? 'View Adset' : '-'}
                    </a>
                  </TableCell>
                  {levels.map(level => <TableCell key={level}>{entry[level] || '-'}</TableCell>)}
                  <TableCell className="space-x-2">
                     <Button variant="ghost" size="icon" onClick={() => openEditModal(entry)}>
                        <Edit className="h-4 w-4"/>
                      </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {entries.length === 0 && <p className="text-center text-muted-foreground mt-4">No iterations tracked yet. Add an entry to get started.</p>}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{isEditing ? 'Edit Iteration Entry' : 'Add New Iteration Entry'}</DialogTitle>
            <DialogDescription>
              Fill in the details for this ad iteration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { id: 'batchDctNumber', label: 'Batch / DCT #', required: true },
              { id: 'adConcept', label: 'Ad Concept', required: true },
              { id: 'linkToAdset', label: 'Link to Adset' },
              ...levels.map(level => ({id: level, label: `Level ${level.charAt(level.length-1)} Test`}))
            ].map(field => (
              <div className="grid grid-cols-4 items-center gap-4" key={field.id}>
                <Label htmlFor={field.id} className="text-right">
                  {field.label}{field.required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id={field.id}
                  value={currentEntry[field.id as keyof IterationEntry] || ''}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, [field.id]: e.target.value }))}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddOrUpdateEntry}>{isEditing ? 'Save Changes' : 'Add Entry'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
