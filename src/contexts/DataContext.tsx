'use client';

import { createContext, useContext, useState } from 'react';
// import { db } from '@/lib/firebase';
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface DataContextType {
  // Define data and functions here, e.g., for marketing strategies
  // strategies: any[];
  // fetchStrategies: () => Promise<void>;
  // addStrategy: (strategy: any) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  // const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Example functions (to be implemented with Firestore)
  // const fetchStrategies = async () => {
  //   setLoading(true);
  //   // const querySnapshot = await getDocs(collection(db, "strategies"));
  //   // const fetchedStrategies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //   // setStrategies(fetchedStrategies);
  //   setLoading(false);
  // };

  // const addStrategy = async (strategy: any) => {
  //   setLoading(true);
  //   // await addDoc(collection(db, "strategies"), strategy);
  //   // await fetchStrategies(); // Refresh
  //   setLoading(false);
  // };

  return (
    <DataContext.Provider value={{ loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
