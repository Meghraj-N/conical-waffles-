export type Category = 'Chocolate' | 'Fruity' | 'Classics'
export type Size = { name: string; price: number }
export type Product = {
  id: number
  name: string
  description: string
  image: string
  category: Category
  sizes: Size[]
  badge?: string
  tone: string
  featured?: boolean
}
export type CartItem = { key: string; product: Product; size: Size; quantity: number }

export type Review = {
  id: string
  author: string
  avatarColor?: string
  rating: number
  productId?: number
  productName: string
  productImage?: string
  tableCaption?: string
  receiptCode?: string
  customerBio?: string
  date: string
  content: string
  location?: string
  occasion?: string
  verifiedType?: string
  tags?: string[]
}

export const waffleSizes = (price: number): Size[] => [
  { name: 'Regular', price },
  { name: 'Large', price: price + 40 },
  { name: 'Mini box', price: price + 70 },
]

export const formatPrice = (price: number): string => `₹${price}`

export const filterProducts = (
  products: Product[],
  category: 'All' | Category,
): Product[] => {
  if (category === 'All') return products
  return products.filter((p) => p.category === category)
}

export const searchProducts = (
  products: Product[],
  query: string,
): Product[] => {
  const term = query.trim().toLowerCase()
  if (!term) return products.slice(0, 5)
  return products.filter((p) =>
    `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(term),
  )
}

export const calculateCartSubtotal = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.size.price * item.quantity, 0)
}

export const calculateCartCount = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

export const addCartItem = (
  cart: CartItem[],
  product: Product,
  size: Size,
): CartItem[] => {
  const key = `${product.id}-${size.name}`
  const existing = cart.find((item) => item.key === key)
  if (existing) {
    return cart.map((item) =>
      item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
    )
  }
  return [...cart, { key, product, size, quantity: 1 }]
}

export const updateCartItemQuantity = (
  cart: CartItem[],
  key: string,
  delta: number,
): CartItem[] => {
  return cart
    .map((item) =>
      item.key === key ? { ...item, quantity: item.quantity + delta } : item,
    )
    .filter((item) => item.quantity > 0)
}

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    author: 'Tanvi & Rishabh Shah',
    customerBio: 'Evening regulars from Mahavir Nagar · Visiting since 2021',
    rating: 5,
    productId: 5,
    productName: 'Lotus Biscoff',
    productImage: './images/hero-waffle.webp',
    tableCaption: 'Warm Biscoff drizzle right off the iron at 11:20 PM',
    receiptCode: 'TABLE NOTE #104 · MAHAVIR NAGAR',
    date: 'Yesterday, 11:20 PM',
    location: 'Mahavir Nagar, Kandivali',
    occasion: 'Post-dinner walk at Khau Gali',
    verifiedType: 'In-Store Guest',
    content: 'We walked over right after dinner at Khau Gali. You can smell the caramelized waffle batter from down the lane. The crunch of the fresh stick waffle against the warm melted Lotus Biscoff spread is unbeatable—and the brother at the counter always adds an extra biscuit crumble for us.',
    tags: ['Crispy & Warm', 'Signature Biscoff', 'Never Soggy'],
  },
  {
    id: 'rev-2',
    author: 'Dr. Harshvardhan Kulkarni',
    customerBio: 'Pediatrician & father of two · Borivali West',
    rating: 5,
    productId: 3,
    productName: 'Strawberry Surprise',
    productImage: './images/strawberry-surprise.webp',
    tableCaption: 'Aadya’s post-exam reward — zero mess on a stick!',
    receiptCode: 'TABLE NOTE #098 · KANDIVALI STORE',
    date: '3 days ago',
    location: 'Borivali West',
    occasion: 'Daughter’s Exam Celebration',
    verifiedType: 'Dine-in Family',
    content: 'Brought my nine-year-old daughter here after her final school exam. Because the waffle is baked on a stick, she could enjoy every bite without sticky hands. Knowing the entire kitchen is 100% pure vegetarian and bakes each order fresh in front of you gives us complete peace of mind as parents.',
    tags: ['100% Pure Veg', 'Family Favorite', 'Real Strawberries'],
  },
  {
    id: 'rev-3',
    author: 'Snehal Parekh & Studio Team',
    customerBio: 'Architecture studio on Link Road · Wednesday regulars',
    rating: 5,
    productId: 1,
    productName: 'Dark & White Delight',
    productImage: './images/dark-white-delight.webp',
    tableCaption: 'Our studio’s midweek 2-for-1 ritual every Wednesday',
    receiptCode: 'TABLE NOTE #089 · WEDNESDAY BOGO',
    date: 'Last Wednesday',
    location: 'Kandivali Link Road',
    occasion: 'Wednesday BOGO Ritual',
    verifiedType: 'Zomato Order',
    content: 'Wednesday afternoon at our studio means someone is picking up the BOGO deal from Conical Gaufres. The Dark & White Delight hits the exact sweet spot—deep roasted cocoa balanced by creamy white chocolate ribbons. Even after a 15-minute ride back to the office, the waffle stays crisp.',
    tags: ['Wednesday BOGO', 'Generous Chocolate', 'Office Favorite'],
  },
  {
    id: 'rev-4',
    author: 'Kabir & Ananya Verma',
    customerBio: 'Weekend dessert explorers · Malad West',
    rating: 5,
    productId: 8,
    productName: 'Slow-Churned Gelato',
    productImage: './images/gelato.webp',
    tableCaption: 'Hot waffle paired with cold slow-churned gelato scoop',
    receiptCode: 'TABLE NOTE #076 · LATE EVENING',
    date: 'Last Sunday',
    location: 'Malad West',
    occasion: 'Sunday Date Night',
    verifiedType: 'In-Store Guest',
    content: 'Most dessert places rush the batter, but here they let the waffle iron crisp the edges properly before pairing it with their slow-churned gelato. That contrast of piping hot golden crust and dense, creamy gelato feels like a little European patisserie tucked inside Kandivali.',
    tags: ['Artisan Gelato', 'Hot & Cold Pair', 'Must Try'],
  },
  {
    id: 'rev-5',
    author: 'Neha & Siddharth Merchant',
    customerBio: 'Neighbors from Thakur Village · Late-night patrons',
    rating: 5,
    productId: 4,
    productName: 'Triple Chocolate',
    productImage: './images/waffle-0022.webp',
    tableCaption: '12:15 AM midnight craving — served piping hot',
    receiptCode: 'TABLE NOTE #064 · MIDNIGHT SERVICE',
    date: '2 weeks ago',
    location: 'Thakur Village, Kandivali',
    occasion: 'Midnight Cravings',
    verifiedType: 'In-Store Guest',
    content: 'We pulled up at 12:15 AM expecting the kitchen to be winding down, yet the staff welcomed us with genuine warmth and poured fresh batter onto the iron. Three distinct layers of melted chocolate and roasted choco-chips—worth every single calorie.',
    tags: ['Late Night Fix', 'Decadent Chocolate', 'Super Friendly'],
  },
]

export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export const filterReviewsByTag = (reviews: Review[], tag: string): Review[] => {
  if (!tag || tag === 'All') return reviews
  return reviews.filter(
    (r) =>
      r.tags?.some((t) => t.toLowerCase().includes(tag.toLowerCase())) ||
      r.productName.toLowerCase().includes(tag.toLowerCase()) ||
      r.occasion?.toLowerCase().includes(tag.toLowerCase()),
  )
}

export const addReview = (
  reviews: Review[],
  newReview: Omit<Review, 'id' | 'date'> & { date?: string },
): Review[] => {
  const avatarColors = [
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-600',
    'from-emerald-400 to-teal-600',
    'from-indigo-400 to-purple-600',
    'from-amber-500 to-yellow-600',
  ]
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]

  const productImageMap: Record<string, string> = {
    'Dark & White Delight': './images/dark-white-delight.webp',
    'Oreo Cookie Delight': './images/oreo-cookie-delight.webp',
    'Strawberry Surprise': './images/strawberry-surprise.webp',
    'Triple Chocolate': './images/waffle-0022.webp',
    'Lotus Biscoff': './images/hero-waffle.webp',
    'Berry Bliss': './images/waffle-04.webp',
    'Rainbow Surprise': './images/rainbow-surprise.webp',
    'Slow-Churned Gelato': './images/gelato.webp',
  }

  const matchedImage =
    newReview.productImage ||
    productImageMap[newReview.productName] ||
    './images/hero-waffle.webp'

  const reviewWithMeta: Review = {
    ...newReview,
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    avatarColor: newReview.avatarColor || randomColor,
    productImage: matchedImage,
    tableCaption:
      newReview.tableCaption ||
      `Freshly ironed ${newReview.productName} at Kandivali West`,
    receiptCode:
      newReview.receiptCode ||
      `TABLE NOTE #${105 + reviews.length} · KANDIVALI WEST`,
    customerBio:
      newReview.customerBio ||
      `${newReview.location || 'Kandivali West'} · ${newReview.occasion || 'In-Store Visit'}`,
    date: newReview.date || 'Just now',
    verifiedType: newReview.verifiedType || 'In-Store Guest',
    occasion: newReview.occasion || 'Sweet Visit',
    tags: newReview.tags && newReview.tags.length > 0 ? newReview.tags : ['Freshly Baked', 'Sweet Moments'],
  }
  return [reviewWithMeta, ...reviews]
}

