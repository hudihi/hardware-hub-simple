import React, { useState } from 'react';
import { products, categories } from '../../data/products';
import { formatPrice } from '../../utils/format';

const AdminProducts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Products</h4>
        <button className="btn btn-primary btn-sm">
          <i className="bi bi-plus me-1"></i>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card-pahala card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card-pahala card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="rounded"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <div className="fw-semibold">{product.name}</div>
                          <small className="text-muted">{product.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{product.category}</span>
                    </td>
                    <td className="text-brown fw-semibold">
                      {formatPrice(product.price)}/{product.unit}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          product.stock > 20
                            ? 'bg-success'
                            : product.stock > 5
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-danger">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-3 text-muted small">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
};

export default AdminProducts;
