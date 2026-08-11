import { getMenuCollection } from './mongodb';
import { categories } from './categories';
import { getItemDescription } from './itemDescriptions';

export async function getMenuData() {
  const collection = await getMenuCollection();
  const menuData = {};

  for (const category of categories) {
    const items = await collection
      .find({ category: category.id })
      .project({ item: 1, price: 1, imageUrl: 1, _id: 0 })
      .toArray();

    const itemsWithDescriptions = items.map((item) => ({
      ...item,
      description: getItemDescription(item.item)
    }));

    menuData[category.id] = {
      name: category.name,
      items: itemsWithDescriptions
    };
  }

  return menuData;
}
