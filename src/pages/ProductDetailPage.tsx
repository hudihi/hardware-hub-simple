import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Minus, Package, Plus, Share2, ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { categoryService } from '../services/category.service';
import { communicationService } from '../services/communication.service';
import { productService } from '../services/product.service';
import { Category, Product } from '../types';
import { formatPrice } from '../utils/format';
import { processImageUrl } from '../utils/imageUrlUtils';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [specsOpen, setSpecsOpen] = useState(false);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getImageUrl = (product: Product): string => {
    // Use centralized utility to process the image URL
    return processImageUrl(product.image);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch both product and categories in parallel
        const [fetchedProduct, fetchedCategories] = await Promise.all([
          productService.getProductById(id),
          categoryService.getAllCategories()
        ]);
        
        // Set categories first
        setCategories(fetchedCategories);
        
        // Map API response to match Product interface expected by components
        if (fetchedProduct) {
          // Get the primary image from the images array, or fallback to image_url, then placeholder
          const primaryImage = (fetchedProduct as any).images?.find((img: any) => img.is_primary);
          const imageUrl = primaryImage?.url || (fetchedProduct as any).image_url || '/placeholder.svg';
          
          const mappedProduct = {
            id: fetchedProduct.id,
            name: fetchedProduct.name,
            description: fetchedProduct.description,
            price: fetchedProduct.price,
            unit: fetchedProduct.unit_of_measure, // Map unit_of_measure to unit
            image: imageUrl, // Use primary image from images array
            category: fetchedProduct.category_id, // Map category_id to category
            stock: fetchedProduct.stock_quantity, // Map stock_quantity to stock
          };
          setProduct(mappedProduct);
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
  }, [id]);

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

  const handleShare = async () => {
    try {
      // Use the API endpoint to share product
      const response = await communicationService.shareProduct(product.id);
      window.open(response.whatsapp_url, '_blank');
    } catch (error) {
      console.error('Failed to share product:', error);
      alert('Failed to share product. Please try again.');
    }
  };

  const shareOnWhatsApp = () => {
    const message = `${product.name} - PAHALA.COM!\n\n${formatPrice(product.price)}/${product.unit}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareOptions(false);
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
    setShowShareOptions(false);
  };

  const shareOnTwitter = () => {
    const message = `${product.name} - PAHALA.COM! ${formatPrice(product.price)}/${product.unit}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    setShowShareOptions(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard!');
      setShowShareOptions(false);
    }).catch(() => {
      alert('Failed to copy link');
    });
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
          {/* LEFT: Image */}
          <div className="col-12 col-md-6">
            <div
              className="rounded-3 overflow-hidden position-sticky"
              style={{
                top: '1rem',
                aspectRatio: '1',
                backgroundColor: 'var(--pahala-beige)',
              }}
            >
              {!imageLoaded && !imageError && (
                <div className="d-flex align-items-center justify-content-center w-100 h-100">
                  <div className="spinner-border text-muted" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              <img
                src={imageError ? '/placeholder.svg' : getImageUrl(product)}
                alt={product.name}
                className={`w-100 h-100 object-fit-cover ${imageLoaded ? 'd-block' : 'd-none'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="col-12 col-md-6">
            {/* Title & Share */}
            <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
              <h1 className="h4 fw-bold mb-0" style={{ lineHeight: 1.3 }}>
                {product.name}
              </h1>
              <button
                className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                onClick={handleShare}
                style={{ width: 38, height: 38 }}
                title={t('products_share')}
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Price */}
            <div className="d-flex align-items-baseline gap-2 mb-3">
              <span className="fs-3 fw-bold" style={{ color: 'var(--pahala-brown)' }}>
                {formatPrice(product.price)}
              </span>
              <span className="text-muted">/ {product.unit}</span>
            </div>

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
            <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
              {product.description}
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
                {language === 'sw' ? 'Maelezo Zaidi' : 'Specifications'}
                {specsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {specsOpen && (
                <div className="px-3 pb-3">
                  <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '40%' }}>
                          {language === 'sw' ? 'Kitengo' : 'Unit'}
                        </td>
                        <td className="fw-medium">{product.unit}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {language === 'sw' ? 'Hali ya Stoki' : 'Stock Status'}
                        </td>
                        <td className="fw-medium">
                          {product.stock > 0
                            ? language === 'sw' ? 'Inapatikana' : 'In Stock'
                            : language === 'sw' ? 'Haipo' : 'Out of Stock'}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {language === 'sw' ? 'Kiasi' : 'Available Qty'}
                        </td>
                        <td className="fw-medium">{product.stock}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {language === 'sw' ? 'Kategoria' : 'Category'}
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

      {/* Share Options Modal */}
      {showShareOptions && (
        <div 
          className="position-fixed start-0 top-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            zIndex: 1000 
          }}
          onClick={() => setShowShareOptions(false)}
        >
          <div 
            className="bg-white rounded-3 p-4 mx-3"
            style={{ maxWidth: 320, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="mb-3 text-center">
              {language === 'sw' ? 'Shiriki Bidhaa' : 'Share Product'}
            </h5>
            
            <div className="d-grid gap-2">
              <button
                className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2"
                onClick={shareOnWhatsApp}
              >
                <i className="bi bi-whatsapp"></i>
                WhatsApp
              </button>
              
              <button
                className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                onClick={shareOnFacebook}
              >
                <i className="bi bi-facebook"></i>
                Facebook
              </button>
              
              <button
                className="btn btn-outline-info d-flex align-items-center justify-content-center gap-2"
                onClick={shareOnTwitter}
              >
                <i className="bi bi-twitter"></i>
                Twitter
              </button>
              
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                onClick={copyLink}
              >
                <i className="bi bi-link-45deg"></i>
                {language === 'sw' ? 'Nakili Kiungo' : 'Copy Link'}
              </button>
              
              <button
                className="btn btn-secondary mt-2"
                onClick={() => setShowShareOptions(false)}
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
