'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextValue {
  customerId: string;
  customerName: string;
  setCustomerId: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  customerId: 'CUST-0001',
  customerName: 'James Johnson',
  setCustomerId: () => {},
});

// Demo customers for the customer selector
export const DEMO_CUSTOMERS = [
  { id: 'CUST-0001', name: 'James Johnson' },
  { id: 'CUST-0002', name: 'Maria Patel' },
  { id: 'CUST-0003', name: 'David Chen' },
  { id: 'CUST-0004', name: 'Sarah Rodriguez' },
  { id: 'CUST-0005', name: 'Wei Smith' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customerId, setCustomerId] = useState('CUST-0001');
  const customerName = DEMO_CUSTOMERS.find((c) => c.id === customerId)?.name ?? 'Unknown';

  return (
    <AuthContext.Provider value={{ customerId, customerName, setCustomerId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
