
'use client';

import { useState, useMemo, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon, HelpCircle, Filter, PlusCircle, Trash2, Edit, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // DialogTrigger removed as modal is controlled by state

export interface RoadmapEntry { // Exported for Submissions page
  id: string;
  dctNumber: string;
  status: string;
  adConcept: string;
  persona: string;
  massDesire: string;
  subDesire: string;
  benefit: string;
  benefitOfBenefit: string;
  awareness: string;
  sophistication: string;
  hookPattern: string;
  aimOfAd: string;
  adsetName: string;
  format: 'Static' | 'Video' | 'Carousel' | 'Other';
  results?: string;
  linkToAdset?: string;
  dateLaunched?: string; 
  dateTurnedOff?: string; 
  learnings?: string;
  createdAt: string; // Added for sorting
}

const LOCAL_STORAGE_ROADMAP_KEY = 'creativeRoadmapEntries';

const initialExampleEntries: RoadmapEntry[] = [
  { id: '1', dctNumber: 'DCT001', status: 'Live', adConcept: 'Summer Glow', persona: 'Young Adults', massDesire: 'Beauty', subDesire: 'Radiant Skin', benefit: 'Look younger', benefitOfBenefit: 'Increased confidence', awareness: 'Problem Aware', sophistication: 'Stage 2', hookPattern: 'Before-After', aimOfAd: 'Drive Sales', adsetName: 'SummerGlow_Campaign1', format: 'Video', dateLaunched: new Date(2023, 5, 15).toISOString(), createdAt: new Date(2023, 5, 1).toISOString() },
  { id: '2', dctNumber: 'DCT002', status: 'Paused', adConcept: 'Productivity Boost', persona: 'Professionals', massDesire: 'Efficiency', subDesire: 'Time Saving', benefit: 'Get more done', benefitOfBenefit: 'Less stress', awareness: 'Solution Aware', sophistication: 'Stage 3', hookPattern: 'Promise', aimOfAd: 'Lead Gen', adsetName: 'ProductivityBoost_Q3', format: 'Static', dateLaunched: new Date(2023, 7, 1).toISOString(), createdAt: new Date(2023, 7, 1).toISOString() },
];


export default function CreativeRoadmapPage() {
  const [entries, setEntries] = useState<RoadmapEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RoadmapEntry | null>(null); // Changed to RoadmapEntry for type safety
  
  // Form state grouped into an object for easier reset
  const [currentFormData, setCurrentFormData] = useState<Omit<RoadmapEntry, 'id' | 'createdAt'>>({
    dctNumber: '', status: 'Planned', adConcept: '', persona: '', massDesire: '',
    subDesire: '', benefit: '', benefitOfBenefit: '', awareness: 'Unaware',
    sophistication: 'Stage 1', hookPattern: '', aimOfAd: '', adsetName: '',
    format: 'Static', results: '', linkToAdset: '', dateLaunched: undefined,
    dateTurnedOff: undefined, learnings: ''
  });

  useEffect(() => {
    const storedEntries = localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY);
    if (storedEntries) {
      try {
        setEntries(JSON.parse(storedEntries));
      } catch (e) {
        console.error("Failed to parse roadmap entries from localStorage", e);
        setEntries(initialExampleEntries); // Fallback to examples
      }
    } else {
      setEntries(initialExampleEntries); 
    }
  }, []);

  useEffect(() => {
    // Save entries to local storage whenever they change, but only if it's not the initial example load or empty
    if (entries.length > 0 || localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY)) {
       localStorage.setItem(LOCAL_STORAGE_ROADMAP_KEY, JSON.stringify(entries));
    }
  }, [entries]);


  const resetFormFields = () => {
    setCurrentFormData({
        dctNumber: '', status: 'Planned', adConcept: '', persona: '', massDesire: '',
        subDesire: '', benefit: '', benefitOfBenefit: '', awareness: 'Unaware',
        sophistication: 'Stage 1', hookPattern: '', aimOfAd: '', adsetName: '',
        format: 'Static', results: '', linkToAdset: '', dateLaunched: undefined,
        dateTurnedOff: undefined, learnings: ''
    });
  };
  
  const populateFormForEdit = (entry: RoadmapEntry) => {
    setCurrentFormData({
        dctNumber: entry.dctNumber,
        status: entry.status,
        adConcept: entry.adConcept,
        persona: entry.persona,
        massDesire: entry.massDesire,
        subDesire: entry.subDesire,
        benefit: entry.benefit,
        benefitOfBenefit: entry.benefitOfBenefit,
        awareness: entry.awareness,
        sophistication: entry.sophistication,
        hookPattern: entry.hookPattern,
        aimOfAd: entry.aimOfAd,
        adsetName: entry.adsetName,
        format: entry.format,
        results: entry.results || '',
        linkToAdset: entry.linkToAdset || '',
        // Dates need to be Date objects for the Calendar, but stored as ISO strings
        dateLaunched: entry.dateLaunched && isValid(parseISO(entry.dateLaunched)) ? entry.dateLaunched : undefined,
        dateTurnedOff: entry.dateTurnedOff && isValid(parseISO(entry.dateTurnedOff)) ? entry.dateTurnedOff : undefined,
        learnings: entry.learnings || '',
    });
  };

  const handleOpenModal = (entryToEdit: RoadmapEntry | null = null) => {
    if (entryToEdit) {
      setEditingEntry(entryToEdit);
      populateFormForEdit(entryToEdit);
    } else {
      setEditingEntry(null);
      resetFormFields();
    }
    setIsModalOpen(true);
  };

  const handleFormInputChange = (field: keyof Omit<RoadmapEntry, 'id' | 'createdAt' | 'dateLaunched' | 'dateTurnedOff'>, value: string | RoadmapEntry['format']) => {
    setCurrentFormData(prev => ({...prev, [field]: value}));
  };

  const handleDateChange = (field: 'dateLaunched' | 'dateTurnedOff', date: Date | undefined) => {
    setCurrentFormData(prev => ({...prev, [field]: date ? date.toISOString() : undefined }));
  };


  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentFormData.dctNumber.trim() || !currentFormData.adConcept.trim()) {
      toast({ title: "Error", description: "DCT Number and Ad Concept are required.", variant: "destructive" });
      return;
    }

    let updatedEntries;

    if (editingEntry) {
      const entryData: RoadmapEntry = { 
        ...editingEntry, // Retain original ID and createdAt
        ...currentFormData,
      };
      updatedEntries = entries.map(item => item.id === editingEntry.id ? entryData : item);
      toast({ title: "Entry Updated", description: "Roadmap item saved." });
    } else {
      const newId = String(Date.now());
      const newEntry: RoadmapEntry = {
        ...currentFormData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      updatedEntries = [newEntry, ...entries];
      toast({ title: "Entry Added", description: "New roadmap item created." });
    }
    setEntries(updatedEntries);
    setIsModalOpen(false);
    setEditingEntry(null);
    resetFormFields();
  };


  const handleDeleteEntry = (id: string) => {
    const entryToDelete = entries.find(item => item.id === id);
    const confirmed = window.confirm(`Are you sure you want to delete the roadmap item "${entryToDelete?.adConcept || 'this item'}"? This cannot be undone.`);
    if(!confirmed) return;

    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({ title: "Entry Deleted", description: "Roadmap item removed." });
    if(editingEntry?.id === id) {
        setIsModalOpen(false);
        setEditingEntry(null);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => 
        Object.values(entry).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        (!filterDate || (entry.dateLaunched && isValid(parseISO(entry.dateLaunched)) && parseISO(entry.dateLaunched).toDateString() === filterDate.toDateString()))
      )
      .sort((a, b) => (new Date(b.createdAt).getTime()) - (new Date(a.createdAt).getTime()));
  }, [entries, searchTerm, filterDate]);

  const statusOptions = ['Planned', 'In Progress', 'Live', 'Paused', 'Completed', 'Archived'];
  const awarenessOptions = ['Unaware', 'Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware'];
  const sophisticationOptions = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];
  const formatOptions: RoadmapEntry['format'][] = ['Static', 'Video', 'Carousel', 'Other'];


  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Creative Roadmap</CardTitle>
            <CardDescription>Plan and track your creative campaigns. Data saved to local storage.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <Input 
                placeholder="Search roadmap..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "PPP") : <span>Filter by launch date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filterDate} onSelect={setFilterDate} initialFocus />
                </PopoverContent>
              </Popover>
              <Button onClick={() => {setFilterDate(undefined); setSearchTerm('');}} variant="ghost" className="flex items-center gap-1">
                <Filter className="h-4 w-4"/> Clear Filters
              </Button>
              <Button onClick={() => handleOpenModal()} className="ml-auto flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> Add Entry
              </Button>
            </div>
            {filteredEntries.length > 0 ? (
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>DCT #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ad Concept</TableHead>
                        <TableHead>Persona</TableHead>
                        <TableHead>Mass Desire</TableHead>
                        <TableHead>Benefit of Benefit
                        <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="inline ml-1 h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                            <TooltipContent><p>The ultimate emotional outcome or transformation.</p></TooltipContent>
                        </Tooltip>
                        </TableHead>
                        <TableHead>Date Launched</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                        <TableCell>{entry.dctNumber}</TableCell>
                        <TableCell>{entry.status}</TableCell>
                        <TableCell>{entry.adConcept}</TableCell>
                        <TableCell>{entry.persona || '-'}</TableCell>
                        <TableCell>{entry.massDesire || '-'}</TableCell>
                        <TableCell>{entry.benefitOfBenefit || '-'}</TableCell>
                        <TableCell>{entry.dateLaunched && isValid(parseISO(entry.dateLaunched)) ? format(parseISO(entry.dateLaunched), "PP") : '-'}</TableCell>
                        <TableCell>{entry.format || '-'}</TableCell>
                        <TableCell className="space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(entry)}>
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
                    <Map className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg mt-4 mb-2">
                        {searchTerm || filterDate ? 'No entries match your criteria.' : 'Your creative roadmap is empty.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {searchTerm || filterDate ? 'Try adjusting your search or filters.' : 'Click "Add Entry" to start planning your campaigns!'}
                    </p>
                </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">{editingEntry ? 'Edit Roadmap Entry' : 'Add New Roadmap Entry'}</DialogTitle>
              <DialogDescription>
                Fill in the details for this creative campaign element.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><Label htmlFor="dct">DCT Number *</Label><Input id="dct" value={currentFormData.dctNumber} onChange={e => handleFormInputChange('dctNumber', e.target.value)} required/></div>
                <div><Label htmlFor="status">Status *</Label>
                    <Select value={currentFormData.status} onValueChange={(val) => handleFormInputChange('status', val)} required>
                        <SelectTrigger><SelectValue placeholder="Select Status"/></SelectTrigger>
                        <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="concept">Ad Concept *</Label><Input id="concept" value={currentFormData.adConcept} onChange={e => handleFormInputChange('adConcept', e.target.value)} required/></div>
                <div><Label htmlFor="persona">Persona</Label><Input id="persona" value={currentFormData.persona} onChange={e => handleFormInputChange('persona', e.target.value)}/></div>
                <div><Label htmlFor="mass-desire">Mass Desire</Label><Input id="mass-desire" value={currentFormData.massDesire} onChange={e => handleFormInputChange('massDesire', e.target.value)}/></div>
                <div><Label htmlFor="sub-desire">Sub Desire</Label><Input id="sub-desire" value={currentFormData.subDesire} onChange={e => handleFormInputChange('subDesire', e.target.value)}/></div>
                <div><Label htmlFor="benefit">Benefit</Label><Input id="benefit" value={currentFormData.benefit} onChange={e => handleFormInputChange('benefit', e.target.value)}/></div>
                <div><Label htmlFor="bob">Benefit of Benefit</Label><Input id="bob" value={currentFormData.benefitOfBenefit} onChange={e => handleFormInputChange('benefitOfBenefit', e.target.value)}/></div>
                <div><Label htmlFor="awareness">Awareness</Label>
                    <Select value={currentFormData.awareness} onValueChange={(val) => handleFormInputChange('awareness', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Awareness"/></SelectTrigger>
                        <SelectContent>{awarenessOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="sophistication">Sophistication</Label>
                    <Select value={currentFormData.sophistication} onValueChange={(val) => handleFormInputChange('sophistication', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Sophistication"/></SelectTrigger>
                        <SelectContent>{sophisticationOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="hook">Hook Pattern</Label><Input id="hook" value={currentFormData.hookPattern} onChange={e => handleFormInputChange('hookPattern', e.target.value)} /></div>
                <div><Label htmlFor="aim">Aim Of Ad</Label><Input id="aim" value={currentFormData.aimOfAd} onChange={e => handleFormInputChange('aimOfAd', e.target.value)} /></div>
                <div><Label htmlFor="adset-name">Adset Name</Label><Input id="adset-name" value={currentFormData.adsetName} onChange={e => handleFormInputChange('adsetName', e.target.value)} /></div>
                <div><Label htmlFor="format">Format</Label>
                    <Select value={currentFormData.format} onValueChange={(val) => handleFormInputChange('format', val as RoadmapEntry['format'])}>
                        <SelectTrigger><SelectValue placeholder="Select Format"/></SelectTrigger>
                        <SelectContent>{formatOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="date-launched">Date Launched</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{currentFormData.dateLaunched && isValid(parseISO(currentFormData.dateLaunched)) ? format(parseISO(currentFormData.dateLaunched), "PPP") : 'Pick a date'}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentFormData.dateLaunched ? parseISO(currentFormData.dateLaunched) : undefined} onSelect={(date) => handleDateChange('dateLaunched', date)}/></PopoverContent></Popover>
                </div>
                <div><Label htmlFor="date-off">Date Turned Off</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{currentFormData.dateTurnedOff && isValid(parseISO(currentFormData.dateTurnedOff)) ? format(parseISO(currentFormData.dateTurnedOff), "PPP") : 'Pick a date'}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentFormData.dateTurnedOff ? parseISO(currentFormData.dateTurnedOff) : undefined} onSelect={(date) => handleDateChange('dateTurnedOff', date)}/></PopoverContent></Popover>
                </div>
              </div>
              <div><Label htmlFor="results">Results</Label><Textarea id="results" value={currentFormData.results} onChange={e => handleFormInputChange('results', e.target.value)}/></div>
              <div><Label htmlFor="link-adset">Link To Adset</Label><Input id="link-adset" type="url" value={currentFormData.linkToAdset} onChange={e => handleFormInputChange('linkToAdset', e.target.value)}/></div>
              <div><Label htmlFor="learnings">Learnings</Label><Textarea id="learnings" value={currentFormData.learnings} onChange={e => handleFormInputChange('learnings', e.target.value)}/></div>
            
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingEntry ? 'Save Changes' : 'Add Entry'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
