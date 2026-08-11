const descriptions = {
  // Breakfast examples
  'Continental Breakfast': 'Freshly baked croissants, butter, jam, and your choice of coffee or tea',
  'Full English Breakfast': 'Eggs, bacon, sausages, baked beans, grilled tomatoes, mushrooms, and toast',

  // Appetizers examples
  Bruschetta: 'Toasted bread topped with tomatoes, garlic, and fresh basil',
  'Caesar Salad': 'Romaine lettuce, croutons, parmesan cheese with Caesar dressing',

  // Nigerian examples
  'Jollof Rice': 'Aromatic rice cooked in a rich tomato and pepper sauce with spices',
  'Pepper Soup': 'Spicy broth with assorted meats and traditional herbs',

  default: 'A delicious offering from our kitchen, prepared with the finest ingredients'
};

export function getItemDescription(itemName) {
  return descriptions[itemName] || descriptions.default;
}
