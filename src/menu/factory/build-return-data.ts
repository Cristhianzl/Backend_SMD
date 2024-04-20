export const buildFinalMenu = (data: any) => {
  const groupedMenu = data.reduce(
    (menu, item, index) => {
      const categoryId = item.category_id;

      // Check if a category with the given category_id already exists in the menu
      const existingCategory = menu.categories.find(
        (category) => category.category_id === categoryId,
      );

      if (existingCategory) {
        // Category already exists, add the product to it
        existingCategory.products.push({
          id: item.product_id,
          product_order_view: item.product_order_view,
          product_name: item.product_name,
          product_img: item.product_img,
          price: item.price,
          discount_type: item.discount_type,
          discount_value: item.discount_value,
          description: item.description,
          is_gluten_free: item.is_gluten_free,
          is_vegan: item.is_vegan,
          is_vegetarian: item.is_vegetarian,
        });
      } else {
        // Category does not exist, create a new category
        menu.categories.push({
          category_id: categoryId,
          category_order_view: item.category_order_view,
          category_name: item.category_name,
          category_img: item.category_img,
          current: index === 0 ? true : false,
          products: [
            {
              id: item.product_id,
              product_order_view: item.product_order_view,
              product_name: item.product_name,
              product_img: item.product_img,
              price: item.price,
              discount_type: item.discount_type,
              discount_value: item.discount_value,
              description: item.description,
              is_gluten_free: item.is_gluten_free,
              is_vegan: item.is_vegan,
              is_vegetarian: item.is_vegetarian,
            },
          ],
        });
      }

      return menu;
    },
    {
      name: data[0].name,
      categories: [],
    },
  );

  const menu = {
    name: groupedMenu.name,
    categories: groupedMenu.categories,
    tenant: '',
    img: '',
  };

  return menu;
};
