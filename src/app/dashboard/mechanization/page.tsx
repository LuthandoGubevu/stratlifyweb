'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Sparkles, Loader2, Save, Eye } from 'lucide-react';
import { suggestMechanismIdeas, type SuggestMechanismIdeasInput, type SuggestMechanismIdeasOutput } from '@/ai/flows/suggest-mechanism-ideas';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Mechanism {
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
  const [product, setProduct] = useState('');
  const [resultProvided, setResultProvided] = useState('');
  const [methodOfDelivery, setMethodOfDelivery] = useState('');
  const [reframedLanguage, setReframedLanguage] = useState('');
  const [storyOrAnalogy, setStoryOrAnalogy] = useState('');
  const [mechanismName, setMechanismName] = useState('');
  
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestedMechanisms, setSuggestedMechanisms] = useState<string[]>([]);
  const [pastMechanisms, setPastMechanisms] = useState<Mechanism[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedMechanisms = localStorage.getItem(LOCAL_STORAGE_MECHANISMS_KEY);
    if (storedMechanisms) {
      setPastMechanisms(JSON.parse(storedMechanisms));
    }
  }, []);

  const handleGenerateSuggestions = async () => {
    if (!product || !resultProvided) {
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
        productDescription: `Product: ${product}. Result Provided: ${resultProvided}. Method of Delivery: ${methodOfDelivery}. Current ideas for reframing: ${reframedLanguage}. Potential story/analogy: ${storyOrAnalogy}.`,
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
    if (!product || !mechanismName) {
       toast({ title: "Error", description: "Product name and Mechanism Name are required to save.", variant: "destructive" });
       return;
    }
    const newMechanism: Mechanism = {
      id: String(Date.now()),
      product, resultProvided, methodOfDelivery, reframedLanguage, storyOrAnalogy, mechanismName,
      createdAt: new Date().toISOString()
    };
    const updatedMechanisms = [newMechanism, ...pastMechanisms];
    setPastMechanisms(updatedMechanisms);
    localStorage.setItem(LOCAL_STORAGE_MECHANISMS_KEY, JSON.stringify(updatedMechanisms));
    toast({ title: "Mechanism Saved!", description: `${mechanismName} for ${product} has been saved.` });
    // Clear form
    setProduct(''); setResultProvided(''); setMethodOfDelivery(''); setReframedLanguage(''); setStoryOrAnalogy(''); setMechanismName(''); setSuggestedMechanisms([]);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Develop Product Mechanism</CardTitle>
            <CardDescription>Define and store your product's unique mechanism. Use AI to brainstorm ideas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="product">Product Name</Label>
              <Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g., SleepWell Pillow" />
            </div>
            <div>
              <Label htmlFor="result">Result Provided</Label>
              <Input id="result" value={resultProvided} onChange={(e) => setResultProvided(e.target.value)} placeholder="e.g., Deep, restful sleep every night" />
            </div>
            <div>
              <Label htmlFor="delivery">Method of Delivery</Label>
              <Input id="delivery" value={methodOfDelivery} onChange={(e) => setMethodOfDelivery(e.target.value)} placeholder="e.g., Ergonomic memory foam, cooling gel layer" />
            </div>
            <div>
              <Label htmlFor="reframed">
                Reframed Language
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="inline ml-1 h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>Turning features into sticky, memorable concepts.</p></TooltipContent>
                </Tooltip>
              </Label>
              <Textarea id="reframed" value={reframedLanguage} onChange={(e) => setReframedLanguage(e.target.value)} placeholder="e.g., 'Cloud-Cradle Support System'" />
            </div>
            <div>
              <Label htmlFor="story">Story or Analogy</Label>
              <Textarea id="story" value={storyOrAnalogy} onChange={(e) => setStoryOrAnalogy(e.target.value)} placeholder="e.g., Like sleeping on a supportive cloud that adapts to you." />
            </div>
            <div>
              <Label htmlFor="mechanismName">Name Your Mechanism</Label>
              <Input id="mechanismName" value={mechanismName} onChange={(e) => setMechanismName(e.target.value)} placeholder="e.g., NeuroAdapt Sleep Technology™" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button onClick={handleGenerateSuggestions} disabled={isLoadingSuggestions} className="w-full sm:w-auto">
              {isLoadingSuggestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate AI Suggestions
            </Button>
            <Button onClick={handleSaveMechanism} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> Save Mechanism
            </Button>
          </CardFooter>
        </Card>

        {suggestedMechanisms.length > 0 && (
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

        {pastMechanisms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center"><Eye className="mr-2 h-5 w-5 text-primary"/>Past Mechanisms</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {pastMechanisms.map(mech => (
                  <AccordionItem value={mech.id} key={mech.id}>
                    <AccordionTrigger className="font-semibold">{mech.mechanismName} <span className="text-sm text-muted-foreground ml-2">({mech.product})</span></AccordionTrigger>
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
      </div>
    </TooltipProvider>
  );
}
