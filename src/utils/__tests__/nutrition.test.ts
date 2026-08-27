import { 
  calculerValeursPortion, 
  calculerTotauxRepas, 
  calculerNutriscoreMoyen, 
  PortionAliment 
} from '../nutrition';
import { Aliment } from '../../types/nutrition';

const poulet: Aliment = {
  id: '1',
  nom: 'Poulet',
  calories: 165,
  proteines: 31,
  glucides: 0,
  lipides: 3.6,
  nutriscore: 'A',
};

const chocolat: Aliment = {
  id: '2',
  nom: 'Chocolat',
  calories: 500,
  proteines: 5,
  glucides: 60,
  lipides: 30,
  nutriscore: 'E',
};

describe('Moteur de calcul nutritionnel', () => {
  test('calcule correctement les valeurs pour une portion de 200g', () => {
    const result = calculerValeursPortion(poulet, 200);
    expect(result.calories).toBe(330);
    expect(result.proteines).toBe(62);
    expect(result.glucides).toBe(0);
    expect(result.lipides).toBe(7.2);
  });

  test('calcule le total d un repas avec plusieurs aliments', () => {
    const portions: PortionAliment[] = [
      { aliment: poulet, quantiteEnGrams: 100 },
      { aliment: chocolat, quantiteEnGrams: 50 },
    ];
    const totaux = calculerTotauxRepas(portions);
    
    // 165 + (500 * 0.5) = 415 kcal
    expect(totaux.calories).toBe(415);
    // 31 + (5 * 0.5) = 33.5 g de protéines
    expect(totaux.proteines).toBe(33.5);
  });

  test('calcule le Nutri-Score moyen pondéré', () => {
    // 100g de poulet (A = 1pt) et 100g de chocolat (E = 5pts) -> Moyenne 3 -> Score C
    const portions: PortionAliment[] = [
      { aliment: poulet, quantiteEnGrams: 100 },
      { aliment: chocolat, quantiteEnGrams: 100 },
    ];
    expect(calculerNutriscoreMoyen(portions)).toBe('C');
  });
});