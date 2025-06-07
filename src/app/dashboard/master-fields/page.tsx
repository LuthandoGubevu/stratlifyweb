
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Filter, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface MasterFieldEntry {
  id: string;
  addedBy: string; 
  status: 'Pending' | 'Approved' | 'Rejected' | 'Live' | 'Paused';
  winningAdFound: 'Yes' | 'No' | 'Testing';
  avatarName: string;
  createdAt: string;
}

const LOCAL_STORAGE_MASTERFIELDS_KEY = 'masterFieldEntries';
const ALL_STATUSES_VALUE = '__all_statuses__';
const ALL_AVATARS_VALUE = '__all_avatars__';

const statusOptions: MasterFieldEntry['status'][] = ['Pending', 'Approved', 'Rejected', 'Live', 'Paused'];
const winningAdOptions: MasterFieldEntry['winningAdFound'][] = ['Yes', 'No', 'Testing'];


export default function MasterFieldsPage() {
  const [entries, setEntries] = useState<MasterFieldEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MasterFieldEntry | null>(null);
  
  const [currentAddedBy, setCurrentAddedBy] = useState('');
  const [currentStatus, setCurrentStatus] = useState<MasterFieldEntry['status']>('Pending');
  const [currentWinningAdFound, setCurrentWinningAdFound] = useState<MasterFieldEntry['winningAdFound']>('Testing');
  const [currentAvatarName, setCurrentAvatarName] = useState('');
  
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAvatar, setFilterAvatar] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const storedEntries = localStorage.getItem(LOCAL_STORAGE_MASTERFIELDS_KEY);
    if (storedEntries) {
        try {
            setEntries(JSON.parse(storedEntries));
        } catch(e) {
            console.error("Failed to parse master field entries from localStorage", e);
            setEntries([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MASTERFIELDS_KEY, JSON.stringify(entries));
  }, [entries]);

  const resetForm = () => {
    setCurrentAddedBy('');
    setCurrentStatus('Pending');
    setCurrentWinningAdFound('Testing');
    setCurrentAvatarName('');
  };

  const handleCreateNewClick = () => {
    setEditingEntry(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (entry: MasterFieldEntry) => {
    setEditingEntry(entry);
    setCurrentAddedBy(entry.addedBy);
    setCurrentStatus(entry.status);
    setCurrentWinningAdFound(entry.winningAdFound);
    setCurrentAvatarName(entry.avatarName);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingEntry(null);
    resetForm();
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentAddedBy.trim() || !currentAvatarName.trim()) {
      toast({ title: "Error", description: "Added By (initials) and Avatar Name are required.", variant: "destructive" });
      return;
    }
    
    let updatedEntries;

    if (editingEntry) {
        const entryToUpdate: MasterFieldEntry = {
            ...editingEntry,
            addedBy: currentAddedBy,
            status: currentStatus,
            winningAdFound: currentWinningAdFound,
            avatarName: currentAvatarName,
        };
        updatedEntries = entries.map(item => item.id === editingEntry.id ? entryToUpdate : item);
        toast({ title: "Entry Updated", description: "Master field entry has been updated."});
    } else {
        const entryToAdd: MasterFieldEntry = {
          id: String(Date.now()),
          addedBy: currentAddedBy,
          status: currentStatus,
          winningAdFound: currentWinningAdFound,
          avatarName: currentAvatarName,
          createdAt: new Date().toISOString(),
        };
        updatedEntries = [entryToAdd, ...entries];
        toast({ title: "Entry Added", description: "New master field entry saved." });
    }
    setEntries(updatedEntries);
    setShowForm(false);
    setEditingEntry(null);
    resetForm();
  };

  const handleDeleteEntry = (idToDelete: string) => {
    const entryToDelete = entries.find(item => item.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete this entry (Avatar: ${entryToDelete?.avatarName || 'N/A'})? This cannot be undone.`);
    if (!confirmed) return;

    setEntries(prev => prev.filter(entry => entry.id !== idToDelete));
    toast({ title: "Entry Deleted", description: "Master field entry removed." });
     if (editingEntry?.id === idToDelete) {
        setShowForm(false);
        setEditingEntry(null);
    }
  };

  const filteredEntries = entries.filter(entry => 
    (filterStatus ? entry.status === filterStatus : true) &&
    (filterAvatar ? entry.avatarName.toLowerCase().includes(filterAvatar.toLowerCase()) : true)
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const uniqueAvatarNames = Array.from(new Set(entries.map(e => e.avatarName))).filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">
                    {showForm ? (editingEntry ? 'Edit Master Field Entry' : 'Add Master Field Entry') : 'Master Fields'}
                </CardTitle>
                <CardDescription>
                    {showForm ? 'Modify or enter details for the master field entry.' : 'Manage internal tagging for submissions or entries.'}
                </CardDescription>
            </div>
            {!showForm ? (
                <Button onClick={handleCreateNewClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Entry
                </Button>
            ) : (
                <Button variant="outline" onClick={handleBackToList}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entry List
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="addedBy">Added By (Initials) *</Label>
                    <Input id="addedBy" value={currentAddedBy} onChange={(e) => setCurrentAddedBy(e.target.value)} placeholder="e.g., JD" maxLength={3} required />
                    </div>
                    <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select value={currentStatus} onValueChange={(val) => setCurrentStatus(val as MasterFieldEntry['status'])} required>
                        <SelectTrigger id="status"><SelectValue placeholder="Select Status" /></SelectTrigger>
                        <SelectContent>
                        {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    </div>
                    <div>
                    <Label htmlFor="winningAdFound">Winning Ad Found? *</Label>
                    <Select value={currentWinningAdFound} onValueChange={(val) => setCurrentWinningAdFound(val as MasterFieldEntry['winningAdFound'])} required>
                        <SelectTrigger id="winningAdFound"><SelectValue placeholder="Select Status" /></SelectTrigger>
                        <SelectContent>
                        {winningAdOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    </div>
                    <div>
                    <Label htmlFor="avatarName">Avatar Name *</Label>
                    <Input id="avatarName" value={currentAvatarName} onChange={(e) => setCurrentAvatarName(e.target.value)} placeholder="e.g., Tech Savvy Millenial" required />
                    </div>
                </div>
                <CardFooter className="p-0 pt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToList} className="w-full sm:w-auto">Cancel</Button>
                    <Button type="submit" className="w-full sm:w-auto">{editingEntry ? 'Save Changes' : 'Add Entry'}</Button>
                </CardFooter>
            </form>
        ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <Select 
              value={filterStatus || ALL_STATUSES_VALUE} 
              onValueChange={(val) => setFilterStatus(val === ALL_STATUSES_VALUE ? '' : val)}
            >
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES_VALUE}>All Statuses</SelectItem>
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select 
              value={filterAvatar || ALL_AVATARS_VALUE} 
              onValueChange={(val) => setFilterAvatar(val === ALL_AVATARS_VALUE ? '' : val)}
             >
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Avatar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_AVATARS_VALUE}>All Avatars</SelectItem>
                {uniqueAvatarNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => {setFilterStatus(''); setFilterAvatar('');}} className="flex items-center gap-1">
              <Filter className="h-4 w-4" /> Clear Filters
            </Button>
          </div>
          {filteredEntries.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Added By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Winning Ad?</TableHead>
                    <TableHead>Avatar Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCell>{entry.addedBy}</TableCell>
                        <TableCell>{entry.status}</TableCell>
                        <TableCell>{entry.winningAdFound}</TableCell>
                        <TableCell>{entry.avatarName}</TableCell>
                        <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)}>
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
                <p className="text-muted-foreground text-lg mb-2">
                    {filterStatus || filterAvatar ? 'No entries match your filters.' : 'No master field entries yet.'}
                </p>
                <p className="text-sm text-muted-foreground">
                    {filterStatus || filterAvatar ? 'Try adjusting your filters or clear them.' : 'Click the "Add New Entry" button to start!'}
                </p>
            </div>
          )}
        </>
        )}
      </CardContent>
    </Card>
  );
}

