
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Sparkles, Loader2, Save, Eye, PlusCircle, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { suggestMechanismIdeas, type SuggestMechanismIdeasInput, type SuggestMechanismIdeasOutput } from '@/ai/flows/suggest-mechanism-ideas';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface Mechanism { // Exported for Submissions page
  id: string;
  product: string;
  resultProvided: string;
  methodOfDelivery: string;
  reframedLanguage: string;
  storyOrAnalogy: string;
  mechanismName: string;
  createdAt: string;
}

const LOCAL_STORAGE_MECHANISMS_KEY = 'productMechanisms';

export default function MechanizationPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMechanism, setEditingMechanism] = useState<Mechanism | null>(null);

  const [currentProduct, setCurrentProduct] = useState('');
  const [currentResultProvided, setCurrentResultProvided] = useState('');
  const [currentMethodOfDelivery, setCurrentMethodOfDelivery] = useState('');
  const [currentReframedLanguage, setCurrentReframedLanguage] = useState('');
  const [currentStoryOrAnalogy, setCurrentStoryOrAnalogy] = useState('');
  const [currentMechanismName, setCurrentMechanismName] = useState('');
  
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestedMechanisms, setSuggestedMechanisms] = useState<string[]>([]);
  const [pastMechanisms, setPastMechanisms] = useState<Mechanism[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedMechanisms = localStorage.getItem(LOCAL_STORAGE_MECHANISMS_KEY);
    if (storedMechanisms) {
        try {
            setPastMechanisms(JSON.parse(storedMechanisms));
        } catch(e) {
            console.error("Failed to parse mechanisms from localStorage", e);
            setPastMechanisms([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MECHANISMS_KEY, JSON.stringify(pastMechanisms));
  }, [pastMechanisms]);


  const resetForm = () => {
    setCurrentProduct(''); 
    setCurrentResultProvided(''); 
    setCurrentMethodOfDelivery(''); 
    setCurrentReframedLanguage(''); 
    setCurrentStoryOrAnalogy(''); 
    setCurrentMechanismName(''); 
    setSuggestedMechanisms([]);
  };

  const handleCreateNewClick = () => {
    setEditingMechanism(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (mechanism: Mechanism) => {
    setEditingMechanism(mechanism);
    setCurrentProduct(mechanism.product);
    setCurrentResultProvided(mechanism.resultProvided);
    setCurrentMethodOfDelivery(mechanism.methodOfDelivery);
    setCurrentReframedLanguage(mechanism.reframedLanguage);
    setCurrentStoryOrAnalogy(mechanism.storyOrAnalogy);
    setCurrentMechanismName(mechanism.mechanismName);
    setSuggestedMechanisms([]); // Clear AI suggestions when editing
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingMechanism(null);
    resetForm();
  };


  const handleGenerateSuggestions = async () => {
    if (!currentProduct || !currentResultProvided) {
      toast({
        title: "Input Required",
        description: "Please provide Product Name and Result Provided to generate suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingSuggestions(true);
    setSuggestedMechanisms([]);
    try {
      const input: SuggestMechanismIdeasInput = {
        productDescription: `Product: ${currentProduct}. Result Provided: ${currentResultProvided}. Method of Delivery: ${currentMethodOfDelivery}. Current ideas for reframing: ${currentReframedLanguage}. Potential story/analogy: ${currentStoryOrAnalogy}.`,
      };
      const output: SuggestMechanismIdeasOutput = await suggestMechanismIdeas(input);
      setSuggestedMechanisms(output.suggestedMechanisms);
      toast({ title: "Suggestions Generated!", description: "Review the AI-powered mechanism ideas below." });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSaveMechanism = () => {
    if (!currentProduct || !currentMechanismName) {
       toast({ title: "Error", description: "Product name and Mechanism Name are required to save.", variant: "destructive" });
       return;
    }
    
    let updatedMechanisms;

    if (editingMechanism) {
        const mechToUpdate: Mechanism = {
            ...editingMechanism,
            product: currentProduct, resultProvided: currentResultProvided, methodOfDelivery: currentMethodOfDelivery, 
            reframedLanguage: currentReframedLanguage, storyOrAnalogy: currentStoryOrAnalogy, mechanismName: currentMechanismName,
        };
        updatedMechanisms = pastMechanisms.map(m => m.id === editingMechanism.id ? mechToUpdate : m);
        toast({ title: "Mechanism Updated!", description: `${currentMechanismName} for ${currentProduct} has been updated.` });
    } else {
        const newMechanism: Mechanism = {
          id: String(Date.now()),
          product: currentProduct, resultProvided: currentResultProvided, methodOfDelivery: currentMethodOfDelivery, 
          reframedLanguage: currentReframedLanguage, storyOrAnalogy: currentStoryOrAnalogy, mechanismName: currentMechanismName,
          createdAt: new Date().toISOString()
        };
        updatedMechanisms = [newMechanism, ...pastMechanisms];
        toast({ title: "Mechanism Saved!", description: `${currentMechanismName} for ${currentProduct} has been saved.` });
    }
    
    setPastMechanisms(updatedMechanisms);
    setShowForm(false);
    setEditingMechanism(null);
    resetForm();
  };

  const handleDeleteMechanism = (idToDelete: string) => {
    const mechToDelete = pastMechanisms.find(m => m.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete mechanism "${mechToDelete?.mechanismName || 'this mechanism'}" for product "${mechToDelete?.product || ''}"? This cannot be undone.`);
    if (!confirmed) return;

    setPastMechanisms(prev => prev.filter(mech => mech.id !== idToDelete));
    toast({ title: "Mechanism Deleted", description: `Mechanism "${mechToDelete?.mechanismName}" removed.` });
    if (editingMechanism?.id === idToDelete) {
        setShowForm(false);
        setEditingMechanism(null);
    }
  };
  
  const sortedPastMechanisms = [...pastMechanisms].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-2xl">
                        {showForm ? (editingMechanism ? 'Edit Product Mechanism' : 'Develop Product Mechanism') : 'Product Mechanisms'}
                    </CardTitle>
                    <CardDescription>
                        {showForm ? 'Modify or enter details for the product mechanism.' : "Define your product's unique selling points. Use AI to brainstorm."}
                    </CardDescription>
                </div>
                {!showForm ? (
                    <Button onClick={handleCreateNewClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Mechanism
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleBackToList}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mechanism List
                    </Button>
                )}
            </div>
          </CardHeader>
          {showForm && (
            <>
                <CardContent className="space-y-6">
                    <div>
                    <Label htmlFor="product">Product Name *</Label>
                    <Input id="product" value={currentProduct} onChange={(e) => setCurrentProduct(e.target.value)} placeholder="e.g., SleepWell Pillow" required/>
                    </div>
                    <div>
                    <Label htmlFor="result">Result Provided *</Label>
                    <Input id="result" value={currentResultProvided} onChange={(e) => setCurrentResultProvided(e.target.value)} placeholder="e.g., Deep, restful sleep every night" required/>
                    </div>
                    <div>
                    <Label htmlFor="delivery">Method of Delivery</Label>
                    <Input id="delivery" value={currentMethodOfDelivery} onChange={(e) => setCurrentMethodOfDelivery(e.target.value)} placeholder="e.g., Ergonomic memory foam, cooling gel layer" />
                    </div>
                    <div>
                    <Label htmlFor="reframed">
                        Reframed Language
                        <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="inline ml-1 h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                        <TooltipContent><p>Turning features into sticky, memorable concepts.</p></TooltipContent>
                        </Tooltip>
                    </Label>
                    <Textarea id="reframed" value={currentReframedLanguage} onChange={(e) => setCurrentReframedLanguage(e.target.value)} placeholder="e.g., 'Cloud-Cradle Support System'" />
                    </div>
                    <div>
                    <Label htmlFor="story">Story or Analogy</Label>
                    <Textarea id="story" value={currentStoryOrAnalogy} onChange={(e) => setCurrentStoryOrAnalogy(e.target.value)} placeholder="e.g., Like sleeping on a supportive cloud that adapts to you." />
                    </div>
                    <div>
                    <Label htmlFor="mechanismName">Name Your Mechanism *</Label>
                    <Input id="mechanismName" value={currentMechanismName} onChange={(e) => setCurrentMechanismName(e.target.value)} placeholder="e.g., NeuroAdapt Sleep Technology™" required/>
                    </div>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4">
                    <Button onClick={handleGenerateSuggestions} disabled={isLoadingSuggestions} className="w-full sm:w-auto">
                    {isLoadingSuggestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate AI Suggestions
                    </Button>
                    <div className="flex space-x-2 w-full sm:w-auto justify-end">
                        <Button type="button" variant="outline" onClick={handleBackToList}>Cancel</Button>
                        <Button onClick={handleSaveMechanism} className="w-full sm:w-auto">
                            <Save className="mr-2 h-4 w-4" /> {editingMechanism ? 'Save Changes' : 'Save Mechanism'}
                        </Button>
                    </div>
                </CardFooter>
            </>
          )}
        </Card>

        {showForm && suggestedMechanisms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">AI-Suggested Mechanisms</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                {suggestedMechanisms.map((suggestion, index) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {!showForm && sortedPastMechanisms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center"><Eye className="mr-2 h-5 w-5 text-primary"/>Past Mechanisms</CardTitle>
              <CardDescription>Review your saved product mechanisms.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {sortedPastMechanisms.map(mech => (
                  <AccordionItem value={mech.id} key={mech.id}>
                    <AccordionTrigger className="font-semibold hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                            <span>{mech.mechanismName} <span className="text-sm text-muted-foreground ml-2">({mech.product})</span></span>
                             <div className="flex items-center space-x-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); handleEditClick(mech);}}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); handleDeleteMechanism(mech.id);}}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm">
                      <p><strong>Product:</strong> {mech.product}</p>
                      <p><strong>Result Provided:</strong> {mech.resultProvided}</p>
                      <p><strong>Method of Delivery:</strong> {mech.methodOfDelivery}</p>
                      <p><strong>Reframed Language:</strong> {mech.reframedLanguage}</p>
                      <p><strong>Story/Analogy:</strong> {mech.storyOrAnalogy}</p>
                      <p className="text-xs text-muted-foreground">Saved: {new Date(mech.createdAt).toLocaleDateString()}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
         {!showForm && sortedPastMechanisms.length === 0 && (
             <div className="text-center py-12">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mt-4 mb-2">No mechanisms defined yet.</p>
                <p className="text-sm text-muted-foreground">Click the "Add New Mechanism" button to get started!</p>
            </div>
         )}
      </div>
    </TooltipProvider>
  );
}
