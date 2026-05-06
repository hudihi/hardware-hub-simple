import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Minus, Package, Plus, Share2, ShoppingCart, Tag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ShareButton from '../components/ShareButton';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { categoryService } from '../services/category.service';
import { productService, type ApiProductImage } from '../services/product.service';
import { Category, Product } from '../types';
import { formatPrice } from '../utils/format';
import { processImageUrl } from '../utils/imageUrlUtils';
import { extractProductIdFromSlug } from '../utils/slug';

function getProductDiscount(productId: string): number {
  let h = 0;
  for (let i = 0; i < productId.length; i++) {
    h = Math.imul(31, h) + productId.charCodeAt(i);
  }
  return (Math.abs(h) % 10) + 1;
}

const ProductDetailPage: React.FC = () => {
  const { slugWithId } = useParams<{ slugWithId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [galleryImages, setGalleryImages] = useState<ApiProductImage[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [specsOpen, setSpecsOpen] = useState(false);

  // Dynamic translation of admin-posted content
  const translatedName = useTranslatedContent(product?.name ?? '');
  const translatedDescription = useTranslatedContent(product?.description ?? '');

  // Extract product ID from slug
  const productId = slugWithId ? extractProductIdFromSlug(slugWithId) : null;

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getImageUrl = (product: Product): string => {
    return product.image;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setLoading(false);
        setError('Invalid product URL');
        return;
      }
      
      try {
        // Fetch both product and categories in parallel
        const [fetchedProduct, fetchedCategories] = await Promise.all([
          productService.findProductByShortId(productId),
          categoryService.getAllCategories()
        ]);
        
        // Set categories first
        setCategories(fetchedCategories);
        
        // Set share URL using the full slug
        setShareUrl(`${window.location.origin}/products/${slugWithId}`);
        
        // Map API response to match Product interface expected by components
        if (fetchedProduct) {
          const apiImages: ApiProductImage[] = fetchedProduct.images ?? [];
          const primaryImage = apiImages.find((img) => img.is_primary) ?? apiImages[0];
          const rawImageUrl = primaryImage?.url || fetchedProduct.image_url || '/placeholder.svg';
          const processedImageUrl = processImageUrl(rawImageUrl);

          const mappedProduct = {
            id: fetchedProduct.id,
            name: fetchedProduct.name,
            description: fetchedProduct.description,
            price: fetchedProduct.price,
            unit: fetchedProduct.unit_of_measure,
            image: processedImageUrl,
            category: fetchedProduct.category_id,
            stock: fetchedProduct.stock_quantity,
          };
          setProduct(mappedProduct);
          setGalleryImages(apiImages);
          setSelectedImageUrl(processedImageUrl);
        } else {
          setProduct(null);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message || 'Failed to fetch product');
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, slugWithId]);

  // Update Open Graph meta tags for social media sharing
  useEffect(() => {
    if (product) {
      // Update or create meta tags
      const updateMetaTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      const updateMetaName = (name: string, content: string) => {
        let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      // Update title
      document.title = `${product.name} - Pahala Store - Ufundi Bila Mipaka`;
      
      // Update Open Graph tags
      updateMetaTag('og:title', product.name);
      const ogDesc = t('share_product_og', {
        name: product.name,
        price: formatPrice(product.price || 0),
        unit: product.unit,
      });
      updateMetaTag('og:description', ogDesc);
      updateMetaTag('og:image', getImageUrl(product));
      updateMetaTag('og:url', shareUrl);
      updateMetaTag('og:type', 'product');

      // Update Twitter card tags
      updateMetaName('twitter:card', 'summary_large_image');
      updateMetaName('twitter:title', product.name);
      updateMetaName('twitter:description', ogDesc);
      updateMetaName('twitter:image', getImageUrl(product));

      // Cleanup function to restore original meta tags when component unmounts
      return () => {
        document.title = 'Pahala Store - Ufundi Bila Mipaka';
        updateMetaTag('og:title', 'Pahala Store - Ufundi Bila Mipaka');
        updateMetaTag('og:description', 'Ufundi Bila Mipaka. Zana na vifaa kwa mafundi, wajenzi na wabunifu.');
        updateMetaTag('og:image', '/PAHELA_27_FEBRUARY_2025.svg');
        updateMetaTag('og:url', window.location.origin);
        updateMetaTag('og:type', 'website');
      };
    }
  }, [product, shareUrl, language]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="container py-5 text-center">
          <Package size={48} className="mb-3" style={{ color: 'var(--pahala-brown-light)' }} />
          <h5>{t('system_loading')}</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="container py-5 text-center">
          <Package size={48} className="mb-3" style={{ color: 'var(--pahala-brown-light)' }} />
          <h5>{t('system_error')}</h5>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="container py-5 text-center">
          <Package size={48} className="mb-3" style={{ color: 'var(--pahala-brown-light)' }} />
          <h5>{t('product_not_found')}</h5>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/products')}>
            {t('product_view_products')}
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(product);
      }
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add items to cart:', error);
      // Show error message to user
      alert('Failed to add items to cart. Please try again.');
    }
  };

  const getShareContent = () => {
    const title = product?.name || '';
    const text = t('share_product_text', {
      name: product?.name ?? '',
      price: formatPrice(product?.price || 0),
      unit: product?.unit ?? '',
    });
    return { title, text, url: shareUrl };
  };

  return (
    <div className="page-container">
      <div className="container py-3 pb-5">
        {/* Back Button */}
        <button
          className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-1 text-decoration-none"
          style={{ color: 'var(--pahala-brown)' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span>{t('product_back')}</span>
        </button>

        {/* Two-column desktop / single-column mobile */}
        <div className="row g-4">
          {/* LEFT: Image gallery */}
          <div className="col-12 col-md-6">
            <div className="position-sticky" style={{ top: '1rem' }}>

              {/* Desktop: vertical thumbnail rail LEFT + main image RIGHT */}
              <div className="d-flex gap-3 align-items-start">

                {/* Vertical thumbnail rail — desktop only */}
                {galleryImages.length > 1 && (
                  <div
                    className="d-none d-md-flex flex-column gap-2 flex-shrink-0"
                    style={{
                      width: 72,
                      maxHeight: 440,
                      overflowY: 'auto',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {galleryImages.map((img) => {
                      const thumbUrl = processImageUrl(img.url);
                      const isActive = thumbUrl === selectedImageUrl;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => { setSelectedImageUrl(thumbUrl); setImageError(false); }}
                          className="p-0 border-0 bg-transparent flex-shrink-0"
                          style={{ width: 72, height: 72 }}
                        >
                          <img
                            src={thumbUrl}
                            alt=""
                            className="rounded-2 w-100 h-100"
                            style={{
                              objectFit: 'cover',
                              outline: isActive
                                ? '2.5px solid var(--pahala-brown)'
                                : '1.5px solid var(--pahala-beige)',
                              outlineOffset: isActive ? 2 : 0,
                              opacity: isActive ? 1 : 0.65,
                              transition: 'outline 0.15s, opacity 0.15s, outline-offset 0.15s',
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Main image */}
                <div
                  className="flex-grow-1 rounded-3 overflow-hidden"
                  style={{ aspectRatio: '1', backgroundColor: 'var(--pahala-beige)', minWidth: 0 }}
                >
                  <img
                    src={imageError ? '/placeholder.svg' : (selectedImageUrl || getImageUrl(product))}
                    alt={product.name}
                    className="w-100 h-100 object-fit-cover"
                    loading="eager"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>

              {/* Horizontal thumbnail strip — mobile only */}
              {galleryImages.length > 1 && (
                <div
                  className="d-flex d-md-none gap-2 mt-2 overflow-auto hide-scrollbar"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {galleryImages.map((img) => {
                    const thumbUrl = processImageUrl(img.url);
                    const isActive = thumbUrl === selectedImageUrl;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => { setSelectedImageUrl(thumbUrl); setImageError(false); }}
                        className="p-0 border-0 bg-transparent flex-shrink-0"
                        style={{ width: 64, height: 64 }}
                      >
                        <img
                          src={thumbUrl}
                          alt=""
                          className="rounded-2 w-100 h-100"
                          style={{
                            objectFit: 'cover',
                            outline: isActive ? '2px solid var(--pahala-brown)' : '2px solid transparent',
                            outlineOffset: 2,
                            opacity: isActive ? 1 : 0.72,
                            transition: 'outline 0.15s, opacity 0.15s',
                          }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="col-12 col-md-6">
            {/* Title & Share */}
            <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
              <h1 className="h4 fw-bold mb-0" style={{ lineHeight: 1.3 }}>
                {translatedName || product.name}
              </h1>
              <ShareButton
                title={getShareContent().title}
                text={getShareContent().text}
                url={getShareContent().url}
                image={getImageUrl(product)}
                className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 38, height: 38 }}
              >
                <Share2 size={16} />
              </ShareButton>
            </div>

            {/* Price */}
            {(() => {
              const discount = getProductDiscount(product.id);
              const originalPrice = Math.round(product.price / (1 - discount / 100));
              return (
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                      style={{ backgroundColor: '#C0392B', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      <Tag size={12} />
                      {discount}% OFF
                    </span>
                    <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.9rem' }}>
                      {formatPrice(originalPrice)}
                    </span>
                  </div>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="fs-3 fw-bold" style={{ color: 'var(--pahala-brown)' }}>
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-muted">/ {product.unit}</span>
                  </div>
                </div>
              );
            })()}

            {/* Stock */}
            <div className="d-flex align-items-center gap-2 mb-4">
              <span
                className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                style={{ backgroundColor: '#D1E7DD', color: '#0F5132', fontSize: '0.8rem' }}
              >
                <CheckCircle size={13} />
                {t('product_available')}
              </span>
              <span className="text-muted small">
                ({product.stock} {t('product_in_stock')})
              </span>
            </div>

            {/* Description */}
            <p className="text-muted mb-4 whitespace-pre-line" style={{ lineHeight: 1.7 }}>
              {translatedDescription || product.description}
            </p>

            {/* Divider */}
            <hr style={{ borderColor: 'var(--pahala-beige)', opacity: 1 }} />

            {/* Quantity Selector */}
            <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
              <span className="fw-semibold">{t('product_quantity')}</span>
              <div className="qty-control">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">{t('product_total')}</span>
              <span className="fs-5 fw-bold" style={{ color: 'var(--pahala-brown)' }}>
                {formatPrice(product.price * quantity)}
              </span>
            </div>

            {/* Add to Cart Button — inline, never overlapping */}
            <button
              className="btn btn-primary btn-lg-mobile w-100 d-flex align-items-center justify-content-center gap-2 mb-4"
              onClick={handleAddToCart}
              style={{ fontSize: '1rem' }}
            >
              <ShoppingCart size={18} />
              {t('product_add_to_cart')}
            </button>

            {/* Collapsible Specifications */}
            <div
              className="rounded-3"
              style={{ backgroundColor: 'var(--pahala-cream)', overflow: 'hidden' }}
            >
              <button
                className="btn w-100 d-flex justify-content-between align-items-center px-3 py-3 border-0"
                onClick={() => setSpecsOpen(!specsOpen)}
                style={{ color: 'var(--pahala-brown-dark)', fontWeight: 600, fontSize: '0.9rem' }}
              >
                {t('product_specifications')}
                {specsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {specsOpen && (
                <div className="px-3 pb-3">
                  <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '40%' }}>
                          {t('product_spec_unit')}
                        </td>
                        <td className="fw-medium">{product.unit}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {t('product_spec_stock_status')}
                        </td>
                        <td className="fw-medium">
                          {product.stock > 0
                            ? t('product_spec_in_stock')
                            : t('product_spec_out_of_stock')}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {t('product_spec_qty')}
                        </td>
                        <td className="fw-medium">{product.stock}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {t('product_spec_category')}
                        </td>
                        <td className="fw-medium text-capitalize">{getCategoryName(product.category)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only sticky bottom bar */}
      <div
        className="d-md-none position-fixed start-0 end-0"
        style={{
          bottom: 56,
          zIndex: 999,
          background: 'var(--pahala-white)',
          borderTop: '1px solid var(--pahala-beige)',
          padding: '0.75rem 1rem',
        }}
      >
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div>
            <span className="text-muted small d-block">{t('product_total')}</span>
            <span className="fw-bold" style={{ color: 'var(--pahala-brown)', fontSize: '1.1rem' }}>
              {formatPrice(product.price * quantity)}
            </span>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 px-4"
            onClick={handleAddToCart}
            style={{ minHeight: 44, borderRadius: 'var(--radius-md)' }}
          >
            <ShoppingCart size={16} />
            {t('product_add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
