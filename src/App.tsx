import { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  IceCreamBowl,
  Instagram,
  MapPin,
  Menu as MenuIcon,
  Minus,
  Navigation,
  PenLine,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Star,
  X,
} from 'lucide-react'
import './App.css'

import {
  Category,
  Product,
  CartItem,
  Review,
  waffleSizes,
  formatPrice,
  filterProducts,
  searchProducts,
  calculateCartCount,
  calculateCartSubtotal,
  addCartItem,
  updateCartItemQuantity,
  initialReviews,
  calculateAverageRating,
  filterReviewsByTag,
  addReview,
} from './lib/store-logic'

type Offer = { title: string; subtitle: string; detail: string; label: string }

const products: Product[] = [
  {
    id: 1,
    name: 'Dark & White Delight',
    description: 'Crisp waffle, dark chocolate and silky white drizzle.',
    image: './images/dark-white-delight.webp',
    category: 'Chocolate',
    sizes: waffleSizes(70),
    badge: 'Bestseller',
    tone: 'cocoa',
    featured: true,
  },
  {
    id: 2,
    name: 'Oreo Cookie Delight',
    description: 'Chocolate, cream and a generous Oreo crumble.',
    image: './images/oreo-cookie-delight.webp',
    category: 'Chocolate',
    sizes: waffleSizes(110),
    badge: 'Crowd favourite',
    tone: 'oreo',
  },
  {
    id: 3,
    name: 'Strawberry Surprise',
    description: 'Sweet cream with a bright strawberry swirl.',
    image: './images/strawberry-surprise.webp',
    category: 'Fruity',
    sizes: waffleSizes(120),
    tone: 'berry',
  },
  {
    id: 4,
    name: 'Triple Chocolate',
    description: 'Three layers of deep, decadent chocolate.',
    image: './images/waffle-0022.webp',
    category: 'Chocolate',
    sizes: waffleSizes(90),
    tone: 'caramel',
  },
  {
    id: 5,
    name: 'Lotus Biscoff',
    description: 'Caramelised Biscoff spread and cookie crunch.',
    image: './images/hero-waffle.webp',
    category: 'Classics',
    sizes: waffleSizes(140),
    badge: 'Signature',
    tone: 'biscoff',
  },
  {
    id: 6,
    name: 'Berry Bliss',
    description: 'Dark chocolate, berries and a playful crunch.',
    image: './images/waffle-04.webp',
    category: 'Fruity',
    sizes: waffleSizes(130),
    tone: 'berry',
  },
  {
    id: 7,
    name: 'Rainbow Surprise',
    description: 'A crisp classic finished with colourful sprinkles.',
    image: './images/rainbow-surprise.webp',
    category: 'Classics',
    sizes: waffleSizes(120),
    tone: 'vanilla',
  },
  {
    id: 8,
    name: 'Slow-Churned Gelato',
    description: 'Creamy, slow-churned scoops made for waffle pairing.',
    image: './images/gelato.webp',
    category: 'Classics',
    sizes: [
      { name: 'Single scoop', price: 99 },
      { name: 'Double scoop', price: 149 },
      { name: 'Waffle sundae', price: 189 },
    ],
    tone: 'pistachio',
  },
]

const offers: Offer[] = [
  {
    label: 'Instant offer',
    title: 'Flat 10% off',
    subtitle: 'on dining bill payments',
    detail:
      'Visit the Kandivali West store and ask about the instant dining offer when paying your bill. Final eligibility and availability are confirmed by the store.',
  },
  {
    label: 'A little extra joy',
    title: 'A scratch card',
    subtitle: 'after every eligible transaction',
    detail:
      'Ask the store team about the current scratch-card promotion after your dining transaction. Surprise rewards and eligibility are subject to the live store offer.',
  },
  {
    label: 'Next visit treat',
    title: 'Flat ₹175 off',
    subtitle: 'on your next dining payment',
    detail:
      'This is a next-visit dining offer. Ask the Kandivali West team how to redeem it and whether your visit qualifies before placing your order.',
  },
]

const reviewFilterCategories = [
  { label: 'All Guest Notes', tag: 'All' },
  { label: 'Lotus Biscoff', tag: 'Biscoff' },
  { label: 'Wednesday BOGO', tag: 'Wednesday' },
  { label: 'Family Visits', tag: 'Family' },
  { label: 'Late-Night Cravings', tag: 'Midnight' },
]

