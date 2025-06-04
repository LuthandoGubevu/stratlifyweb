
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Switch } from "@/components/ui/switch";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase'; // Import Firebase storage instance
import { Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading, setError: setAuthError, error: authError } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  // No longer need photoURL state for input, will use imagePreviewUrl and user.photoURL
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setImagePreviewUrl(user.photoURL || null); // Initialize preview with current user photo
    }
  }, [user]);

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File Too Large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      // Don't reset imagePreviewUrl here, user might cancel selection
      // It will revert to user.photoURL if no file is ultimately uploaded
    }
  };

  const handleAvatarAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmittingProfile(true);
    setIsUploadingImage(false);
    setAuthError(null);

    let newPhotoURLForUpdate = user.photoURL; 

    try {
      if (selectedFile) {
        setIsUploadingImage(true);
        const filePath = `profileImages/${user.uid}/${Date.now()}_${selectedFile.name}`;
        const fileStorageRef = storageRef(storage, filePath);
        
        toast({ title: "Uploading Image...", description: "Please wait."});
        await uploadBytes(fileStorageRef, selectedFile);
        newPhotoURLForUpdate = await getDownloadURL(fileStorageRef);
        
        setImagePreviewUrl(newPhotoURLForUpdate); // Update preview to the new URL from storage
        setSelectedFile(null); // Reset selected file state
        setIsUploadingImage(false);
      }

      // Check if display name or photo URL actually changed
      const nameChanged = displayName !== (user.displayName || '');
      const photoChanged = newPhotoURLForUpdate !== (user.photoURL || null);

      if (nameChanged || photoChanged) {
        await updateProfile(user, {
          displayName,
          photoURL: newPhotoURLForUpdate, 
        });
        toast({ title: "Profile Updated", description: "Your profile details have been saved." });
      } else {
        toast({ title: "No Changes", description: "No new information to save." });
      }

    } catch (error: any) {
      console.error("Profile update error:", error);
      setAuthError(error.message);
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
      setIsUploadingImage(false);
    } finally {
      setIsSubmittingProfile(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return; 
    if (newPassword !== confirmNewPassword) {
      setAuthError("New passwords do not match.");
      toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      setAuthError("New password should be at least 6 characters.");
      toast({ title: "Weak Password", description: "New password should be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsSubmittingPassword(true);
    setAuthError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: "Password Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingPassword(false);
    }
  };


  if (authLoading) return (
    <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
    </div>
  );
  if (!user) return (
    <div className="flex justify-center items-center h-screen">
        <p>Please log in to view your profile.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
          <CardDescription>Manage your personal information and account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group cursor-pointer" onClick={handleAvatarAreaClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleAvatarAreaClick()}>
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreviewUrl || `https://placehold.co/100x100.png?text=${getInitials(displayName)}`} alt={displayName} data-ai-hint="profile avatar" />
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full transition-opacity">
                  <Edit3 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={handleAvatarAreaClick}>
                Change Picture
              </Button>
              <p className="text-xs text-muted-foreground">Click image or button to change. Max 5MB.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your Name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} disabled placeholder="your.email@example.com" />
              <p className="text-xs text-muted-foreground">Email address cannot be changed here. Contact support if needed.</p>
            </div>
            
            {authError && <p className="text-sm text-destructive">{authError}</p>}

            <Button type="submit" disabled={isSubmittingProfile || isUploadingImage}>
              {isUploadingImage ? 'Uploading Image...' : (isSubmittingProfile ? 'Saving Profile...' : 'Save Profile Changes')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
           <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={isSubmittingPassword}>
              {isSubmittingPassword ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates and alerts via email.</p>
            </div>
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
           <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle dark theme for the application.</p>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <Button variant="outline" onClick={() => toast({title: "Settings Saved (Placeholder)", description: "App settings would be saved here."})}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
