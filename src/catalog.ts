export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  platform: 'Zepto' | 'Blinkit';
  time: string;
  unit: string;
}

export const CATALOG: Product[] = [
  { id: 1, name: 'Aashirvaad Atta', category: 'Staples', price: 210, emoji: '🌾', platform: 'Zepto', time: '8-12 mins', unit: '5 kg' },
  { id: 2, name: 'Amul Taaza Milk', category: 'Dairy', price: 26, emoji: '🥛', platform: 'Blinkit', time: '10-15 mins', unit: '500 ml' },
  { id: 3, name: 'Farm Fresh Eggs', category: 'Dairy', price: 60, emoji: '🥚', platform: 'Zepto', time: '8-12 mins', unit: '6 pcs' },
  { id: 4, name: 'Britannia White Bread', category: 'Bakery', price: 40, emoji: '🍞', platform: 'Blinkit', time: '10-15 mins', unit: '400 g' },
  { id: 5, name: 'India Gate Basmati Rice', category: 'Staples', price: 180, emoji: '🍚', platform: 'Zepto', time: '8-12 mins', unit: '1 kg' },
  { id: 6, name: 'Tata Sampann Toor Dal', category: 'Staples', price: 160, emoji: '🥣', platform: 'Blinkit', time: '10-15 mins', unit: '1 kg' },
  { id: 7, name: 'Madhur Pure Sugar', category: 'Staples', price: 55, emoji: '🧂', platform: 'Zepto', time: '8-12 mins', unit: '1 kg' },
  { id: 8, name: 'Tata Salt', category: 'Staples', price: 24, emoji: '🧂', platform: 'Blinkit', time: '10-15 mins', unit: '1 kg' },
  { id: 9, name: 'Amul Butter', category: 'Dairy', price: 54, emoji: '🧈', platform: 'Zepto', time: '8-12 mins', unit: '100 g' },
  { id: 10, name: 'Amul Malai Paneer', category: 'Dairy', price: 85, emoji: '🧀', platform: 'Blinkit', time: '10-15 mins', unit: '200 g' },
  { id: 11, name: 'Nestle A+ Curd', category: 'Dairy', price: 65, emoji: '🥣', platform: 'Zepto', time: '8-12 mins', unit: '400 g' },
  { id: 12, name: 'Fresh Onion', category: 'Vegetables', price: 30, emoji: '🧅', platform: 'Blinkit', time: '10-15 mins', unit: '1 kg' },
  { id: 13, name: 'Fresh Tomato', category: 'Vegetables', price: 40, emoji: '🍅', platform: 'Zepto', time: '8-12 mins', unit: '1 kg' },
  { id: 14, name: 'Fresh Potato', category: 'Vegetables', price: 25, emoji: '🥔', platform: 'Blinkit', time: '10-15 mins', unit: '1 kg' },
  { id: 15, name: 'Robusta Banana', category: 'Fruits', price: 60, emoji: '🍌', platform: 'Zepto', time: '8-12 mins', unit: '6 pcs' },
  { id: 16, name: 'Kashmir Apple', category: 'Fruits', price: 150, emoji: '🍎', platform: 'Blinkit', time: '10-15 mins', unit: '4 pcs' },
  { id: 17, name: 'Maggi 2-Minute Noodles', category: 'Snacks', price: 14, emoji: '🍜', platform: 'Zepto', time: '8-12 mins', unit: '70 g' },
  { id: 18, name: 'Lay\'s India\'s Magic Masala', category: 'Snacks', price: 20, emoji: '🥔', platform: 'Blinkit', time: '10-15 mins', unit: '50 g' },
  { id: 19, name: 'Parle-G Biscuits', category: 'Snacks', price: 10, emoji: '🍪', platform: 'Zepto', time: '8-12 mins', unit: '130 g' },
  { id: 20, name: 'Taj Mahal Tea', category: 'Beverages', price: 150, emoji: '☕', platform: 'Blinkit', time: '10-15 mins', unit: '250 g' },
  { id: 21, name: 'Nescafe Classic Coffee', category: 'Beverages', price: 160, emoji: '☕', platform: 'Zepto', time: '8-12 mins', unit: '50 g' },
  { id: 22, name: 'Fortune Sunflower Oil', category: 'Staples', price: 140, emoji: '🛢️', platform: 'Blinkit', time: '10-15 mins', unit: '1 L' },
  { id: 23, name: 'Amul Pure Ghee', category: 'Staples', price: 275, emoji: '🍯', platform: 'Zepto', time: '8-12 mins', unit: '500 ml' },
  { id: 24, name: 'Head & Shoulders Shampoo', category: 'Personal Care', price: 180, emoji: '🧴', platform: 'Blinkit', time: '10-15 mins', unit: '180 ml' },
  { id: 25, name: 'Dove Cream Beauty Bathing Bar', category: 'Personal Care', price: 50, emoji: '🧼', platform: 'Zepto', time: '8-12 mins', unit: '100 g' },
  { id: 26, name: 'Colgate MaxFresh Toothpaste', category: 'Personal Care', price: 90, emoji: '🪥', platform: 'Blinkit', time: '10-15 mins', unit: '150 g' },
  { id: 27, name: 'Surf Excel Easy Wash', category: 'Home Care', price: 120, emoji: '🫧', platform: 'Zepto', time: '8-12 mins', unit: '1 kg' },
  { id: 28, name: 'Kinley Mineral Water', category: 'Beverages', price: 20, emoji: '💧', platform: 'Blinkit', time: '10-15 mins', unit: '1 L' },
  { id: 29, name: 'Haldiram\'s Bhujia Sev', category: 'Snacks', price: 50, emoji: '🥨', platform: 'Zepto', time: '8-12 mins', unit: '200 g' },
  { id: 30, name: 'Gowardhan Ghee', category: 'Staples', price: 290, emoji: '🍯', platform: 'Blinkit', time: '10-15 mins', unit: '500 ml' },
  { id: 31, name: 'Dabur Honey', category: 'Staples', price: 150, emoji: '🍯', platform: 'Zepto', time: '8-12 mins', unit: '250 g' },
  { id: 32, name: 'Kissan Fresh Tomato Ketchup', category: 'Condiments', price: 120, emoji: '🍅', platform: 'Blinkit', time: '10-15 mins', unit: '950 g' },
  { id: 33, name: 'Everest Garam Masala', category: 'Spices', price: 75, emoji: '🌶️', platform: 'Zepto', time: '8-12 mins', unit: '100 g' },
  { id: 34, name: 'MDH Chunky Chat Masala', category: 'Spices', price: 65, emoji: '🌶️', platform: 'Blinkit', time: '10-15 mins', unit: '100 g' },
  { id: 35, name: 'Catch Coriander Powder', category: 'Spices', price: 40, emoji: '🌿', platform: 'Zepto', time: '8-12 mins', unit: '100 g' },
  { id: 36, name: 'Brooke Bond Red Label Tea', category: 'Beverages', price: 130, emoji: '☕', platform: 'Blinkit', time: '10-15 mins', unit: '250 g' },
  { id: 37, name: 'Bru Instant Coffee', category: 'Beverages', price: 140, emoji: '☕', platform: 'Zepto', time: '8-12 mins', unit: '50 g' },
  { id: 38, name: 'Coca-Cola', category: 'Beverages', price: 40, emoji: '🥤', platform: 'Blinkit', time: '10-15 mins', unit: '750 ml' },
  { id: 39, name: 'Sprite', category: 'Beverages', price: 40, emoji: '🥤', platform: 'Zepto', time: '8-12 mins', unit: '750 ml' },
  { id: 40, name: 'Thums Up', category: 'Beverages', price: 40, emoji: '🥤', platform: 'Blinkit', time: '10-15 mins', unit: '750 ml' },
  { id: 41, name: 'Frooti Mango Drink', category: 'Beverages', price: 35, emoji: '🥭', platform: 'Zepto', time: '8-12 mins', unit: '600 ml' },
  { id: 42, name: 'Paper Boat Aamras', category: 'Beverages', price: 30, emoji: '🥭', platform: 'Blinkit', time: '10-15 mins', unit: '250 ml' },
  { id: 43, name: 'Pears Pure & Gentle Soap', category: 'Personal Care', price: 45, emoji: '🧼', platform: 'Zepto', time: '8-12 mins', unit: '75 g' },
  { id: 44, name: 'Lifebuoy Total 10 Soap', category: 'Personal Care', price: 30, emoji: '🧼', platform: 'Blinkit', time: '10-15 mins', unit: '100 g' },
  { id: 45, name: 'Sunsilk Black Shine Shampoo', category: 'Personal Care', price: 160, emoji: '🧴', platform: 'Zepto', time: '8-12 mins', unit: '180 ml' },
  { id: 46, name: 'Clinic Plus Strong & Long Shampoo', category: 'Personal Care', price: 140, emoji: '🧴', platform: 'Blinkit', time: '10-15 mins', unit: '175 ml' },
  { id: 47, name: 'Vim Dishwash Gel', category: 'Home Care', price: 110, emoji: '🍋', platform: 'Zepto', time: '8-12 mins', unit: '500 ml' },
  { id: 48, name: 'Lizol Floor Cleaner', category: 'Home Care', price: 180, emoji: '🧹', platform: 'Blinkit', time: '10-15 mins', unit: '975 ml' },
  { id: 49, name: 'Harpic Toilet Cleaner', category: 'Home Care', price: 160, emoji: '🚽', platform: 'Zepto', time: '8-12 mins', unit: '1 L' },
  { id: 50, name: 'Odonil Room Freshener', category: 'Home Care', price: 50, emoji: '🌸', platform: 'Blinkit', time: '10-15 mins', unit: '50 g' },
  { id: 51, name: 'Good Knight Gold Flash', category: 'Home Care', price: 80, emoji: '🦟', platform: 'Zepto', time: '8-12 mins', unit: '45 ml' },
  { id: 52, name: 'Dettol Antiseptic Liquid', category: 'Home Care', price: 190, emoji: '🏥', platform: 'Blinkit', time: '10-15 mins', unit: '250 ml' },
];
