'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmailAndPassword: (email: string, pass: string) => Promise<User | null>;
  createUserWithEmailAndPassword: (name: string, email: string, pass: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmailAndPassword = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      setLoading(false);
      return userCredential.user;
    } catch (e) {
      const err = e as FirebaseError;
      setError(err.message || 'Failed to sign in.');
      setLoading(false);
      return null;
    }
  };

  const createUserWithEmailAndPassword = async (name: string, email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      setUser(userCredential.user);
      setLoading(false);
      return userCredential.user;
    } catch (e) {
      const err = e as FirebaseError;
      setError(err.message || 'Failed to create account.');
      setLoading(false);
      return null;
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (e) {
      const err = e as FirebaseError;
      setError(err.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
