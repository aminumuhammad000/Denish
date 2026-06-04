import React, { createContext, useState, useContext } from 'react';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState({
    // Vendor Specific
    businessName: '',
    category: '',
    about: '',
    logoUrl: '',
    coverUrl: '',
    openingHours: {},

    // Driver Specific
    driverName: '',
    driverDob: '',
    driverPhone: '',
    driverEmail: '',
    driverAddress: '',
    vehicleType: 'Motorcycle',
    vehicleMake: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: '',
    docs: {
      nationalId: null,
      vehiclePhoto: null,
      license: null,
    },

    // Shared / Generic
    bank: '',
    bankCode: '',
    accountName: '',
    accountNumber: '',
    phone: '',
    email: '',
    address: '',
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
