
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Switch } from "@/components/ui/switch";
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_DARK_MODE_KEY = 'stratify-darkMode';

export default function ProfilePage() {
  const { user, loading: authLoading, setError: setAuthError, error: authError } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); 
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
    const storedDarkMode = localStorage.getItem(LOCAL_STORAGE_DARK_MODE_KEY);
    if (storedDarkMode) {
      const isDark = storedDarkMode === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user]);

  const handleDarkModeToggle = (isDark: boolean) => {
    setDarkMode(isDark);
    localStorage.setItem(LOCAL_STORAGE_DARK_MODE_KEY, String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
      toast({ title: "Dark Mode Enabled"});
    } else {
      document.documentElement.classList.remove('dark');
      toast({ title: "Light Mode Enabled"});
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to update your profile.", variant: "destructive" });
        return;
    }

    setIsSubmittingProfile(true);
    setAuthError(null);

    try {
      const nameChanged = displayName !== (user.displayName || '');

      if (nameChanged) {
        await updateProfile(auth.currentUser!, {
          displayName,
        });
        toast({ title: "Profile Updated", description: "Your display name has been saved." });
      } else {
        toast({ title: "No Changes", description: "No new information to save." });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      setAuthError(error.message);
      toast({ title: "Update Failed", description: `Error: ${error.message}.`, variant: "destructive" });
    } finally {
      setIsSubmittingProfile(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) {
        toast({ title: "Not Authenticated", description: "User not found for password update.", variant: "destructive" });
        return;
    }
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
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);
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

            <Button type="submit" disabled={isSubmittingProfile}>
              {isSubmittingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Profile...</> : 'Save Profile Changes'}
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
              {isSubmittingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password...</> : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center justify-between">
            <div className="flex-grow">
              <Label htmlFor="notifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates and alerts via email. (Currently UI only)</p>
            </div>
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} className="self-start sm:self-center mt-1 sm:mt-0" />
          </div>
           <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center justify-between">
            <div className="flex-grow">
              <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle dark theme for the application.</p>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={handleDarkModeToggle} className="self-start sm:self-center mt-1 sm:mt-0" />
          </div>
          <Button variant="outline" onClick={() => toast({title: "Settings Mockup", description: "Dark mode preference is saved automatically. Other general app settings could be saved here."})}>Save Other Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
