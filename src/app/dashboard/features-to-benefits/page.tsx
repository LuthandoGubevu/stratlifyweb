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
import { PlusCircle, Trash2, Search, ChevronsRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeatureBenefitPair {
  id: string;
  productFeature: string;
  directBenefit: string; // Functional benefit
  emotionalBenefit: string; // Emotional outcome
  benefitOfBenefit?: string; // Ultimate transformation
  createdAt: string;
}

const LOCAL_STORAGE_FB_KEY = 'featuresBenefitsEntries';

export default function FeaturesToBenefitsPage() {
  const [pairs, setPairs] = useState<FeatureBenefitPair[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [newDirectBenefit, setNewDirectBenefit] = useState('');
  const [newEmotionalBenefit, setNewEmotionalBenefit] = useState('');
  const [newBenefitOfBenefit, setNewBenefitOfBenefit] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedPairs = localStorage.getItem(LOCAL_STORAGE_FB_KEY);
    if (storedPairs) {
      setPairs(JSON.parse(storedPairs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FB_KEY, JSON.stringify(pairs));
  }, [pairs]);

  const handleAddPair = (e: FormEvent) => {
    e.preventDefault();
    if (!newFeature.trim() || !newDirectBenefit.trim() || !newEmotionalBenefit.trim()) {
      toast({ title: "Error", description: "Feature, Direct Benefit, and Emotional Benefit are required.", variant: "destructive" });
      return;
    }
    const newPair: FeatureBenefitPair = {
      id: String(Date.now()),
      productFeature: newFeature,
      directBenefit: newDirectBenefit,
      emotionalBenefit: newEmotionalBenefit,
      benefitOfBenefit: newBenefitOfBenefit,
      createdAt: new Date().toISOString(),
    };
    setPairs(prev => [newPair, ...prev]);
    setNewFeature('');
    setNewDirectBenefit('');
    setNewEmotionalBenefit('');
    setNewBenefitOfBenefit('');
    toast({ title: "Feature-Benefit Pair Added", description: "New conversion saved." });
  };

  const handleDeletePair = (id: string) => {
    setPairs(prev => prev.filter(p => p.id !== id));
    toast({ title: "Pair Deleted", description: "Feature-Benefit pair removed." });
  };

  const filteredPairs = pairs.filter(pair => 
    Object.values(pair).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Convert Features to Benefits</CardTitle>
          <CardDescription>Transform product features into compelling emotional benefits. Data saved locally.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddPair}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feature">Product Feature</Label>
              <Input id="feature" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="e.g., 10GB Cloud Storage" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="directBenefit">Direct Benefit (Functional)</Label>
                <Textarea id="directBenefit" value={newDirectBenefit} onChange={(e) => setNewDirectBenefit(e.target.value)} placeholder="e.g., Store more files" rows={2}/>
              </div>
              <ChevronsRight className="h-6 w-6 text-muted-foreground hidden md:block self-center mx-auto"/>
              <div>
                <Label htmlFor="emotionalBenefit">Emotional Benefit</Label>
                <Textarea id="emotionalBenefit" value={newEmotionalBenefit} onChange={(e) => setNewEmotionalBenefit(e.target.value)} placeholder="e.g., Peace of mind, never lose important documents" rows={2}/>
              </div>
            </div>
            <div>
              <Label htmlFor="benefitOfBenefit">Benefit of the Benefit (Ultimate Transformation - Optional)</Label>
              <Textarea id="benefitOfBenefit" value={newBenefitOfBenefit} onChange={(e) => setNewBenefitOfBenefit(e.target.value)} placeholder="e.g., Feel organized and in control of your digital life" rows={2}/>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Conversion
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Stored Feature-to-Benefit Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search conversions..."
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
                  <TableHead>Feature</TableHead>
                  <TableHead>Direct Benefit</TableHead>
                  <TableHead>Emotional Benefit</TableHead>
                  <TableHead>Ultimate Benefit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPairs.map((pair) => (
                  <TableRow key={pair.id}>
                    <TableCell className="font-medium max-w-[200px] break-words">{pair.productFeature}</TableCell>
                    <TableCell className="max-w-[200px] break-words">{pair.directBenefit}</TableCell>
                    <TableCell className="max-w-[200px] break-words">{pair.emotionalBenefit}</TableCell>
                    <TableCell className="max-w-[200px] break-words">{pair.benefitOfBenefit || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePair(pair.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredPairs.length === 0 && <p className="text-center text-muted-foreground mt-4">No feature-to-benefit conversions stored yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
