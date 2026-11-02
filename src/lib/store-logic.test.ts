import test from 'node:test'
import assert from 'node:assert/strict'
import {
  waffleSizes,
  formatPrice,
  filterProducts,
  searchProducts,
  calculateCartSubtotal,
  calculateCartCount,
  addCartItem,
  updateCartItemQuantity,
  initialReviews,
  calculateAverageRating,
  filterReviewsByTag,
  addReview,
  Product,
  CartItem,
  Review,
} from './store-logic'

const dummyProduct: Product = {
  id: 1,
  name: 'Dark & White Delight',
  description: 'Crisp waffle, dark chocolate and silky white drizzle.',
  image: '/images/dark-white-delight.webp',
  category: 'Chocolate',
  sizes: waffleSizes(70),
  badge: 'Bestseller',
  tone: 'cocoa',
  featured: true,
}

const dummyFruitProduct: Product = {
  id: 3,
  name: 'Strawberry Surprise',
  description: 'Sweet cream with a bright strawberry swirl.',
  image: '/images/strawberry-surprise.webp',
  category: 'Fruity',
  sizes: waffleSizes(120),
  tone: 'berry',
}

test('waffleSizes calculates standard size tiers correctly', () => {
  const sizes = waffleSizes(100)
  assert.equal(sizes.length, 3)
  assert.deepEqual(sizes, [
    { name: 'Regular', price: 100 },
    { name: 'Large', price: 140 },
    { name: 'Mini box', price: 170 },
  ])
})

test('formatPrice formats rupees currency with ₹ prefix', () => {
  assert.equal(formatPrice(70), '₹70')
  assert.equal(formatPrice(140), '₹140')
})

test('filterProducts returns all products or filters by category', () => {
  const list = [dummyProduct, dummyFruitProduct]
  assert.equal(filterProducts(list, 'All').length, 2)
  assert.equal(filterProducts(list, 'Chocolate').length, 1)
  assert.equal(filterProducts(list, 'Chocolate')[0].id, 1)
  assert.equal(filterProducts(list, 'Fruity').length, 1)
  assert.equal(filterProducts(list, 'Classics').length, 0)
})

test('searchProducts matches name, description, or category ignoring case', () => {
  const list = [dummyProduct, dummyFruitProduct]
  assert.equal(searchProducts(list, 'white').length, 1)
  assert.equal(searchProducts(list, 'STRAWBERRY').length, 1)
  assert.equal(searchProducts(list, 'chocolate').length, 1)
  assert.equal(searchProducts(list, 'pizza').length, 0)
})

test('addCartItem adds new item or increments existing', () => {
  let cart: CartItem[] = []
  const regularSize = dummyProduct.sizes[0] // price 70
  cart = addCartItem(cart, dummyProduct, regularSize)
  assert.equal(cart.length, 1)
  assert.equal(cart[0].quantity, 1)
  assert.equal(cart[0].key, '1-Regular')

  cart = addCartItem(cart, dummyProduct, regularSize)
  assert.equal(cart.length, 1)
  assert.equal(cart[0].quantity, 2)

  const largeSize = dummyProduct.sizes[1] // price 110
  cart = addCartItem(cart, dummyProduct, largeSize)
  assert.equal(cart.length, 2)
  assert.equal(cart[1].quantity, 1)
})

test('updateCartItemQuantity modifies quantity or removes item on 0', () => {
  const regularSize = dummyProduct.sizes[0]
  let cart: CartItem[] = [{ key: '1-Regular', product: dummyProduct, size: regularSize, quantity: 2 }]

  cart = updateCartItemQuantity(cart, '1-Regular', -1)
  assert.equal(cart.length, 1)
  assert.equal(cart[0].quantity, 1)

  cart = updateCartItemQuantity(cart, '1-Regular', -1)
  assert.equal(cart.length, 0)
})

test('calculateCartSubtotal and count calculate totals accurately', () => {
  const regularSize = dummyProduct.sizes[0] // 70
  const largeFruit = dummyFruitProduct.sizes[1] // 160
  const cart: CartItem[] = [
    { key: '1-Regular', product: dummyProduct, size: regularSize, quantity: 2 },
    { key: '3-Large', product: dummyFruitProduct, size: largeFruit, quantity: 1 },
  ]
  assert.equal(calculateCartCount(cart), 3)
  assert.equal(calculateCartSubtotal(cart), 70 * 2 + 160 * 1) // 300
})

test('calculateAverageRating accurately computes average score', () => {
  const reviews: Review[] = [
    { id: '1', author: 'A', rating: 5, productName: 'Waffle', date: 'now', content: 'Great' },
    { id: '2', author: 'B', rating: 4, productName: 'Gelato', date: 'now', content: 'Good' },
  ]
  assert.equal(calculateAverageRating(reviews), 4.5)
  assert.equal(calculateAverageRating([]), 0)
})

test('filterReviewsByTag filters reviews based on keyword or tag', () => {
  const reviews = [...initialReviews]
  assert.equal(filterReviewsByTag(reviews, 'All').length, reviews.length)
  const biscoff = filterReviewsByTag(reviews, 'Biscoff')
  assert.ok(biscoff.length >= 1)
  assert.ok(biscoff[0].productName.includes('Biscoff') || biscoff[0].tags?.some(t => t.includes('Biscoff')))
})

test('addReview prepends new review with generated id and defaults', () => {
  const initial = [...initialReviews]
  const updated = addReview(initial, {
    author: 'Sneha Rao',
    rating: 5,
    productName: 'Lotus Biscoff',
    content: 'Crispy perfection!',
    location: 'Kandivali',
  })
  assert.equal(updated.length, initial.length + 1)
  assert.equal(updated[0].author, 'Sneha Rao')
  assert.equal(updated[0].rating, 5)
  assert.ok(updated[0].id.startsWith('rev-'))
  assert.equal(updated[0].date, 'Just now')
})



