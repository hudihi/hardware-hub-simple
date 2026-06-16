import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { createProductUrl } from '../utils/slug';

interface ProductRailProps {
  products: Product[];
  loading?: boolean;
}

const RailCardSkeleton: React.FC = () => (
  <div className="rail-card rail-card-skeleton">
    <div className="rail-card-img-wrap skeleton-shimmer" style={{ aspectRatio: '1' }} />
    <div className="rail-card-body">
      <div className="skeleton-line" style={{ width: '80%', height: '0.7rem', marginBottom: '0.35rem' }} />
      <div className="skeleton-line" style={{ width: '55%', height: '0.65rem' }} />
    </div>
  </div>
);

const RailCard: React.FC<{ product: Product }> = ({ product }) => {
  const [imgError, setImgError] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);

  return (
    <Link to={createProductUrl(product.id, product.name)} className="text-decoration-none">
      <div className="rail-card">
        <div className="rail-card-img-wrap">
          {!imgLoaded && !imgError && (
            <div className="rail-card-img-placeholder skeleton-shimmer" />
          )}
          <img
            src={imgError ? '/placeholder.svg' : product.image}
            alt={product.name}
            className="rail-card-img"
            style={{ opacity: imgLoaded || imgError ? 1 : 0, transition: 'opacity 0.3s' }}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />
          <span className="rail-card-badge">NEW</span>
        </div>
        <div className="rail-card-body">
          <p className="rail-card-name">{product.name}</p>
          <p className="rail-card-price">{formatPrice(product.price)}</p>
        </div>
      </div>
    </Link>
  );
};

const ProductRail: React.FC<ProductRailProps> = ({ products, loading = false }) => (
  <div className="product-rail-scroll hide-scrollbar">
    {loading
      ? Array.from({ length: 6 }).map((_, i) => <RailCardSkeleton key={i} />)
      : products.map(p => <RailCard key={p.id} product={p} />)
    }
  </div>
);

export default ProductRail;
