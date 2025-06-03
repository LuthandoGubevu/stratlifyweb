'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, HelpCircle, Filter, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoadmapEntry {
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
  format: 'Static' | 'Video' | 'Carousel';
  results?: string;
  linkToAdset?: string;
  dateLaunched?: Date;
  dateTurnedOff?: Date;
  learnings?: string;
}

const initialEntries: RoadmapEntry[] = [
  { id: '1', dctNumber: 'DCT001', status: 'Live', adConcept: 'Summer Glow', persona: 'Young Adults', massDesire: 'Beauty', subDesire: 'Radiant Skin', benefit: 'Look younger', benefitOfBenefit: 'Increased confidence', awareness: 'Problem Aware', sophistication: 'Stage 2', hookPattern: 'Before-After', aimOfAd: 'Drive Sales', adsetName: 'SummerGlow_Campaign1', format: 'Video', dateLaunched: new Date(2023, 5, 15) },
  { id: '2', dctNumber: 'DCT002', status: 'Paused', adConcept: 'Productivity Boost', persona: 'Professionals', massDesire: 'Efficiency', subDesire: 'Time Saving', benefit: 'Get more done', benefitOfBenefit: 'Less stress', awareness: 'Solution Aware', sophistication: 'Stage 3', hookPattern: 'Promise', aimOfAd: 'Lead Gen', adsetName: 'ProductivityBoost_Q3', format: 'Static', dateLaunched: new Date(2023, 7, 1) },
];

export default function CreativeRoadmapPage() {
  const [entries, setEntries] = useState<RoadmapEntry[]>(initialEntries);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Dummy form state for adding/editing - can be expanded into a modal
  const [currentEntry, setCurrentEntry] = useState<Partial<RoadmapEntry>>({});

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => 
        Object.values(entry).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        (!filterDate || (entry.dateLaunched && new Date(entry.dateLaunched).toDateString() === new Date(filterDate).toDateString()))
      )
      .sort((a, b) => (b.dateLaunched?.getTime() || 0) - (a.dateLaunched?.getTime() || 0));
  }, [entries, searchTerm, filterDate]);

  const handleAddEntry = () => {
    // This would typically open a modal with a form
    // For simplicity, adding a placeholder entry
    const newId = String(entries.length + 1);
    const newEntry: RoadmapEntry = {
      id: newId,
      dctNumber: `DCT${newId.padStart(3,'0')}`,
      status: 'Planned',
      adConcept: 'New Concept',
      persona: 'Default Persona',
      massDesire: 'General',
      subDesire: 'Specific',
      benefit: 'Key Benefit',
      benefitOfBenefit: 'Ultimate Outcome',
      awareness: 'Unaware',
      sophistication: 'Stage 1',
      hookPattern: 'Curiosity',
      aimOfAd: 'Brand Awareness',
      adsetName: `NewCampaign_${newId}`,
      format: 'Static',
      dateLaunched: new Date(),
    };
    setEntries(prev => [newEntry, ...prev]);
    toast({ title: "Entry Added", description: "New roadmap item created." });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({ title: "Entry Deleted", description: "Roadmap item removed." });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Creative Roadmap</CardTitle>
            <CardDescription>Plan and track your creative campaigns. Click column headers to sort (not implemented).</CardDescription>
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
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
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
              <Button onClick={handleAddEntry} className="ml-auto flex items-center gap-1">
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
                        <TooltipContent><p>The ultimate emotional outcome or transformation the customer achieves.</p></TooltipContent>
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
                      <TableCell>{entry.persona}</TableCell>
                      <TableCell>{entry.massDesire}</TableCell>
                      <TableCell>{entry.benefitOfBenefit}</TableCell>
                      <TableCell>{entry.dateLaunched ? format(entry.dateLaunched, "PP") : '-'}</TableCell>
                      <TableCell>{entry.format}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                        {/* Add Edit Button here, opening a modal */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredEntries.length === 0 && <p className="text-center text-muted-foreground mt-4">No entries found matching your criteria.</p>}
          </CardContent>
        </Card>

        {/* Example of how input fields might look (e.g., in a modal for Add/Edit) */}
        {/* This is illustrative and would be part of a separate modal component */}
        {false && (
          <Card>
            <CardHeader><CardTitle>Example Entry Fields (for Modal)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><Label htmlFor="dct">DCT Number</Label><Input id="dct" placeholder="DCT00X"/></div>
              <div><Label htmlFor="status">Status</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select Status"/></SelectTrigger>
                  <SelectContent><SelectItem value="Planned">Planned</SelectItem><SelectItem value="Live">Live</SelectItem><SelectItem value="Paused">Paused</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="concept">Ad Concept</Label><Input id="concept"/></div>
              <div><Label htmlFor="persona">Persona</Label><Input id="persona"/></div>
              <div><Label htmlFor="mass-desire">Mass Desire</Label><Input id="mass-desire"/></div>
              <div><Label htmlFor="sub-desire">Sub Desire</Label><Input id="sub-desire"/></div>
              <div><Label htmlFor="benefit">Benefit</Label><Input id="benefit"/></div>
              <div><Label htmlFor="bob">Benefit of Benefit</Label><Input id="bob"/></div>
              <div><Label htmlFor="awareness">Awareness</Label><Input id="awareness"/></div>
              <div><Label htmlFor="sophistication">Sophistication</Label><Input id="sophistication"/></div>
              <div><Label htmlFor="hook">Hook Pattern</Label><Input id="hook"/></div>
              <div><Label htmlFor="aim">Aim Of Ad</Label><Input id="aim"/></div>
              <div><Label htmlFor="adset-name">Adset Name</Label><Input id="adset-name"/></div>
              <div><Label htmlFor="format">Format</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select Format"/></SelectTrigger>
                  <SelectContent><SelectItem value="Static">Static</SelectItem><SelectItem value="Video">Video</SelectItem><SelectItem value="Carousel">Carousel</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="results">Results</Label><Textarea id="results"/></div>
              <div><Label htmlFor="link-adset">Link To Adset</Label><Input id="link-adset" type="url"/></div>
              <div><Label htmlFor="date-launched">Date Launched</Label>
                <Popover><PopoverTrigger asChild><Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" />Date</Button></PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" /></PopoverContent>
                </Popover>
              </div>
              <div><Label htmlFor="date-off">Date Turned Off</Label>
                <Popover><PopoverTrigger asChild><Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" />Date</Button></PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single"/></PopoverContent>
                </Popover>
              </div>
              <div><Label htmlFor="learnings">Learnings</Label><Textarea id="learnings"/></div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
