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
import { PlusCircle, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface CustomerAvatar {
  id: string;
  name: string; // e.g., Tech Savvy Millenial, Busy Mom, Startup Founder
  demographics: string; // Age, Gender, Location, Income, Education
  psychographics: string; // Interests, Values, Lifestyle, Pain Points, Goals
  preferredChannels: string; // Social media, Email, Blogs, etc. (comma-separated)
  tags: string[]; // For filtering/categorization
  imageUrl?: string; // Optional image for the avatar
  createdAt: string;
}

const LOCAL_STORAGE_AVATARS_KEY = 'customerAvatarsEntries';

export default function CustomerAvatarsPage() {
  const [avatars, setAvatars] = useState<CustomerAvatar[]>([]);
  const [newName, setNewName] = useState('');
  const [newDemographics, setNewDemographics] = useState('');
  const [newPsychographics, setNewPsychographics] = useState('');
  const [newChannels, setNewChannels] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedAvatars = localStorage.getItem(LOCAL_STORAGE_AVATARS_KEY);
    if (storedAvatars) {
      setAvatars(JSON.parse(storedAvatars));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_AVATARS_KEY, JSON.stringify(avatars));
  }, [avatars]);

  const handleAddAvatar = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast({ title: "Error", description: "Avatar Name is required.", variant: "destructive" });
      return;
    }
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const newAvatar: CustomerAvatar = {
      id: String(Date.now()),
      name: newName,
      demographics: newDemographics,
      psychographics: newPsychographics,
      preferredChannels: newChannels,
      tags: tagsArray,
      imageUrl: newImageUrl || undefined,
      createdAt: new Date().toISOString(),
    };
    setAvatars(prev => [newAvatar, ...prev]);
    setNewName('');
    setNewDemographics('');
    setNewPsychographics('');
    setNewChannels('');
    setNewTags('');
    setNewImageUrl('');
    toast({ title: "Customer Avatar Added", description: "New persona saved." });
  };

  const handleDeleteAvatar = (id: string) => {
    setAvatars(prev => prev.filter(avatar => avatar.id !== id));
    toast({ title: "Avatar Deleted", description: "Customer avatar removed." });
  };

  const filteredAvatars = avatars.filter(avatar => 
    Object.values(avatar).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) || avatar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Define Customer Avatar</CardTitle>
          <CardDescription>Create and manage predefined audience personas. Data saved locally.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddAvatar}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Avatar Name</Label>
                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Eco-Conscious Shopper" />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input id="imageUrl" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://placehold.co/100x100.png" />
              </div>
            </div>
            <div>
              <Label htmlFor="demographics">Demographics</Label>
              <Textarea id="demographics" value={newDemographics} onChange={(e) => setNewDemographics(e.target.value)} placeholder="e.g., Age: 25-35, Female, Urban, $50k-$75k income" />
            </div>
            <div>
              <Label htmlFor="psychographics">Psychographics (Pain Points, Goals, Values)</Label>
              <Textarea id="psychographics" value={newPsychographics} onChange={(e) => setNewPsychographics(e.target.value)} placeholder="e.g., Values sustainability, seeks convenience, struggles with time management." />
            </div>
             <div>
              <Label htmlFor="channels">Preferred Channels (Comma-separated)</Label>
              <Input id="channels" value={newChannels} onChange={(e) => setNewChannels(e.target.value)} placeholder="e.g., Instagram, Pinterest, Eco-blogs" />
            </div>
            <div>
              <Label htmlFor="tags">Tags (Comma-separated)</Label>
              <Input id="tags" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="e.g., Millenial, Environment, Online Shopper" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Avatar
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Stored Customer Avatars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search avatars..."
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
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="max-w-xs">Demographics</TableHead>
                  <TableHead className="max-w-xs">Psychographics</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAvatars.map((avatar) => (
                  <TableRow key={avatar.id}>
                    <TableCell>
                      <Image 
                        src={avatar.imageUrl || `https://placehold.co/64x64.png?text=${avatar.name.charAt(0)}`} 
                        alt={avatar.name} 
                        width={40} height={40} 
                        className="rounded-full object-cover"
                        data-ai-hint="person profile" 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{avatar.name}</TableCell>
                    <TableCell className="text-xs max-w-xs break-words">{avatar.demographics}</TableCell>
                    <TableCell className="text-xs max-w-xs break-words">{avatar.psychographics}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {avatar.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAvatar(avatar.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredAvatars.length === 0 && <p className="text-center text-muted-foreground mt-4">No customer avatars stored yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
