
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
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon, HelpCircle, Filter, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export interface RoadmapEntry {
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
  dateLaunched?: string; // Store as ISO string
  dateTurnedOff?: string; // Store as ISO string
  learnings?: string;
}

const LOCAL_STORAGE_ROADMAP_KEY = 'creativeRoadmapEntries';

const initialExampleEntries: RoadmapEntry[] = [
  { id: '1', dctNumber: 'DCT001', status: 'Live', adConcept: 'Summer Glow', persona: 'Young Adults', massDesire: 'Beauty', subDesire: 'Radiant Skin', benefit: 'Look younger', benefitOfBenefit: 'Increased confidence', awareness: 'Problem Aware', sophistication: 'Stage 2', hookPattern: 'Before-After', aimOfAd: 'Drive Sales', adsetName: 'SummerGlow_Campaign1', format: 'Video', dateLaunched: new Date(2023, 5, 15).toISOString() },
  { id: '2', dctNumber: 'DCT002', status: 'Paused', adConcept: 'Productivity Boost', persona: 'Professionals', massDesire: 'Efficiency', subDesire: 'Time Saving', benefit: 'Get more done', benefitOfBenefit: 'Less stress', awareness: 'Solution Aware', sophistication: 'Stage 3', hookPattern: 'Promise', aimOfAd: 'Lead Gen', adsetName: 'ProductivityBoost_Q3', format: 'Static', dateLaunched: new Date(2023, 7, 1).toISOString() },
];