export default function App() {
  const [category, setCategory] = useState<'All' | Category>('All')
  const [selectedSizes, setSelectedSizes] = useState<Record<number, number>>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [modalSize, setModalSize] = useState(0)
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null)
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Real Customer Reviews state with v2 storage key so fresh human data with photos loads immediately
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem('conical_gaufres_reviews_v2')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].productImage) {
          return parsed
        }
      }
    } catch {
      // Fallback to initialReviews
    }
    return initialReviews
  })

  // Review Slider & Direction State (1 = slides in from right outside, -1 = slides in from left outside)
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1)
  const [activeReviewFilter, setActiveReviewFilter] = useState('All')

  // Review Modal Form State
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewAuthor, setReviewAuthor] = useState('')
  const [reviewLocation, setReviewLocation] = useState('')
  const [reviewOccasion, setReviewOccasion] = useState('')
  const [reviewTableCaption, setReviewTableCaption] = useState('')
  const [reviewProduct, setReviewProduct] = useState(products[4].name)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewHoverRating, setReviewHoverRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewError, setReviewError] = useState('')

  const avgRating = useMemo(() => calculateAverageRating(reviews), [reviews])

  const filteredReviews = useMemo(
    () => filterReviewsByTag(reviews, activeReviewFilter),
    [reviews, activeReviewFilter],
  )

  const safeReviewIndex = useMemo(() => {
    if (filteredReviews.length === 0) return 0
    return Math.min(activeReviewIndex, filteredReviews.length - 1)
  }, [filteredReviews.length, activeReviewIndex])

  const activeReview = useMemo(() => {
    if (filteredReviews.length === 0) return reviews[0]
    return filteredReviews[safeReviewIndex] || reviews[0]
  }, [filteredReviews, safeReviewIndex, reviews])

  const prevPeekReview = useMemo(() => {
    if (filteredReviews.length <= 1) return null
    const idx = (safeReviewIndex - 1 + filteredReviews.length) % filteredReviews.length
    return filteredReviews[idx]
  }, [filteredReviews, safeReviewIndex])

  const nextPeekReview = useMemo(() => {
    if (filteredReviews.length <= 1) return null
    const idx = (safeReviewIndex + 1) % filteredReviews.length
    return filteredReviews[idx]
  }, [filteredReviews, safeReviewIndex])

  const nextReview = () => {
    if (filteredReviews.length <= 1) return
    setSlideDirection(1)
    setActiveReviewIndex((curr) => (curr + 1) % filteredReviews.length)
  }

  const prevReview = () => {
    if (filteredReviews.length <= 1) return
    setSlideDirection(-1)
    setActiveReviewIndex((curr) => (curr - 1 + filteredReviews.length) % filteredReviews.length)
  }

  const selectReviewSlide = (targetIdx: number) => {
    if (targetIdx === safeReviewIndex) return
    setSlideDirection(targetIdx > safeReviewIndex ? 1 : -1)
    setActiveReviewIndex(targetIdx)
  }

  const filteredProducts = useMemo(
    () => filterProducts(products, category),
    [category],
  )
  const searchResults = useMemo(() => searchProducts(products, query), [query])
  const cartCount = calculateCartCount(cart)
  const subtotal = calculateCartSubtotal(cart)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const shift = reduced ? 0 : Math.min(window.scrollY, 700) * 0.09
      document.documentElement.style.setProperty('--hero-shift', `${shift}px`)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const showNotice = (message: string) => {
    setNotice(message)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 3200)
  }

  const addToCart = (product: Product, sizeIndex: number) => {
    const size = product.sizes[sizeIndex]
    setCart((current) => addCartItem(current, product, size))
    showNotice(`${product.name} · ${size.name} added to your bag`)
  }

  const changeQuantity = (key: string, delta: number) => {
    setCart((current) => updateCartItemQuantity(current, key, delta))
  }

  const previewProduct = (product: Product) => {
    setModalSize(selectedSizes[product.id] ?? 0)
    setActiveProduct(product)
  }

  const previewProductByName = (productName: string) => {
    const found =
      products.find((p) => p.name.toLowerCase() === productName.toLowerCase()) ||
      products.find((p) => productName.toLowerCase().includes(p.name.toLowerCase())) ||
      products[4]
    previewProduct(found)
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewAuthor.trim()) {
      setReviewError('Please enter your name')
      return
    }
    if (!reviewContent.trim() || reviewContent.trim().length < 5) {
      setReviewError('Please share a few words about your waffle experience')
      return
    }

    const updated = addReview(reviews, {
      author: reviewAuthor.trim(),
      location: reviewLocation.trim() || 'Kandivali West, Mumbai',
      occasion: reviewOccasion.trim() || 'Evening Dessert Visit',
      tableCaption:
        reviewTableCaption.trim() ||
        `Freshly baked ${reviewProduct} enjoyed at our Mahavir Nagar table`,
      verifiedType: 'In-Store Guest',
      productName: reviewProduct,
      rating: reviewRating,
      content: reviewContent.trim(),
    })

    setReviews(updated)
    try {
      localStorage.setItem('conical_gaufres_reviews_v2', JSON.stringify(updated))
    } catch {
      // Ignore storage quota errors
    }

    setActiveReviewFilter('All')
    setSlideDirection(-1)
    setActiveReviewIndex(0)
    setReviewModalOpen(false)
    setReviewAuthor('')
    setReviewLocation('')
    setReviewOccasion('')
    setReviewTableCaption('')
    setReviewContent('')
    setReviewError('')
    showNotice(`Thank you, ${reviewAuthor}! Your table note is now on the glass stage.`)
  }

  const closeMobileAndScroll = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      {/* Ambient background light glows */}
      <div className="ambient-background-glow glow-top" aria-hidden="true" />
      <div className="ambient-background-glow glow-center" aria-hidden="true" />
      <div className="ambient-background-glow glow-bottom" aria-hidden="true" />

      <div className="announcement">
        <a href="#wednesday">
          Wednesday just got sweeter — buy one, get one free <ArrowRight size={14} />
        </a>
        <span className="announcement-location">
          <MapPin size={13} /> Kandivali West
        </span>
      </div>

      <header className="site-header glass-dark">
        <a className="wordmark" href="#top" aria-label="Conical Gaufres home">
          <IceCreamBowl size={25} strokeWidth={1.7} />
          <span>
            CONICAL <strong>GAUFRES</strong>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#menu">Menu</a>
          <a href="#offers">Offers</a>
          <a href="#wednesday">Wednesday sale</a>
          <a href="#reviews">Reviews</a>
          <a href="#story">Our story</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Search desserts"
          >
            <Search size={19} />
          </button>
          <a className="location-link" href="#visit">
            <MapPin size={17} />
            <span>Kandivali West</span>
          </a>
          <button
            className="bag-button glow-detailing"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag with ${cartCount} items`}
          >
            <ShoppingBag size={18} />
            <span>Bag</span>
            <b>{cartCount}</b>
          </button>
          <button
            className="icon-button mobile-trigger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </header>

      <main id="main">
        {/* HERO SECTION */}
        <section className="hero" id="top">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, x: -160, filter: 'blur(16px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">Handcrafted happiness · Since 2017</p>
            <h1>
              A little joy.
              <br />
              <em>On a stick.</em>
            </h1>
            <p className="hero-description">
              Crisp golden waffles, slow-churned gelato and unapologetically generous
              chocolate. Made fresh for your sweetest moments.
            </p>
            <div className="hero-actions">
              <a className="button button-primary glow-detailing" href="#menu">
                Order your favourite <ArrowRight size={18} />
              </a>
              <button className="text-link" onClick={() => previewProduct(products[0])}>
                Meet the bestseller <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="hero-proof">
              <span>
                <Star size={16} fill="currentColor" /> <strong>{avgRating}</strong> on Zomato
              </span>
              <span>Pure vegetarian</span>
              <span>Made to order</span>
            </div>
          </motion.div>

          {/* Right side product - Lotus Biscoff waffle in exact position with undulating wave & light glow */}
          <div className="hero-visual" aria-label="Lotus Biscoff signature stick waffle">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-light-halo" aria-hidden="true" />
            <span className="hero-word" aria-hidden="true">
              GAUFRES
            </span>
            <div className="hero-product-wave-wrap">
              <img
                className="hero-product hero-product-animated"
                src="./images/hero-waffle.webp"
                alt="Signature Conical Gaufres stick waffle with caramel and chocolate"
              />
              <div className="product-light-sheen" aria-hidden="true" />
            </div>
            <div className="floating-note floating-note-top glass-dark glow-edge">
              <span>Signature crunch</span>
              <strong>Lotus Biscoff</strong>
              <small>Caramel · cookie · chocolate</small>
            </div>
            <div className="floating-note floating-note-bottom glass-dark glow-edge">
              <span className="rating-dot">
                <Star size={14} fill="currentColor" />
              </span>
              <div>
                <strong>Loved in Mumbai</strong>
                <small>1,300+ delivery ratings</small>
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#menu">
            <span>Discover the menu</span>
            <ChevronDown size={17} />
          </a>
        </section>

        <div className="flavour-ribbon" aria-label="Store highlights">
          <span>STICK WAFFLES</span>
          <i />
          <span>SLOW-CHURNED GELATO</span>
          <i />
          <span>THICK SHAKES</span>
          <i />
          <span>MINI WAFFLES</span>
          <i />
          <span>FRESHLY MADE</span>
        </div>

        {/* PRODUCTS MENU SECTION — APPLE OUTSIDE-TO-INSIDE SLIDE MOTION WITH LIGHT & MOTION BLUR */}
        <section className="products-section apple-scroll-stage" id="menu">
          <div className="section-heading light-heading">
            <motion.div
              initial={{ opacity: 0, x: -220, filter: 'blur(18px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow">The dessert edit</p>
              <h2>
                Pick your
                <br />
                <em>happy place.</em>
              </h2>
            </motion.div>
            <motion.div
              className="menu-intro"
              initial={{ opacity: 0, x: 220, filter: 'blur(18px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
            >
              <p>
                From chocolate-heavy classics to bright berry creations, every waffle is
                made fresh and finished by hand.
              </p>
              <div className="filter-row" aria-label="Filter desserts by flavour">
                {(['All', 'Chocolate', 'Fruity', 'Classics'] as const).map((item) => (
                  <button
                    key={item}
                    className={category === item ? 'filter active glow-pill' : 'filter'}
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product, index) => {
              const selected = Math.min(
                selectedSizes[product.id] ?? 0,
                product.sizes.length - 1,
              )
              // Alternating left-side-to-inside and right-side-to-inside slide entrance
              const fromLeft = index % 2 === 0
              return (
                <motion.article
                  className={`product-card glass-light glow-card apple-slide-card ${
                    product.featured && category === 'All' ? 'featured' : ''
                  } ${product.id === 8 ? 'gelato-card' : ''}`}
                  key={product.id}
                  initial={{
                    opacity: 0,
                    x: fromLeft ? -240 : 240,
                    scale: 0.92,
                    rotate: fromLeft ? -2 : 2,
                    filter: 'blur(18px) brightness(1.18)',
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    rotate: 0,
                    filter: 'blur(0px) brightness(1)',
                  }}
                  viewport={{ once: false, amount: 0.14, margin: '-20px 0px -20px 0px' }}
                  transition={{
                    duration: 0.82,
                    ease: [0.16, 1, 0.3, 1],
                    delay: (index % 2) * 0.08,
                  }}
                >
                  {/* Animated light sweep flare when sliding in */}
                  <div
                    className={`slide-light-flare ${fromLeft ? 'flare-from-left' : 'flare-from-right'}`}
                    aria-hidden="true"
                  />
                  <div className={`product-image-wrap ${product.tone}`}>
                    {product.badge && (
                      <span className="product-badge glow-badge">{product.badge}</span>
                    )}
                    <button
                      className="product-preview"
                      onClick={() => previewProduct(product)}
                      aria-label={`View ${product.name} details`}
                    >
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </button>
                    <button
                      className="quick-view glow-button"
                      onClick={() => previewProduct(product)}
                      aria-label={`Quick view ${product.name}`}
                    >
                      <ArrowUpRight size={19} />
                    </button>
                  </div>
                  <div className="product-info">
                    <button
                      className="product-name"
                      onClick={() => previewProduct(product)}
                    >
                      {product.name}
                    </button>
                    <p>{product.description}</p>
                    <div className="size-label">
                      <span>Choose a size</span>
                      <span>{product.sizes[selected].name}</span>
                    </div>
                    <div
                      className="size-options"
                      aria-label={`Sizes for ${product.name}`}
                    >
                      {product.sizes.map((size, sIdx) => (
                        <button
                          key={size.name}
                          className={selected === sIdx ? 'selected' : ''}
                          onClick={() =>
                            setSelectedSizes((current) => ({
                              ...current,
                              [product.id]: sIdx,
                            }))
                          }
                          aria-pressed={selected === sIdx}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                    <div className="product-bottom">
                      <strong>{formatPrice(product.sizes[selected].price)}</strong>
                      <button
                        className="add-button glow-detailing"
                        onClick={() => addToCart(product, selected)}
                      >
                        Add to bag <Plus size={17} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        {/* OFFERS SECTION — OUTSIDE-TO-INSIDE SLIDE WITH LIGHT GLOW & MOTION BLUR */}
        <section className="offers-section apple-scroll-stage" id="offers">
          <div className="section-heading dark-heading compact-heading">
            <motion.div
              initial={{ opacity: 0, x: -220, filter: 'blur(18px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow">A sweeter bill</p>
              <h2>
                Offers worth
                <br />
                <em>stepping out for.</em>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 220, filter: 'blur(18px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            >
              Dining perks for your next visit to Mahavir Nagar. Tap an offer to see
              exactly how to redeem it.
            </motion.p>
          </div>

          <div className="offer-grid">
            {offers.map((offer, index) => {
              const slideX = index === 0 ? -260 : index === 2 ? 260 : 180
              return (
                <motion.article
                  className={`offer-card glass-dark glow-offer-card offer-${index + 1}`}
                  key={offer.title}
                  initial={{
                    opacity: 0,
                    x: slideX,
                    scale: 0.92,
                    filter: 'blur(18px) brightness(1.3)',
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter: 'blur(0px) brightness(1)',
                  }}
                  viewport={{ once: false, amount: 0.18 }}
                  transition={{
                    duration: 0.82,
                    ease: [0.16, 1, 0.3, 1],
                    delay: index * 0.1,
                  }}
                >
                  <div className="offer-glow-beam" aria-hidden="true" />
                  <div
                    className={`slide-light-flare ${index === 0 ? 'flare-from-left' : 'flare-from-right'}`}
                    aria-hidden="true"
                  />
                  <span className="offer-label">{offer.label}</span>
                  <div>
                    <h3>{offer.title}</h3>
                    <p>{offer.subtitle}</p>
                  </div>
                  <button
                    className="offer-link glow-text-link"
                    onClick={() => setActiveOffer(offer)}
                  >
                    How to redeem <ArrowUpRight size={18} />
                  </button>
                </motion.article>
              )
            })}
          </div>
          <p className="offer-note">
            Offers are subject to store availability and eligibility. Confirm with the
            team before ordering.
          </p>
        </section>

        {/* WEDNESDAY BOGO BANNER — LEFT SLIDES FROM LEFT OUTSIDE, RIGHT SLIDES FROM RIGHT OUTSIDE WITH MOTION BLUR & LIGHT */}
        <section className="wednesday-section apple-banner" id="wednesday">
          <div className="ambient-banner-glow wednesday-ambient-glow" aria-hidden="true" />
          <motion.div
            className="wednesday-copy banner-slide-panel"
            initial={{
              opacity: 0,
              x: -300,
              scale: 0.94,
              filter: 'blur(20px) brightness(1.28)',
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: 'blur(0px) brightness(1)',
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="slide-light-flare flare-from-left" aria-hidden="true" />
            <p className="eyebrow">Every Wednesday · In store</p>
            <h2>
              One for you.
              <br />
              <em>One on us.</em>
            </h2>
            <p>
              Make midweek the best day of the week. Buy one waffle and get another free
              at Conical Gaufres every Wednesday.
            </p>
            <a className="button button-cream glow-detailing" href="#menu">
              Choose your two <ArrowRight size={18} />
            </a>
            <small>
              Visit the store to confirm eligible waffles and offer availability.
            </small>
          </motion.div>

          <motion.div
            className="wednesday-visual banner-slide-panel"
            aria-hidden="true"
            initial={{
              opacity: 0,
              x: 300,
              scale: 0.94,
              filter: 'blur(20px) brightness(1.28)',
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: 'blur(0px) brightness(1)',
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <div className="slide-light-flare flare-from-right" aria-hidden="true" />
            <div className="bogo-light-spot spot-strawberry" />
            <div className="bogo-light-spot spot-cocoa" />
            <span className="bogo-type">
              2<span>for</span>1
            </span>
            {/* Movable floating Strawberry Surprise waffle */}
            <img
              className="bogo-waffle bogo-one bogo-one-animated"
              src="./images/strawberry-surprise.webp"
              alt="Strawberry Surprise waffle"
              loading="lazy"
            />
            {/* Movable floating Dark & White Delight waffle */}
            <img
              className="bogo-waffle bogo-two bogo-two-animated"
              src="./images/dark-white-delight.webp"
              alt="Dark and White Delight waffle"
              loading="lazy"
            />
            <div className="bogo-stamp glow-stamp">
              <span>WEDNESDAY</span>
              <strong>BOGO</strong>
              <span>ALL DAY</span>
            </div>
          </motion.div>
        </section>

        {/* STORY BANNER — LEFT PHOTO SLIDES FROM LEFT OUTSIDE WITH WAVE MOTION, RIGHT COPY SLIDES FROM RIGHT OUTSIDE */}
        <section className="story-section apple-banner" id="story">
          <div className="ambient-banner-glow story-ambient-glow" aria-hidden="true" />
          <motion.div
            className="story-image banner-slide-panel"
            initial={{
              opacity: 0,
              x: -300,
              scale: 0.94,
              filter: 'blur(20px) brightness(1.25)',
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: 'blur(0px) brightness(1)',
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="slide-light-flare flare-from-left" aria-hidden="true" />
            <div className="story-waffle-wave-wrap">
              <img
                className="story-waffle-animated"
                src="./images/story-waffle.webp"
                alt="Freshly prepared chocolate waffle with chocolate pieces"
                loading="lazy"
              />
              <div className="story-light-gleam" aria-hidden="true" />
            </div>
            <div className="story-caption glass-dark glow-edge">
              <span>Our secret ingredient?</span>
              <strong>Pure joy.</strong>
            </div>
          </motion.div>

          <motion.div
            className="story-copy banner-slide-panel"
            initial={{
              opacity: 0,
              x: 300,
              scale: 0.94,
              filter: 'blur(20px) brightness(1.25)',
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: 'blur(0px) brightness(1)',
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <div className="slide-light-flare flare-from-right" aria-hidden="true" />
            <p className="eyebrow">From a cart to a craving</p>
            <h2>
              Made with love.
              <br />
              <em>Remembered with a smile.</em>
            </h2>
            <p>
              On 15 August 2017, founders Sameer and Kshama Dave introduced their
              signature stick waffles from a single cart. That small dream grew into a
              pan-India dessert family.
            </p>
            <blockquote>
              “We turn the flavours you already love into something wonderfully new.”
            </blockquote>
            <div className="story-stats">
              <div className="glow-stat">
                <strong>120+</strong>
                <span>outlets across India</span>
              </div>
              <div className="glow-stat">
                <strong>2017</strong>
                <span>our first sweet chapter</span>
              </div>
              <div className="glow-stat">
                <strong>100%</strong>
                <span>vegetarian kitchen</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* COMPLETELY REDESIGNED PREMIUM LIGHT FROSTED GLASS REVIEW SLIDE SECTION — HUMAN TOUCH & TRUST */}
        <section className="reviews-light-glass-section" id="reviews">
          {/* Warm Sunlit Bokeh & Light Orbs Behind the Frosted Glass */}
          <div className="sunlit-glass-orb orb-warm-gold" aria-hidden="true" />
          <div className="sunlit-glass-orb orb-soft-berry" aria-hidden="true" />
          <div className="sunlit-glass-orb orb-pearl-light" aria-hidden="true" />

          <div className="reviews-light-container">
            {/* Editorial Header with Outside-to-Inside Scroll Motion */}
            <div className="reviews-light-header">
              <motion.div
                className="reviews-light-title-col"
                initial={{ opacity: 0, x: -240, filter: 'blur(18px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="eyebrow">
                  Mahavir Nagar Table Journal · {avgRating} ★ from 1,300+ patrons
                </p>
                <h2>
                  Real neighbors.
                  <br />
                  <em>Unscripted sweet moments.</em>
                </h2>
              </motion.div>

              <motion.div
                className="reviews-light-intro-col"
                initial={{ opacity: 0, x: 240, filter: 'blur(18px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              >
                <p>
                  Every note below was left by a family, couple, or late-night regular
                  who stopped by Shop 28 in Kandivali West. Have a favourite stick
                  waffle? Add your own table note to our guestbook.
                </p>
                <div className="reviews-light-header-actions">
                  <button
                    className="button light-frosted-cta-btn glow-detailing"
                    onClick={() => setReviewModalOpen(true)}
                  >
                    <PenLine size={16} /> Write a table note
                  </button>
                  <div className="reviews-filter-tabs" role="tablist" aria-label="Filter guest stories">
                    {reviewFilterCategories.map((c) => (
                      <button
                        key={c.tag}
                        role="tab"
                        aria-selected={activeReviewFilter === c.tag}
                        className={`light-glass-tab ${
                          activeReviewFilter === c.tag ? 'active' : ''
                        }`}
                        onClick={() => {
                          setSlideDirection(1)
                          setActiveReviewFilter(c.tag)
                          setActiveReviewIndex(0)
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* OUTSIDE-TO-INSIDE LIGHT FROSTED GLASS SLIDE STAGE WITH PEEK CARDS & LIGHT MOTION BLUR */}
            <motion.div
              className="light-glass-carousel-stage"
              initial={{
                opacity: 0,
                x: 260,
                scale: 0.94,
                filter: 'blur(20px) brightness(1.18)',
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: 'blur(0px) brightness(1)',
              }}
              viewport={{ once: false, amount: 0.18 }}
              transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Left Peek-From-Outside Frosted Glass Slide */}
              {prevPeekReview && (
                <button
                  type="button"
                  className="light-glass-peek-card peek-left"
                  onClick={prevReview}
                  aria-label={`Previous review by ${prevPeekReview.author}`}
                >
                  <img
                    src={prevPeekReview.productImage || './images/hero-waffle.webp'}
                    alt=""
                  />
                  <span>{prevPeekReview.author}</span>
                </button>
              )}

              {/* Centerpiece Active Light Frosted Glass Slide */}
              <div className="light-glass-active-viewport">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.article
                    key={activeReview.id}
                    custom={slideDirection}
                    className="light-glass-slide-card"
                    initial={{
                      opacity: 0,
                      x: slideDirection > 0 ? 320 : -320,
                      scale: 0.93,
                      filter: 'blur(22px) brightness(1.22)',
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      filter: 'blur(0px) brightness(1)',
                    }}
                    exit={{
                      opacity: 0,
                      x: slideDirection > 0 ? -320 : 320,
                      scale: 0.93,
                      filter: 'blur(22px) brightness(1.22)',
                    }}
                    transition={{
                      duration: 0.68,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* Sweeping sunlit glass reflection beam */}
                    <div
                      className={`light-glass-shimmer-beam ${
                        slideDirection > 0 ? 'beam-from-right' : 'beam-from-left'
                      }`}
                      aria-hidden="true"
                    />

                    {/* LEFT COLUMN: Real Tactile Table Polaroid Photo & Receipt Stamp */}
                    <div className="glass-slide-photo-col">
                      <div className="table-polaroid-frame">
                        <div className="polaroid-tape" aria-hidden="true" />
                        <div className="polaroid-image-box">
                          <img
                            src={activeReview.productImage || './images/hero-waffle.webp'}
                            alt={activeReview.productName}
                          />
                        </div>
                        <div className="polaroid-handwritten-caption">
                          <p>“{activeReview.tableCaption || `Freshly baked ${activeReview.productName}`}”</p>
                          <span>{activeReview.receiptCode || 'TABLE NOTE · KANDIVALI WEST'}</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Genuine Human Story, Handwritten Signature & Direct Order Link */}
                    <div className="glass-slide-story-col">
                      <div className="glass-slide-top-meta">
                        <div className="glass-star-cluster" aria-label={`${activeReview.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < activeReview.rating ? '#d97706' : 'none'}
                              color={i < activeReview.rating ? '#d97706' : '#d6c7b8'}
                            />
                          ))}
                          <strong>{activeReview.rating}.0</strong>
                        </div>
                        <span className="meta-dot" aria-hidden="true">·</span>
                        <span>{activeReview.verifiedType || 'In-Store Guest'}</span>
                        <span className="meta-dot" aria-hidden="true">·</span>
                        <span>{activeReview.location || 'Kandivali West'}</span>
                        <span className="meta-dot" aria-hidden="true">·</span>
                        <span>{activeReview.date}</span>
                      </div>

                      <blockquote className="glass-slide-human-quote">
                        “{activeReview.content}”
                      </blockquote>

                      <div className="glass-slide-signature-bar">
                        <div className="patron-signature-block">
                          <span className="handwritten-signature">
                            — {activeReview.author}
                          </span>
                          <p className="patron-bio-line">
                            {activeReview.customerBio ||
                              `${activeReview.occasion || 'Evening Visit'} · ${
                                activeReview.location || 'Kandivali West'
                              }`}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="ordered-waffle-glass-link glow-detailing"
                          onClick={() => previewProductByName(activeReview.productName)}
                        >
                          <img
                            src={activeReview.productImage || './images/hero-waffle.webp'}
                            alt=""
                          />
                          <div>
                            <small>Ordered at the store</small>
                            <strong>{activeReview.productName}</strong>
                          </div>
                          <ArrowUpRight size={17} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>

              {/* Right Peek-From-Outside Frosted Glass Slide */}
              {nextPeekReview && (
                <button
                  type="button"
                  className="light-glass-peek-card peek-right"
                  onClick={nextReview}
                  aria-label={`Next review by ${nextPeekReview.author}`}
                >
                  <img
                    src={nextPeekReview.productImage || './images/hero-waffle.webp'}
                    alt=""
                  />
                  <span>{nextPeekReview.author}</span>
                </button>
              )}
            </motion.div>

            {/* Glass Carousel Navigation Bar */}
            <div className="light-glass-controls-bar">
              <div className="light-glass-progress-dots">
                {filteredReviews.map((r, idx) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`light-glass-dot ${safeReviewIndex === idx ? 'active' : ''}`}
                    onClick={() => selectReviewSlide(idx)}
                    aria-label={`View story from ${r.author}`}
                  />
                ))}
              </div>

              <div className="light-glass-arrows">
                <span className="light-slide-count">
                  Slide <strong>{safeReviewIndex + 1}</strong> of {filteredReviews.length}
                </span>
                <button
                  type="button"
                  className="light-glass-arrow-btn prev-btn"
                  onClick={prevReview}
                  aria-label="Slide previous story from left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="light-glass-arrow-btn next-btn"
                  onClick={nextReview}
                  aria-label="Slide next story from right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Secondary Row of Light Frosted Glass Patron Cards — Sliding in from Left & Right */}
            <div className="light-glass-notes-grid">
              {reviews.map((r, idx) => {
                const isCurrent = activeReview.id === r.id
                const fromLeft = idx % 2 === 0
                return (
                  <motion.button
                    type="button"
                    key={r.id}
                    className={`light-glass-mini-card ${isCurrent ? 'active-mini-card' : ''}`}
                    initial={{
                      opacity: 0,
                      x: fromLeft ? -200 : 200,
                      filter: 'blur(16px) brightness(1.15)',
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      filter: 'blur(0px) brightness(1)',
                    }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{
                      duration: 0.75,
                      ease: [0.16, 1, 0.3, 1],
                      delay: (idx % 3) * 0.07,
                    }}
                    onClick={() => {
                      const targetIndex = filteredReviews.findIndex((fr) => fr.id === r.id)
                      if (targetIndex >= 0) {
                        selectReviewSlide(targetIndex)
                      } else {
                        setActiveReviewFilter('All')
                        setSlideDirection(1)
                        setActiveReviewIndex(idx)
                      }
                    }}
                  >
                    <div className="mini-card-photo-row">
                      <img src={r.productImage || './images/hero-waffle.webp'} alt="" />
                      <div className="mini-card-author">
                        <strong>{r.author}</strong>
                        <span>
                          {r.location} · {r.date}
                        </span>
                      </div>
                      <span className="mini-card-rating">{r.rating}.0 ★</span>
                    </div>
                    <p className="mini-card-quote">“{r.content.slice(0, 110)}…”</p>
                    <div className="mini-card-footer">
                      <span>Ordered {r.productName}</span>
                      <span>Read full note →</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </section>

        {/* VISIT SECTION — LEFT & RIGHT OUTSIDE SLIDE-IN */}
        <section className="visit-section apple-scroll-stage" id="visit">
          <motion.div
            className="visit-heading"
            initial={{ opacity: 0, x: -240, filter: 'blur(18px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">Your neighbourhood dessert stop</p>
            <h2>
              Come by.
              <br />
              <em>Leave happier.</em>
            </h2>
          </motion.div>
          <motion.div
            className="visit-card glass-light glow-card"
            initial={{ opacity: 0, x: 240, filter: 'blur(18px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <div className="slide-light-flare flare-from-right" aria-hidden="true" />
            <div className="visit-detail">
              <MapPin size={22} />
              <div>
                <span>Find us</span>
                <strong>
                  Shop 28, Raj Arcade, Khau Gali,
                  <br />
                  Mahavir Nagar, Kandivali West, Mumbai
                </strong>
              </div>
            </div>
            <div className="visit-detail">
              <Clock3 size={22} />
              <div>
                <span>Store hours</span>
                <strong>
                  12:30 pm – 12 midnight
                  <br />
                  <small>Late-night service: 12 midnight – 12:30 am</small>
                </strong>
              </div>
            </div>
            <div className="visit-actions">
              <a
                className="button button-dark glow-detailing"
                href="https://www.google.com/maps/search/?api=1&query=Conical+Gaufres+Kandivali+West+Mumbai"
                target="_blank"
                rel="noreferrer"
              >
                Get directions <Navigation size={17} />
              </a>
              <a className="text-link dark-link" href="tel:+919833087392">
                <Phone size={17} /> Call the store
              </a>
            </div>
          </motion.div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq-section" aria-labelledby="faq-title">
          <motion.div
            initial={{ opacity: 0, x: -200, filter: 'blur(16px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">Good to know</p>
            <h2 id="faq-title">
              Before your
              <br />
              <em>first bite.</em>
            </h2>
          </motion.div>
          <motion.div
            className="faq-list"
            initial={{ opacity: 0, x: 200, filter: 'blur(16px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <details>
              <summary>
                Is Conical Gaufres vegetarian?
                <Plus size={18} />
              </summary>
              <p>
                Yes. The Kandivali West store is vegetarian only, with waffles, gelato,
                shakes and other desserts on the menu.
              </p>
            </details>
            <details>
              <summary>
                Can I order takeaway or delivery?
                <Plus size={18} />
              </summary>
              <p>
                Yes. Takeaway and home delivery are available. Use the order links below
                to check live availability and delivery times.
              </p>
            </details>
            <details>
              <summary>
                How does the Wednesday BOGO work?
                <Plus size={18} />
              </summary>
              <p>
                The store advertises buy one, get one free every Wednesday. Eligible
                products and live offer availability should be confirmed with the store
                team.
              </p>
            </details>
            <details>
              <summary>
                Can I choose different serving sizes?
                <Plus size={18} />
              </summary>
              <p>
                Use the size selector on any dessert above to preview regular, large and
                mini-box options. Final menu options and prices are confirmed when you
                order.
              </p>
            </details>
          </motion.div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="wordmark footer-logo" href="#top">
            <IceCreamBowl size={29} />
            <span>
              CONICAL <strong>GAUFRES</strong>
            </span>
          </a>
          <p>Waffles, gelato, shakes and everything else your sweet tooth craves.</p>
          <a
            className="button button-primary glow-detailing"
            href="https://www.zomato.com/mumbai/conical-gaufres-kandivali-west"
            target="_blank"
            rel="noreferrer"
          >
            Order online <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="footer-links">
          <div>
            <span>Explore</span>
            <a href="#menu">Dessert menu</a>
            <a href="#offers">Store offers</a>
            <a href="#wednesday">Wednesday sale</a>
            <a href="#reviews">Reviews</a>
          </div>
          <div>
            <span>Visit</span>
            <a href="#visit">Kandivali West</a>
            <a href="#story">Our story</a>
            <a href="tel:+919833087392">+91 98330 87392</a>
          </div>
          <div>
            <span>Order & follow</span>
            <a
              href="https://www.zomato.com/mumbai/conical-gaufres-kandivali-west"
              target="_blank"
              rel="noreferrer"
            >
              Zomato
            </a>
            <a
              href="https://www.swiggy.com/city/mumbai/conical-gaufres-mahavir-nagar-kandivali-west-rest500608"
              target="_blank"
              rel="noreferrer"
            >
              Swiggy
            </a>
            <a
              href="https://www.instagram.com/conicalgaufresofficial/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={15} /> Instagram
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Conical Gaufres. Crafted for sweet moments.</span>
          <span>Premium dessert storefront concept · Kandivali West</span>
        </div>
      </footer>

      {/* SEARCH MODAL */}
      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="search-dialog glass-dark" aria-describedby={undefined}>
            <Dialog.Title className="sr-only">Search desserts</Dialog.Title>
            <div className="search-input-wrap">
              <Search size={22} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search chocolate, strawberry, gelato…"
                aria-label="Search desserts"
              />
            </div>
            <Dialog.Close className="dialog-close" aria-label="Close search">
              <X size={20} />
            </Dialog.Close>
            <div className="search-results">
              <span className="search-label">
                {query ? `${searchResults.length} matching desserts` : 'Popular right now'}
              </span>
              {searchResults.length ? (
                searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSearchOpen(false)
                      previewProduct(product)
                    }}
                  >
                    <img src={product.image} alt="" />
                    <span>
                      <strong>{product.name}</strong>
                      <small>
                        {product.category} · from {formatPrice(product.sizes[0].price)}
                      </small>
                    </span>
                    <ArrowUpRight size={18} />
                  </button>
                ))
              ) : (
                <div className="empty-search">
                  <IceCreamBowl size={28} />
                  <strong>No desserts found</strong>
                  <p>Try “chocolate”, “berry” or “gelato”.</p>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* MOBILE MENU MODAL */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="mobile-menu glass-dark" aria-describedby={undefined}>
            <Dialog.Title>Where to?</Dialog.Title>
            <Dialog.Close className="dialog-close" aria-label="Close menu">
              <X size={22} />
            </Dialog.Close>
            <nav>
              <a onClick={closeMobileAndScroll} href="#menu">
                Dessert menu <ArrowRight size={19} />
              </a>
              <a onClick={closeMobileAndScroll} href="#offers">
                Store offers <ArrowRight size={19} />
              </a>
              <a onClick={closeMobileAndScroll} href="#wednesday">
                Wednesday sale <ArrowRight size={19} />
              </a>
              <a onClick={closeMobileAndScroll} href="#reviews">
                Reviews <ArrowRight size={19} />
              </a>
              <a onClick={closeMobileAndScroll} href="#story">
                Our story <ArrowRight size={19} />
              </a>
              <a onClick={closeMobileAndScroll} href="#visit">
                Visit the store <ArrowRight size={19} />
              </a>
            </nav>
            <p>Pure vegetarian · Made fresh · Kandivali West</p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* PRODUCT QUICK VIEW MODAL */}
      <Dialog.Root
        open={!!activeProduct}
        onOpenChange={(open) => {
          if (!open) setActiveProduct(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          {activeProduct && (
            <Dialog.Content
              className="product-dialog glass-light"
              aria-describedby="product-dialog-description"
            >
              <Dialog.Close
                className="dialog-close light-close"
                aria-label="Close product details"
              >
                <X size={20} />
              </Dialog.Close>
              <div className={`dialog-product-image ${activeProduct.tone}`}>
                <img src={activeProduct.image} alt={activeProduct.name} />
              </div>
              <div className="dialog-product-copy">
                <p className="eyebrow">{activeProduct.category} · Made fresh</p>
                <Dialog.Title>{activeProduct.name}</Dialog.Title>
                <p id="product-dialog-description">
                  {activeProduct.description} Choose your preferred serving, then add it
                  to your bag.
                </p>
                <span className="dialog-label">Size</span>
                <div className="dialog-sizes">
                  {activeProduct.sizes.map((size, index) => (
                    <button
                      className={modalSize === index ? 'selected' : ''}
                      key={size.name}
                      onClick={() => setModalSize(index)}
                      aria-pressed={modalSize === index}
                    >
                      <span>{size.name}</span>
                      <strong>{formatPrice(size.price)}</strong>
                    </button>
                  ))}
                </div>
                <button
                  className="button button-dark glow-detailing dialog-add"
                  onClick={() => {
                    addToCart(activeProduct, modalSize)
                    setActiveProduct(null)
                    setCartOpen(true)
                  }}
                >
                  Add to bag · {formatPrice(activeProduct.sizes[modalSize].price)}{' '}
                  <ShoppingBag size={18} />
                </button>
                <small className="price-disclaimer">
                  Preview prices. Final availability and pricing are confirmed when
                  ordering.
                </small>
              </div>
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>

      {/* OFFER REDEEM MODAL */}
      <Dialog.Root
        open={!!activeOffer}
        onOpenChange={(open) => {
          if (!open) setActiveOffer(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          {activeOffer && (
            <Dialog.Content
              className="offer-dialog glass-dark glow-offer-modal"
              aria-describedby="offer-description"
            >
              <Dialog.Close className="dialog-close" aria-label="Close offer">
                <X size={20} />
              </Dialog.Close>
              <span className="offer-label">{activeOffer.label}</span>
              <Dialog.Title>{activeOffer.title}</Dialog.Title>
              <h3>{activeOffer.subtitle}</h3>
              <p id="offer-description">{activeOffer.detail}</p>
              <a
                className="button button-cream glow-detailing"
                href="https://www.google.com/maps/search/?api=1&query=Conical+Gaufres+Kandivali+West+Mumbai"
                target="_blank"
                rel="noreferrer"
              >
                Visit & redeem <Navigation size={17} />
              </a>
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>

      {/* BAG DRAWER */}
      <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="cart-drawer glass-light"
            aria-describedby="cart-description"
          >
            <div className="cart-head">
              <div>
                <span>Your sweet picks</span>
                <Dialog.Title>
                  Your bag <b>{cartCount}</b>
                </Dialog.Title>
              </div>
              <Dialog.Close className="dialog-close light-close" aria-label="Close bag">
                <X size={20} />
              </Dialog.Close>
            </div>
            <p id="cart-description" className="sr-only">
              Review your selected desserts and continue to an ordering platform.
            </p>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={34} strokeWidth={1.4} />
                <h3>Your bag is craving something.</h3>
                <p>Pick a waffle, choose a size and make it yours.</p>
                <Dialog.Close asChild>
                  <a className="button button-dark glow-detailing" href="#menu">
                    Browse the menu <ArrowRight size={17} />
                  </a>
                </Dialog.Close>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.key}>
                      <div className={`cart-thumb ${item.product.tone}`}>
                        <img src={item.product.image} alt="" />
                      </div>
                      <div className="cart-item-copy">
                        <strong>{item.product.name}</strong>
                        <span>
                          {item.size.name} · {formatPrice(item.size.price)}
                        </span>
                        <div className="quantity-control">
                          <button
                            onClick={() => changeQuantity(item.key, -1)}
                            aria-label={`Remove one ${item.product.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item.key, 1)}
                            aria-label={`Add one more ${item.product.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <strong>{formatPrice(item.size.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <p>
                    Taxes and delivery charges are calculated on the ordering platform.
                  </p>
                  <button
                    className="button button-dark glow-detailing"
                    onClick={() => {
                      setCartOpen(false)
                      setOrderOpen(true)
                    }}
                  >
                    Continue to order <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ORDER DELIVERY MODAL */}
      <Dialog.Root open={orderOpen} onOpenChange={setOrderOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="order-dialog glass-light"
            aria-describedby="order-description"
          >
            <Dialog.Close
              className="dialog-close light-close"
              aria-label="Close order options"
            >
              <X size={20} />
            </Dialog.Close>
            <Check className="order-check" size={29} />
            <Dialog.Title>Your sweet picks are ready.</Dialog.Title>
            <p id="order-description">
              Continue on a delivery platform to confirm live menu prices, availability
              and delivery details. Your preview bag will not transfer automatically.
            </p>
            <a
              className="button button-dark glow-detailing"
              href="https://www.zomato.com/mumbai/conical-gaufres-kandivali-west"
              target="_blank"
              rel="noreferrer"
            >
              Order on Zomato <ArrowUpRight size={18} />
            </a>
            <a
              className="button button-outline-dark"
              href="https://www.swiggy.com/city/mumbai/conical-gaufres-mahavir-nagar-kandivali-west-rest500608"
              target="_blank"
              rel="noreferrer"
            >
              Order on Swiggy <ArrowUpRight size={18} />
            </a>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* LIGHT FROSTED GLASS GUESTBOOK MODAL */}
      <Dialog.Root open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="review-dialog light-frosted-guestbook-modal"
            aria-describedby="review-dialog-description"
          >
            <Dialog.Close
              className="dialog-close light-close"
              aria-label="Close guestbook"
            >
              <X size={20} />
            </Dialog.Close>

            <div className="review-dialog-header light-modal-header">
              <span className="eyebrow">Mahavir Nagar Table Journal</span>
              <Dialog.Title>Write a Table Note</Dialog.Title>
              <p id="review-dialog-description">
                Share which stick waffle or gelato you tried and add your story to our
                storefront guestbook.
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="review-form light-review-form">
              {reviewError && (
                <div className="review-error-banner" role="alert">
                  {reviewError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Your rating</label>
                <div
                  className="star-rating-selector"
                  role="radiogroup"
                  aria-label="Rating out of 5 stars"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="star-rate-btn"
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={28}
                        fill={(reviewHoverRating || reviewRating) >= star ? '#d97706' : 'none'}
                        color={
                          (reviewHoverRating || reviewRating) >= star ? '#d97706' : '#cbb8a8'
                        }
                        className="interactive-star"
                      />
                    </button>
                  ))}
                  <span className="rating-text-hint">
                    {reviewRating === 5 && 'Unforgettable! (5/5)'}
                    {reviewRating === 4 && 'Loved every bite (4/5)'}
                    {reviewRating === 3 && 'Good treat (3/5)'}
                    {reviewRating === 2 && 'Could be better (2/5)'}
                    {reviewRating === 1 && 'Not for me (1/5)'}
                  </span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="review-product" className="form-label">
                    Which dessert did you order?
                  </label>
                  <select
                    id="review-product"
                    value={reviewProduct}
                    onChange={(e) => setReviewProduct(e.target.value)}
                    className="form-select light-input"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="review-name" className="form-label">
                    Your Name / Family *
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Rohan & Priya Desai"
                    className="form-input light-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="review-location" className="form-label">
                    Neighbourhood
                  </label>
                  <input
                    id="review-location"
                    type="text"
                    value={reviewLocation}
                    onChange={(e) => setReviewLocation(e.target.value)}
                    placeholder="e.g. Mahavir Nagar, Kandivali"
                    className="form-input light-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="review-occasion" className="form-label">
                    Occasion
                  </label>
                  <input
                    id="review-occasion"
                    type="text"
                    value={reviewOccasion}
                    onChange={(e) => setReviewOccasion(e.target.value)}
                    placeholder="e.g. Post-dinner walk, Wednesday BOGO"
                    className="form-input light-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review-caption" className="form-label">
                  Short Polaroid Caption (optional)
                </label>
                <input
                  id="review-caption"
                  type="text"
                  value={reviewTableCaption}
                  onChange={(e) => setReviewTableCaption(e.target.value)}
                  placeholder="e.g. Piping hot off the waffle iron at 11 PM!"
                  className="form-input light-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="review-content" className="form-label">
                  Your Table Note *
                </label>
                <textarea
                  id="review-content"
                  required
                  rows={3}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Tell neighbors how the waffle tasted, what you loved about the crunch or chocolate…"
                  className="form-textarea light-input"
                />
              </div>

              <div className="review-form-actions">
                <button
                  type="button"
                  className="button button-outline-dark"
                  onClick={() => setReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-dark glow-detailing">
                  Pin to Guestbook <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* FLOATING TOAST NOTIFICATION */}
      <div
        className={`toast glass-dark glow-edge ${notice ? 'visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        <Check size={17} />
        {notice}
      </div>
    </div>
  )
}
