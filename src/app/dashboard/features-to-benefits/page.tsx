
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
import { PlusCircle, Trash2, Search, ChevronsRight, Edit, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeatureBenefitPair {
  id: string;
  productFeature: string;
  directBenefit: string; 
  emotionalBenefit: string; 
  benefitOfBenefit?: string; 
  createdAt: string;
}

const LOCAL_STORAGE_FB_KEY = 'featuresBenefitsEntries';

export default function FeaturesToBenefitsPage() {
  const [pairs, setPairs] = useState<FeatureBenefitPair[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPair, setEditingPair] = useState<FeatureBenefitPair | null>(null);

  const [currentFeature, setCurrentFeature] = useState('');
  const [currentDirectBenefit, setCurrentDirectBenefit] = useState('');
  const [currentEmotionalBenefit, setCurrentEmotionalBenefit] = useState('');
  const [currentBenefitOfBenefit, setCurrentBenefitOfBenefit] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedPairs = localStorage.getItem(LOCAL_STORAGE_FB_KEY);
    if (storedPairs) {
        try {
            setPairs(JSON.parse(storedPairs));
        } catch(e) {
            console.error("Failed to parse feature-benefit pairs from localStorage", e);
            setPairs([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FB_KEY, JSON.stringify(pairs));
  }, [pairs]);

  const resetForm = () => {
    setCurrentFeature('');
    setCurrentDirectBenefit('');
    setCurrentEmotionalBenefit('');
    setCurrentBenefitOfBenefit('');
  };

  const handleCreateNewClick = () => {
    setEditingPair(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (pair: FeatureBenefitPair) => {
    setEditingPair(pair);
    setCurrentFeature(pair.productFeature);
    setCurrentDirectBenefit(pair.directBenefit);
    setCurrentEmotionalBenefit(pair.emotionalBenefit);
    setCurrentBenefitOfBenefit(pair.benefitOfBenefit || '');
    setShowForm(true);
  };
  
  const handleBackToList = () => {
    setShowForm(false);
    setEditingPair(null);
    resetForm();
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentFeature.trim() || !currentDirectBenefit.trim() || !currentEmotionalBenefit.trim()) {
      toast({ title: "Error", description: "Feature, Direct Benefit, and Emotional Benefit are required.", variant: "destructive" });
      return;
    }

    let updatedPairs;

    if (editingPair) {
        const pairToUpdate: FeatureBenefitPair = {
            ...editingPair,
            productFeature: currentFeature,
            directBenefit: currentDirectBenefit,
            emotionalBenefit: currentEmotionalBenefit,
            benefitOfBenefit: currentBenefitOfBenefit,
        };
        updatedPairs = pairs.map(p => p.id === editingPair.id ? pairToUpdate : p);
        toast({ title: "Pair Updated", description: `Conversion for "${currentFeature}" has been updated.`});
    } else {
        const newPair: FeatureBenefitPair = {
            id: String(Date.now()),
            productFeature: currentFeature,
            directBenefit: currentDirectBenefit,
            emotionalBenefit: currentEmotionalBenefit,
            benefitOfBenefit: currentBenefitOfBenefit,
            createdAt: new Date().toISOString(),
        };
        updatedPairs = [newPair, ...pairs];
        toast({ title: "Feature-Benefit Pair Added", description: `New conversion for "${currentFeature}" saved.` });
    }
    setPairs(updatedPairs);
    setShowForm(false);
    setEditingPair(null);
    resetForm();
  };

  const handleDeletePair = (idToDelete: string) => {
    const pairToDelete = pairs.find(p => p.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete the conversion for "${pairToDelete?.productFeature || 'this item'}"? This cannot be undone.`);
    if (!confirmed) return;

    setPairs(prev => prev.filter(p => p.id !== idToDelete));
    toast({ title: "Pair Deleted", description: `Conversion for "${pairToDelete?.productFeature}" removed.` });
    if (editingPair?.id === idToDelete) {
        setShowForm(false);
        setEditingPair(null);
    }
  };

  const filteredPairs = pairs.filter(pair => 
    Object.values(pair).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-2xl">
                         {showForm ? (editingPair ? 'Edit Feature-Benefit' : 'Add Feature-Benefit') : 'Convert Features to Benefits'}
                    </CardTitle>
                    <CardDescription>
                        {showForm ? 'Modify or enter details for the feature-benefit conversion.' : 'Transform product features into compelling emotional benefits. Data saved locally.'}
                    </CardDescription>
                </div>
                 {!showForm ? (
                    <Button onClick={handleCreateNewClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Conversion
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleBackToList}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Conversion List
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
        {showForm ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
                 <div>
                    <Label htmlFor="feature">Product Feature *</Label>
                    <Input id="feature" value={currentFeature} onChange={(e) => setCurrentFeature(e.target.value)} placeholder="e.g., 10GB Cloud Storage" required/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <Label htmlFor="directBenefit">Direct Benefit (Functional) *</Label>
                        <Textarea id="directBenefit" value={currentDirectBenefit} onChange={(e) => setCurrentDirectBenefit(e.target.value)} placeholder="e.g., Store more files" rows={2} required/>
                    </div>
                    <ChevronsRight className="h-6 w-6 text-muted-foreground hidden md:block self-center mx-auto"/>
                    <div>
                        <Label htmlFor="emotionalBenefit">Emotional Benefit *</Label>
                        <Textarea id="emotionalBenefit" value={currentEmotionalBenefit} onChange={(e) => setCurrentEmotionalBenefit(e.target.value)} placeholder="e.g., Peace of mind, never lose important documents" rows={2} required/>
                    </div>
                </div>
                <div>
                    <Label htmlFor="benefitOfBenefit">Benefit of the Benefit (Ultimate Transformation - Optional)</Label>
                    <Textarea id="benefitOfBenefit" value={currentBenefitOfBenefit} onChange={(e) => setCurrentBenefitOfBenefit(e.target.value)} placeholder="e.g., Feel organized and in control of your digital life" rows={2}/>
                </div>
                <CardFooter className="p-0 pt-4 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToList}>Cancel</Button>
                    <Button type="submit">{editingPair ? 'Save Changes' : 'Add Conversion'}</Button>
                </CardFooter>
            </form>
        ) : (
          <>
            <div className="mb-4">
                <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search conversions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-1/2 md:w-1/3"
                />
                </div>
            </div>
            {filteredPairs.length > 0 ? (
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
                            <TableCell className="space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(pair)}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeletePair(pair.id)}>
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
                        {searchTerm ? 'No conversions match your search.' : 'No feature-to-benefit conversions stored yet.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Try a different search term or clear filters.' : 'Click the "Add New Conversion" button to start!'}
                    </p>
                </div>
            )}
          </>
        )}
        </CardContent>
    </Card>
  );
}