export default function CreativeRoadmapPage() {
  const [entries, setEntries] = useState<RoadmapEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<RoadmapEntry> | null>(null);
  
  const [currentDctNumber, setCurrentDctNumber] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Planned');
  const [currentAdConcept, setCurrentAdConcept] = useState('');
  const [currentPersona, setCurrentPersona] = useState('');
  const [currentMassDesire, setCurrentMassDesire] = useState('');
  const [currentSubDesire, setCurrentSubDesire] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');
  const [currentBenefitOfBenefit, setCurrentBenefitOfBenefit] = useState('');
  const [currentAwareness, setCurrentAwareness] = useState('Unaware');
  const [currentSophistication, setCurrentSophistication] = useState('Stage 1');
  const [currentHookPattern, setCurrentHookPattern] = useState('');
  const [currentAimOfAd, setCurrentAimOfAd] = useState('');
  const [currentAdsetName, setCurrentAdsetName] = useState('');
  const [currentFormat, setCurrentFormat] = useState<'Static' | 'Video' | 'Carousel' | 'Other'>('Static');
  const [currentResults, setCurrentResults] = useState('');
  const [currentLinkToAdset, setCurrentLinkToAdset] = useState('');
  const [currentDateLaunched, setCurrentDateLaunched] = useState<Date | undefined>(undefined);
  const [currentDateTurnedOff, setCurrentDateTurnedOff] = useState<Date | undefined>(undefined);
  const [currentLearnings, setCurrentLearnings] = useState('');

  useEffect(() => {
    const storedEntries = localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    } else {
      setEntries(initialExampleEntries); // Load example if nothing in localStorage
    }
  }, []);

  useEffect(() => {
    // Prevent saving empty initialExampleEntries if localStorage was empty
    if (entries.length > 0 || localStorage.getItem(LOCAL_STORAGE_ROADMAP_KEY)) {
       localStorage.setItem(LOCAL_STORAGE_ROADMAP_KEY, JSON.stringify(entries));
    }
  }, [entries]);


  const resetFormFields = () => {
    setCurrentDctNumber('');
    setCurrentStatus('Planned');
    setCurrentAdConcept('');
    setCurrentPersona('');
    setCurrentMassDesire('');
    setCurrentSubDesire('');
    setCurrentBenefit('');
    setCurrentBenefitOfBenefit('');
    setCurrentAwareness('Unaware');
    setCurrentSophistication('Stage 1');
    setCurrentHookPattern('');
    setCurrentAimOfAd('');
    setCurrentAdsetName('');
    setCurrentFormat('Static');
    setCurrentResults('');
    setCurrentLinkToAdset('');
    setCurrentDateLaunched(undefined);
    setCurrentDateTurnedOff(undefined);
    setCurrentLearnings('');
  };
  
  const populateFormForEdit = (entry: RoadmapEntry) => {
    setCurrentDctNumber(entry.dctNumber);
    setCurrentStatus(entry.status);
    setCurrentAdConcept(entry.adConcept);
    setCurrentPersona(entry.persona);
    setCurrentMassDesire(entry.massDesire);
    setCurrentSubDesire(entry.subDesire);
    setCurrentBenefit(entry.benefit);
    setCurrentBenefitOfBenefit(entry.benefitOfBenefit);
    setCurrentAwareness(entry.awareness);
    setCurrentSophistication(entry.sophistication);
    setCurrentHookPattern(entry.hookPattern);
    setCurrentAimOfAd(entry.aimOfAd);
    setCurrentAdsetName(entry.adsetName);
    setCurrentFormat(entry.format);
    setCurrentResults(entry.results || '');
    setCurrentLinkToAdset(entry.linkToAdset || '');
    setCurrentDateLaunched(entry.dateLaunched ? parseISO(entry.dateLaunched) : undefined);
    setCurrentDateTurnedOff(entry.dateTurnedOff ? parseISO(entry.dateTurnedOff) : undefined);
    setCurrentLearnings(entry.learnings || '');
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

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentDctNumber.trim() || !currentAdConcept.trim()) {
      toast({ title: "Error", description: "DCT Number and Ad Concept are required.", variant: "destructive" });
      return;
    }

    const entryData: Omit<RoadmapEntry, 'id'> = {
      dctNumber: currentDctNumber,
      status: currentStatus,
      adConcept: currentAdConcept,
      persona: currentPersona,
      massDesire: currentMassDesire,
      subDesire: currentSubDesire,
      benefit: currentBenefit,
      benefitOfBenefit: currentBenefitOfBenefit,
      awareness: currentAwareness,
      sophistication: currentSophistication,
      hookPattern: currentHookPattern,
      aimOfAd: currentAimOfAd,
      adsetName: currentAdsetName,
      format: currentFormat,
      results: currentResults,
      linkToAdset: currentLinkToAdset,
      dateLaunched: currentDateLaunched?.toISOString(),
      dateTurnedOff: currentDateTurnedOff?.toISOString(),
      learnings: currentLearnings,
    };

    if (editingEntry && editingEntry.id) {
      setEntries(prev => prev.map(item => item.id === editingEntry.id ? { ...item, ...entryData, id: editingEntry.id } : item));
      toast({ title: "Entry Updated", description: "Roadmap item saved." });
    } else {
      const newId = String(Date.now());
      setEntries(prev => [{ ...entryData, id: newId }, ...prev]);
      toast({ title: "Entry Added", description: "New roadmap item created." });
    }
    setIsModalOpen(false);
    resetFormFields();
  };


  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({ title: "Entry Deleted", description: "Roadmap item removed." });
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => 
        Object.values(entry).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        (!filterDate || (entry.dateLaunched && parseISO(entry.dateLaunched).toDateString() === filterDate.toDateString()))
      )
      .sort((a, b) => (b.dateLaunched ? parseISO(b.dateLaunched).getTime() : 0) - (a.dateLaunched ? parseISO(a.dateLaunched).getTime() : 0));
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
                      <TableCell>{entry.dateLaunched ? format(parseISO(entry.dateLaunched), "PP") : '-'}</TableCell>
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
            {filteredEntries.length === 0 && <p className="text-center text-muted-foreground mt-4">No entries found matching your criteria.</p>}
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
                <div><Label htmlFor="dct">DCT Number *</Label><Input id="dct" value={currentDctNumber} onChange={e => setCurrentDctNumber(e.target.value)} required/></div>
                <div><Label htmlFor="status">Status *</Label>
                    <Select value={currentStatus} onValueChange={(val) => setCurrentStatus(val)} required>
                        <SelectTrigger><SelectValue placeholder="Select Status"/></SelectTrigger>
                        <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="concept">Ad Concept *</Label><Input id="concept" value={currentAdConcept} onChange={e => setCurrentAdConcept(e.target.value)} required/></div>
                <div><Label htmlFor="persona">Persona</Label><Input id="persona" value={currentPersona} onChange={e => setCurrentPersona(e.target.value)}/></div>
                <div><Label htmlFor="mass-desire">Mass Desire</Label><Input id="mass-desire" value={currentMassDesire} onChange={e => setCurrentMassDesire(e.target.value)}/></div>
                <div><Label htmlFor="sub-desire">Sub Desire</Label><Input id="sub-desire" value={currentSubDesire} onChange={e => setCurrentSubDesire(e.target.value)}/></div>
                <div><Label htmlFor="benefit">Benefit</Label><Input id="benefit" value={currentBenefit} onChange={e => setCurrentBenefit(e.target.value)}/></div>
                <div><Label htmlFor="bob">Benefit of Benefit</Label><Input id="bob" value={currentBenefitOfBenefit} onChange={e => setCurrentBenefitOfBenefit(e.target.value)}/></div>
                <div><Label htmlFor="awareness">Awareness</Label>
                    <Select value={currentAwareness} onValueChange={(val) => setCurrentAwareness(val)}>
                        <SelectTrigger><SelectValue placeholder="Select Awareness"/></SelectTrigger>
                        <SelectContent>{awarenessOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="sophistication">Sophistication</Label>
                    <Select value={currentSophistication} onValueChange={(val) => setCurrentSophistication(val)}>
                        <SelectTrigger><SelectValue placeholder="Select Sophistication"/></SelectTrigger>
                        <SelectContent>{sophisticationOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="hook">Hook Pattern</Label><Input id="hook" value={currentHookPattern} onChange={e => setCurrentHookPattern(e.target.value)} /></div>
                <div><Label htmlFor="aim">Aim Of Ad</Label><Input id="aim" value={currentAimOfAd} onChange={e => setCurrentAimOfAd(e.target.value)} /></div>
                <div><Label htmlFor="adset-name">Adset Name</Label><Input id="adset-name" value={currentAdsetName} onChange={e => setCurrentAdsetName(e.target.value)} /></div>
                <div><Label htmlFor="format">Format</Label>
                    <Select value={currentFormat} onValueChange={(val) => setCurrentFormat(val as RoadmapEntry['format'])}>
                        <SelectTrigger><SelectValue placeholder="Select Format"/></SelectTrigger>
                        <SelectContent>{formatOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="date-launched">Date Launched</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{currentDateLaunched ? format(currentDateLaunched, "PPP") : 'Pick a date'}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentDateLaunched} onSelect={setCurrentDateLaunched}/></PopoverContent></Popover>
                </div>
                <div><Label htmlFor="date-off">Date Turned Off</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{currentDateTurnedOff ? format(currentDateTurnedOff, "PPP") : 'Pick a date'}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentDateTurnedOff} onSelect={setCurrentDateTurnedOff}/></PopoverContent></Popover>
                </div>
              </div>
              <div><Label htmlFor="results">Results</Label><Textarea id="results" value={currentResults} onChange={e => setCurrentResults(e.target.value)}/></div>
              <div><Label htmlFor="link-adset">Link To Adset</Label><Input id="link-adset" type="url" value={currentLinkToAdset} onChange={e => setCurrentLinkToAdset(e.target.value)}/></div>
              <div><Label htmlFor="learnings">Learnings</Label><Textarea id="learnings" value={currentLearnings} onChange={e => setCurrentLearnings(e.target.value)}/></div>
            
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

    