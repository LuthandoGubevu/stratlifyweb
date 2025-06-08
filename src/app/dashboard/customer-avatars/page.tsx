
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Search, ArrowLeft, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export interface CustomerAvatar { // Exported for use in Submissions page
  id: string;
  name: string;
  demographics: string;
  psychographics: string;
  preferredChannels: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
}

const LOCAL_STORAGE_AVATARS_KEY = 'customerAvatarsEntries';


interface AvatarDisplayCardProps {
  avatar: CustomerAvatar;
  onEdit: () => void;
  onDelete: () => void;
}

const AvatarDisplayCard: React.FC<AvatarDisplayCardProps> = ({ avatar, onEdit, onDelete }) => {
  let resolvedSrc: string;
  if (avatar.imageUrl && typeof avatar.imageUrl === 'string' && (avatar.imageUrl.startsWith('http://') || avatar.imageUrl.startsWith('https://'))) {
    resolvedSrc = avatar.imageUrl;
  } else {
    resolvedSrc = 'https://placehold.co/64x64.png'; // Corrected placeholder and dimensions
  }

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Image
            src={resolvedSrc}
            alt={avatar.name || 'User Avatar'} // Added fallback for alt text
            width={64} height={64}
            className="rounded-lg object-cover border"
            data-ai-hint="person profile"
          />
          <div className="flex-grow">
            <CardTitle className="font-headline text-lg mb-1 truncate" title={avatar.name}>
              {avatar.name}
            </CardTitle>
            <CardDescription className="text-xs">
              Created: {new Date(avatar.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <p className="line-clamp-2"><strong className="text-muted-foreground">Demographics:</strong> {avatar.demographics}</p>
        <p className="line-clamp-2"><strong className="text-muted-foreground">Psychographics:</strong> {avatar.psychographics}</p>
        {avatar.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {avatar.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="mr-2 h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Avatar</span>
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function CustomerAvatarsPage() {
  const [avatars, setAvatars] = useState<CustomerAvatar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<CustomerAvatar | null>(null);

  const [currentName, setCurrentName] = useState('');
  const [currentDemographics, setCurrentDemographics] = useState('');
  const [currentPsychographics, setCurrentPsychographics] = useState('');
  const [currentChannels, setCurrentChannels] = useState('');
  const [currentTags, setCurrentTags] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedAvatars = localStorage.getItem(LOCAL_STORAGE_AVATARS_KEY);
    if (storedAvatars) {
        try {
            setAvatars(JSON.parse(storedAvatars));
        } catch(e) {
            console.error("Failed to parse avatars from localStorage", e);
            setAvatars([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_AVATARS_KEY, JSON.stringify(avatars));
  }, [avatars]);

  const resetForm = () => {
    setCurrentName('');
    setCurrentDemographics('');
    setCurrentPsychographics('');
    setCurrentChannels('');
    setCurrentTags('');
    setCurrentImageUrl('');
  };

  const handleCreateNewClick = () => {
    setEditingAvatar(null);
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (avatar: CustomerAvatar) => {
    setEditingAvatar(avatar);
    setCurrentName(avatar.name);
    setCurrentDemographics(avatar.demographics);
    setCurrentPsychographics(avatar.psychographics);
    setCurrentChannels(avatar.preferredChannels);
    setCurrentTags(avatar.tags.join(', '));
    setCurrentImageUrl(avatar.imageUrl || '');
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingAvatar(null);
    resetForm();
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentName.trim()) {
      toast({ title: "Error", description: "Avatar Name is required.", variant: "destructive" });
      return;
    }
    const tagsArray = currentTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    let updatedAvatars;

    if (editingAvatar) {
        const avatarToUpdate: CustomerAvatar = {
            ...editingAvatar,
            name: currentName,
            demographics: currentDemographics,
            psychographics: currentPsychographics,
            preferredChannels: currentChannels,
            tags: tagsArray,
            imageUrl: currentImageUrl || undefined,
        };
        updatedAvatars = avatars.map(avatar => avatar.id === editingAvatar.id ? avatarToUpdate : avatar);
        toast({ title: "Avatar Updated", description: `Customer avatar "${currentName}" has been updated.`});
    } else {
        const newAvatar: CustomerAvatar = {
          id: String(Date.now()),
          name: currentName,
          demographics: currentDemographics,
          psychographics: currentPsychographics,
          preferredChannels: currentChannels,
          tags: tagsArray,
          imageUrl: currentImageUrl || undefined,
          createdAt: new Date().toISOString(),
        };
        updatedAvatars = [newAvatar, ...avatars];
        toast({ title: "Customer Avatar Added", description: `New persona "${currentName}" saved.` });
    }
    setAvatars(updatedAvatars);
    setShowForm(false);
    setEditingAvatar(null);
    resetForm();
  };

  const handleDeleteAvatar = (idToDelete: string) => {
    const avatarToDelete = avatars.find(d => d.id === idToDelete);
    const confirmed = window.confirm(`Are you sure you want to delete the avatar "${avatarToDelete?.name || 'this avatar'}"? This cannot be undone.`);
    if (!confirmed) return;

    setAvatars(prev => prev.filter(avatar => avatar.id !== idToDelete));
    toast({ title: "Avatar Deleted", description: `Customer avatar "${avatarToDelete?.name}" removed.` });
    if (editingAvatar?.id === idToDelete) {
        setShowForm(false);
        setEditingAvatar(null);
    }
  };

  const filteredAvatars = avatars.filter(avatar =>
    Object.values(avatar).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) || avatar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-2xl">
                         {showForm ? (editingAvatar ? 'Edit Customer Avatar' : 'Define Customer Avatar') : 'Customer Avatars'}
                    </CardTitle>
                    <CardDescription>
                        {showForm ? 'Modify or enter details for the customer persona.' : 'Manage your audience personas. Data saved locally.'}
                    </CardDescription>
                </div>
                 {!showForm ? (
                    <Button onClick={handleCreateNewClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Avatar
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleBackToList}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Avatar List
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
        {showForm ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Avatar Name *</Label>
                        <Input id="name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} placeholder="e.g., Eco-Conscious Shopper" required/>
                    </div>
                    <div>
                        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                        <Input id="imageUrl" value={currentImageUrl} onChange={(e) => setCurrentImageUrl(e.target.value)} placeholder="https://placehold.co/64x64.png" />
                    </div>
                </div>
                <div>
                    <Label htmlFor="demographics">Demographics</Label>
                    <Textarea id="demographics" value={currentDemographics} onChange={(e) => setCurrentDemographics(e.target.value)} placeholder="e.g., Age: 25-35, Female, Urban, $50k-$75k income" />
                </div>
                <div>
                    <Label htmlFor="psychographics">Psychographics (Pain Points, Goals, Values)</Label>
                    <Textarea id="psychographics" value={currentPsychographics} onChange={(e) => setCurrentPsychographics(e.target.value)} placeholder="e.g., Values sustainability, seeks convenience, struggles with time management." />
                </div>
                <div>
                    <Label htmlFor="channels">Preferred Channels (Comma-separated)</Label>
                    <Input id="channels" value={currentChannels} onChange={(e) => setCurrentChannels(e.target.value)} placeholder="e.g., Instagram, Pinterest, Eco-blogs" />
                </div>
                <div>
                    <Label htmlFor="tags">Tags (Comma-separated)</Label>
                    <Input id="tags" value={currentTags} onChange={(e) => setCurrentTags(e.target.value)} placeholder="e.g., Millenial, Environment, Online Shopper" />
                </div>
                <CardFooter className="p-0 pt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2">
                    <Button type="button" variant="outline" onClick={handleBackToList} className="w-full sm:w-auto">Cancel</Button>
                    <Button type="submit" className="w-full sm:w-auto">{editingAvatar ? 'Save Changes' : 'Add Avatar'}</Button>
                </CardFooter>
            </form>
        ) : (
          <>
            <div className="mb-6">
                <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search avatars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-1/2 md:w-1/3"
                />
                </div>
            </div>
            {filteredAvatars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAvatars.map((avatar) => (
                        <AvatarDisplayCard
                            key={avatar.id}
                            avatar={avatar}
                            onEdit={() => handleEditClick(avatar)}
                            onDelete={() => handleDeleteAvatar(avatar.id)}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12">
                    <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg mt-4 mb-2">
                        {searchTerm ? 'No avatars match your search.' : 'No customer avatars defined yet.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Try a different search term or clear filters.' : 'Click the "Add New Avatar" button to create your first persona!'}
                    </p>
                </div>
            )}
          </>
        )}
        </CardContent>
    </Card>
  );
}

