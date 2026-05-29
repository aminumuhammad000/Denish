import React, { createContext, useState, useContext } from 'react';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState({
    // Step 1: Business Info
    businessName: '',
    category: '',
    address: '',
    about: '',
    phone: '',
    email: '',
    
    // Step 2: Opening Hours
    openingHours: {},
    
    // Step 3: Images
    logoUrl: '',
    coverUrl: '',
    
    // Step 4: Payout
    bank: '',
    bankCode: '',
    accountName: '',
    accountNumber: '',
  });

  const updateOnboardingData = (newData) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
