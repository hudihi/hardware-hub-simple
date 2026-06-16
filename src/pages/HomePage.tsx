import SearchBar from '@/components/SearchBar';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBanner from '../components/AnnouncementBanner';
import CategoryCard from '../components/CategoryCard';
import OptimizedProductGrid from '../components/OptimizedProductGrid';
import ProductRail from '../components/ProductRail';
import { useLanguage } from '../context/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import apiClient from '../services/api';
import { productService } from '../services/product.service';
import { Category, Product } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';
import { processImageUrl } from '../utils/imageUrlUtils';
import { generateWhatsAppLink } from '../utils/whatsapp';

const SkeletonProductCard: React.FC = () => (
  <div className="skeleton-product-card">
    <div className="skeleton-img" />
    <div className="p-2 p-md-3">
      <div className="skeleton-line skeleton-title mb-2" />
      <div className="skeleton-line skeleton-subtitle mb-3" />
      <div className="skeleton-btn" />
    </div>
  </div>
);

const SkeletonCategoryCard: React.FC = () => (
  <div className="skeleton-category">
    <div className="skeleton-icon" />
    <div className="skeleton-line skeleton-cat-name" />
  </div>
);

const TRUST_ITEMS = [
  { icon: 'bi-truck', title: 'Fast Delivery', titleSw: 'Utoaji wa Haraka', subtitle: 'Dar es Salaam & upcountry', subtitleSw: 'DSM na mikoani' },
  { icon: 'bi-patch-check-fill', title: 'Genuine Products', titleSw: 'Bidhaa Halisi', subtitle: 'Verified hardware tools', subtitleSw: 'Vifaa vilivyothibitishwa' },
  { icon: 'bi-arrow-repeat', title: 'Easy Returns', titleSw: 'Kurejesha Rahisi', subtitle: '7-day return policy', subtitleSw: 'Siku 7 za kurejesha' },
  { icon: 'bi-headset', title: 'WhatsApp Support', titleSw: 'Msaada wa WhatsApp', subtitle: 'Chat with us anytime', subtitleSw: 'Zungumza nasi wakati wowote' },
];

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const { t, language } = useLanguage();

  const waLink = generateWhatsAppLink(
    language === 'sw' ? 'Habari! Nataka kuweka agizo.' : 'Hello! I want to place an order.'
  );

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/api/v1/products/', {
          params: { page: 1, size: 100, ordering: '-created_at' }
        });
        const productsData = response.data?.items || [];
        const mappedProducts = productsData.map((apiProduct: any) => {
          const primaryImage = apiProduct.images?.find((img: any) => img.is_primary);
          const rawImageUrl = primaryImage?.url || apiProduct.image_url || '/placeholder.svg';
          return {
            id: apiProduct.id,
            name: apiProduct.name,
            description: apiProduct.description,
            price: apiProduct.price,
            unit: apiProduct.unit_of_measure,
            image: processImageUrl(rawImageUrl),
            category: apiProduct.category_id,
            stock: apiProduct.stock_quantity,
          };
        });

        // New Arrivals = first 8 (sorted by newest, before shuffle)
        setNewArrivals(mappedProducts.slice(0, 8));

        // Featured = shuffled remainder
        const rest = mappedProducts.slice(8);
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        setProducts(rest);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const fetchedCategories = await productService.getCategories();
        setCategories(fetchedCategories.map(apiCategory => ({
          id: apiCategory.id,
          name: apiCategory.name,
          slug: apiCategory.name.toLowerCase().replace(/\s+/g, '-'),
          icon: getCategoryIcon(apiCategory.name),
          description: apiCategory.description,
        })));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 20), [products]);

  // Re-run scroll reveal after async content loads
  useScrollReveal([productsLoading, categoriesLoading]);

  const suggestions = ['Power Tools', 'Hand Tools', 'Drilling Machine', 'Electric Saw', 'Measuring Tools', 'Safety Equipment', 'Garden Tools', 'Painting Supplies'];
  const recentSearches = ['Hammer', 'Screwdriver Set', 'Power Drill'];

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 400));
      setIsLoading(false);
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="page-container">

      {/* ── Announcement Banner ── */}
      <AnnouncementBanner />

      {/* ── Hero ── */}
      <div className="hero-v2">
        <div className="hero-pattern-overlay" aria-hidden="true" />
        <div className="container hero-v2-content">

          <div className="hero-badges">
            <span className="hero-badge"><i className="bi bi-box-seam me-1" />500+ Products</span>
            <span className="hero-badge"><i className="bi bi-shield-check me-1" />Official Warranty</span>
            <span className="hero-badge"><i className="bi bi-truck me-1" />Fast Delivery</span>
          </div>

          <h1 className="hero-title">{t('home_welcome')}</h1>
          <p className="hero-subtitle">{t('home_subtitle')}</p>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder={t('home_search_placeholder')}
            suggestions={suggestions}
            recentSearches={recentSearches}
            isLoading={isLoading}
            variant="hero"
          />

          <div className="mt-3">
            <Link to="/products" className="hero-browse-btn">
              <i className="bi bi-grid-3x3-gap me-2" />
              {language === 'sw' ? 'Tazama Bidhaa Zote' : 'Browse All Products'}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Trust Strip ── */}
      <div className="trust-strip">
        <div className="container">
          <div className="trust-strip-inner">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="trust-item">
                <div className="trust-icon-wrap">
                  <i className={`bi ${item.icon}`} />
                </div>
                <div>
                  <div className="trust-title">{language === 'sw' ? item.titleSw : item.title}</div>
                  <div className="trust-subtitle">{language === 'sw' ? item.subtitleSw : item.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mt-4">

        {/* ── Categories ── */}
        <div className="mb-4" data-reveal>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">{t('home_categories')}</h2>
            <Link to="/products" className="text-brown text-decoration-none small fw-semibold d-flex align-items-center gap-1">
              {t('home_view_all')} <i className="bi bi-chevron-right" />
            </Link>
          </div>

          <div className="categories-scroll-row">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="category-scroll-item"><SkeletonCategoryCard /></div>
                ))
              : categories.map(category => (
                  <div key={category.id} className="category-scroll-item">
                    <CategoryCard category={category} />
                  </div>
                ))
            }
          </div>
        </div>

        {/* ── New Arrivals Rail ── */}
        <div className="mb-4" data-reveal data-reveal-delay="1">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">
              <i className="bi bi-stars me-2" style={{ color: 'var(--pahala-brown)' }} />
              {language === 'sw' ? 'Bidhaa Mpya' : 'New Arrivals'}
            </h2>
            <Link to="/products?ordering=-created_at" className="text-brown text-decoration-none small fw-semibold d-flex align-items-center gap-1">
              {t('home_view_all')} <i className="bi bi-chevron-right" />
            </Link>
          </div>
          <ProductRail products={newArrivals} loading={productsLoading} />
        </div>

        {/* ── WhatsApp CTA Banner ── */}
        <div className="wa-cta-banner mb-4" data-reveal data-reveal-delay="2">
          <div className="wa-cta-left">
            <div className="wa-icon-wrap">
              <i className="bi bi-whatsapp" />
            </div>
            <div>
              <div className="wa-cta-title">
                {language === 'sw' ? 'Unahitaji Msaada wa Kuagiza?' : 'Need Help Ordering?'}
              </div>
              <div className="wa-cta-subtitle">
                {language === 'sw' ? 'Piga simu kupitia WhatsApp — haraka na rahisi' : 'Chat with us on WhatsApp — fast & easy'}
              </div>
            </div>
          </div>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="wa-cta-btn">
            <i className="bi bi-whatsapp" />
            {language === 'sw' ? 'Agiza WhatsApp' : 'Order on WhatsApp'}
          </a>
        </div>

        {/* ── Featured Products ── */}
        <div className="mb-4" data-reveal data-reveal-delay="3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">{t('home_featured')}</h2>
            <Link to="/products" className="text-brown text-decoration-none small fw-semibold d-flex align-items-center gap-1">
              {t('home_view_all')} <i className="bi bi-chevron-right" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="row g-2 g-md-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="col-6 col-md-4 col-lg-3">
                  <SkeletonProductCard />
                </div>
              ))}
            </div>
          ) : (
            <OptimizedProductGrid
              initialProducts={featuredProducts}
              pageSize={20}
              showLoadMore={false}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
