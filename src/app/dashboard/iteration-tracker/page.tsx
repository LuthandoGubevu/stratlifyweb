
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
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Repeat } from 'lucide-react';
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
  createdAt: string; // Added for sorting
}

const LOCAL_STORAGE_KEY = 'iterationTrackerEntries';

export default function IterationTrackerPage() {
  const [entries, setEntries] = useState<IterationEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntryData, setCurrentEntryData] = useState<Partial<Omit<IterationEntry, 'id'|'createdAt'>>>({});
  const [editingEntry, setEditingEntry] = useState<IterationEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEntries) {
        try {
            setEntries(JSON.parse(storedEntries));
        } catch(e) {
            console.error("Failed to parse iteration entries from localStorage", e);
            setEntries([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const resetForm = () => {
    setCurrentEntryData({
        batchDctNumber: '', adConcept: '', linkToAdset: '',
        level1: '', level2: '', level3: '', level4: ''
    });
  };
  
  const handleAddOrUpdateEntry = () => {
    if (!currentEntryData.batchDctNumber || !currentEntryData.adConcept) {
      toast({ title: "Error", description: "Batch/DCT # and Ad Concept are required.", variant: "destructive" });
      return;
    }

    let updatedEntries;

    if (editingEntry) {
      const entryToUpdate: IterationEntry = { 
        ...editingEntry, 
        ...currentEntryData,
        // Ensure all fields are present, even if partial was used for form
        batchDctNumber: currentEntryData.batchDctNumber || editingEntry.batchDctNumber,
        adConcept: currentEntryData.adConcept || editingEntry.adConcept,
        linkToAdset: currentEntryData.linkToAdset || editingEntry.linkToAdset,
        level1: currentEntryData.level1 || editingEntry.level1,
        level2: currentEntryData.level2 || editingEntry.level2,
        level3: currentEntryData.level3 || editingEntry.level3,
        level4: currentEntryData.level4 || editingEntry.level4,
       };
      updatedEntries = entries.map(e => e.id === editingEntry.id ? entryToUpdate : e);
      toast({ title: "Entry Updated", description: "Iteration details saved." });
    } else {
      const newEntry: IterationEntry = {
        id: String(Date.now()),
        batchDctNumber: currentEntryData.batchDctNumber || '',
        adConcept: currentEntryData.adConcept || '',
        linkToAdset: currentEntryData.linkToAdset || '',
        level1: currentEntryData.level1 || '',
        level2: currentEntryData.level2 || '',
        level3: currentEntryData.level3 || '',
        level4: currentEntryData.level4 || '',
        createdAt: new Date().toISOString(),
      };
      updatedEntries = [newEntry, ...entries];
      toast({ title: "Entry Added", description: "New iteration tracked." });
    }
    setEntries(updatedEntries);
    setIsDialogOpen(false);
    setEditingEntry(null);
    resetForm();
  };

  const openEditModal = (entry: IterationEntry) => {
    setEditingEntry(entry);
    setCurrentEntryData({ // Populate form with existing data
        batchDctNumber: entry.batchDctNumber,
        adConcept: entry.adConcept,
        linkToAdset: entry.linkToAdset,
        level1: entry.level1,
        level2: entry.level2,
        level3: entry.level3,
        level4: entry.level4,
    });
    setIsDialogOpen(true);
  };
  
  const openAddModal = () => {
    setEditingEntry(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = (idToDelete: string) => {
    const entryToDelete = entries.find(e => e.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete iteration for "${entryToDelete?.adConcept || 'this entry'}"? This cannot be undone.`);
    if (!confirmed) return;

    setEntries(prev => prev.filter(entry => entry.id !== idToDelete));
    toast({ title: "Entry Deleted", description: "Iteration removed from tracker." });
    if (editingEntry?.id === idToDelete) {
        setIsDialogOpen(false);
        setEditingEntry(null);
    }
  };
  
  const levels: (keyof Omit<IterationEntry, 'id'|'createdAt'|'batchDctNumber'|'adConcept'|'linkToAdset'>)[] = ['level1', 'level2', 'level3', 'level4'];
  
  const sortedEntries = [...entries].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
        {sortedEntries.length > 0 ? (
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
                {sortedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                    <TableCell>{entry.batchDctNumber}</TableCell>
                    <TableCell>{entry.adConcept}</TableCell>
                    <TableCell>
                        <a href={entry.linkToAdset.startsWith('http') ? entry.linkToAdset : `https://${entry.linkToAdset}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {entry.linkToAdset ? 'View Adset' : '-'}
                        </a>
                    </TableCell>
                    {levels.map(level => <TableCell key={level}>{entry[level] || '-'}</TableCell>)}
                    <TableCell className="space-x-1">
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
        ) : (
             <div className="text-center py-12">
                <Repeat className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mt-4 mb-2">No iterations tracked yet.</p>
                <p className="text-sm text-muted-foreground">Click "Add Entry" to start tracking your ad iterations!</p>
            </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setEditingEntry(null); // Reset editing state when dialog closes
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingEntry ? 'Edit Iteration Entry' : 'Add New Iteration Entry'}</DialogTitle>
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
                  value={currentEntryData[field.id as keyof typeof currentEntryData] || ''}
                  onChange={(e) => setCurrentEntryData(prev => ({ ...prev, [field.id]: e.target.value }))}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
                setIsDialogOpen(false); 
                setEditingEntry(null); 
                resetForm();
            }}>Cancel</Button>
            <Button onClick={handleAddOrUpdateEntry}>{editingEntry ? 'Save Changes' : 'Add Entry'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
