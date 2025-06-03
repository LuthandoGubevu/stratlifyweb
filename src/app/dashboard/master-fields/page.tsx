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
import { PlusCircle, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MasterFieldEntry {
  id: string;
  addedBy: string; // Initials
  status: 'Pending' | 'Approved' | 'Rejected' | 'Live' | 'Paused';
  winningAdFound: 'Yes' | 'No' | 'Testing';
  avatarName: string;
  createdAt: string;
}

const LOCAL_STORAGE_MASTERFIELDS_KEY = 'masterFieldEntries';

export default function MasterFieldsPage() {
  const [entries, setEntries] = useState<MasterFieldEntry[]>([]);
  const [newEntry, setNewEntry] = useState<Partial<Omit<MasterFieldEntry, 'id' | 'createdAt'>>>({
    addedBy: '', status: 'Pending', winningAdFound: 'Testing', avatarName: ''
  });
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAvatar, setFilterAvatar] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const storedEntries = localStorage.getItem(LOCAL_STORAGE_MASTERFIELDS_KEY);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MASTERFIELDS_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleInputChange = (field: keyof typeof newEntry, value: string) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEntry = (e: FormEvent) => {
    e.preventDefault();
    if (!newEntry.addedBy?.trim() || !newEntry.avatarName?.trim()) {
      toast({ title: "Error", description: "Added By (initials) and Avatar Name are required.", variant: "destructive" });
      return;
    }
    const entryToAdd: MasterFieldEntry = {
      id: String(Date.now()),
      addedBy: newEntry.addedBy,
      status: newEntry.status || 'Pending',
      winningAdFound: newEntry.winningAdFound || 'Testing',
      avatarName: newEntry.avatarName,
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [entryToAdd, ...prev]);
    setNewEntry({ addedBy: '', status: 'Pending', winningAdFound: 'Testing', avatarName: '' });
    toast({ title: "Entry Added", description: "New master field entry saved." });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({ title: "Entry Deleted", description: "Master field entry removed." });
  };

  const filteredEntries = entries.filter(entry => 
    (filterStatus ? entry.status === filterStatus : true) &&
    (filterAvatar ? entry.avatarName.toLowerCase().includes(filterAvatar.toLowerCase()) : true)
  );
  
  // Get unique avatar names for filter dropdown
  const uniqueAvatarNames = Array.from(new Set(entries.map(e => e.avatarName)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add Master Field Entry</CardTitle>
          <CardDescription>Manage internal tagging for submissions or entries.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddEntry}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addedBy">Added By (Initials)</Label>
              <Input id="addedBy" value={newEntry.addedBy || ''} onChange={(e) => handleInputChange('addedBy', e.target.value)} placeholder="e.g., JD" maxLength={3}/>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newEntry.status || 'Pending'} onValueChange={(val) => handleInputChange('status', val as MasterFieldEntry['status'])}>
                <SelectTrigger id="status"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  {['Pending', 'Approved', 'Rejected', 'Live', 'Paused'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="winningAdFound">Winning Ad Found?</Label>
              <Select value={newEntry.winningAdFound || 'Testing'} onValueChange={(val) => handleInputChange('winningAdFound', val as MasterFieldEntry['winningAdFound'])}>
                <SelectTrigger id="winningAdFound"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  {['Yes', 'No', 'Testing'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="avatarName">Avatar Name</Label>
              <Input id="avatarName" value={newEntry.avatarName || ''} onChange={(e) => handleInputChange('avatarName', e.target.value)} placeholder="e.g., Tech Savvy Millenial" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Entry
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Existing Master Field Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {['Pending', 'Approved', 'Rejected', 'Live', 'Paused'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select value={filterAvatar} onValueChange={setFilterAvatar}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Avatar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Avatars</SelectItem>
                {uniqueAvatarNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => {setFilterStatus(''); setFilterAvatar('');}} className="flex items-center gap-1">
              <Filter className="h-4 w-4" /> Clear Filters
            </Button>
          </div>
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
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredEntries.length === 0 && <p className="text-center text-muted-foreground mt-4">No entries found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
