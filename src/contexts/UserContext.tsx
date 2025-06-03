'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useState } from 'react';

interface UserContextType {
  // Define user-specific data and functions here
  preferences: Record<string, any>;
  updatePreferences: (newPreferences: Record<string, any>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = useState({});

  const updatePreferences = (newPreferences: Record<string, any>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  return (
    <UserContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
