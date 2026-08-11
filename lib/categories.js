export const categories = [
  { id: 'breakfast', name: 'BREAKFAST' },
  { id: 'ass', name: 'APPETIZERS/ SALAD/ SOUP' },
  { id: 'nhp', name: 'NIGERIAN HOT POT' },
  { id: 'cb', name: 'CHICKEN/ BEEF' },
  { id: 'sp', name: 'SEAFOOD/ PASTA' },
  { id: 'mexican', name: 'MEXICAN MENU' },
  { id: 'hsd', name: 'HOT BEVERAGES/ SNACKS/ DESSERT' },
  { id: 'speciale', name: 'SAVOY SPECIALE/ PIZZA' },
  { id: 'savoydrinks', name: 'SAVOY SUMMERSET DRINKS' },
  { id: 'savoybar', name: 'SAVOY COCKTAIL BAR' }
];

export function isValidCategory(id) {
  return categories.some((cat) => cat.id === id);
}
