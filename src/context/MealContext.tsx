import React, { createContext, useState, ReactNode } from 'react';
import { PortionAliment } from '../utils/nutrition';

interface MealContextProps {
  portions: PortionAliment[];
  addPortion: (portion: PortionAliment) => void;
  removePortion: (index: number) => void;
  clearMeal: () => void;
}

export const MealContext = createContext<MealContextProps>({
  portions: [],
  addPortion: () => {},
  removePortion: () => {},
  clearMeal: () => {},
});

export const MealProvider = ({ children }: { children: ReactNode }) => {
  const [portions, setPortions] = useState<PortionAliment[]>([]);

  const addPortion = (portion: PortionAliment) => {
    setPortions((prev) => [...prev, portion]);
  };

  const removePortion = (index: number) => {
    setPortions((prev) => prev.filter((_, i) => i !== index));
  };

  // Vider complètement la liste des aliments
  const clearMeal = () => {
    setPortions([]);
  };

  return (
    <MealContext.Provider value={{ portions, addPortion, removePortion, clearMeal }}>
      {children}
    </MealContext.Provider>
  );
};