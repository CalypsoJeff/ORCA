/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import { loadShopProducts } from "../../api/endpoints/products/user-products";

// 🟢 SpotlightCard Component (unchanged)
const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
}) => {
  const [position, setPosition] = useState({ x: "50%", y: "50%" });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: `${e.clientX - rect.left}px`,
      y: `${e.clientY - rect.top}px`,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(0.6)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x} ${position.y}, ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};

// 🟣 Main Products Page
function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await loadShopProducts();
        if (response?.data?.products) {
          setProducts(response.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 Filter + Sort
  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "discount") return b.discount - a.discount;
      return 0;
    });

  // 🔹 Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <NavBar />
        <div className="flex flex-col flex-grow items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl font-medium text-gray-300">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // 🔹 Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <NavBar />
        <div className="flex flex-grow items-center justify-center">
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-md">
            <p className="text-lg font-medium text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <NavBar />
      <div className="container mx-auto px-4 mt-32">
        <PageBreadcrumbs current="Shop" />
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-[fadeIn_0.5s_ease-in]">
            Our Products
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover our curated collection of premium products.
          </p>
        </div>
        <div className="max-w-4xl mx-auto mb-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* 🛍 Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              No products found matching your search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredProducts.map((product, index) => (
              <SpotlightCard
                key={product._id}
                className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50"
                spotlightColor="rgba(59, 130, 246, 0.15)"
              >
                <Link
                  to={`/product/${product._id}`}
                  className="block group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden rounded-t-2xl bg-slate-900">
                    <img
                      src={product.images?.[0] || "/fallback-image.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        {product.discount}% OFF
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-gray-300 px-3 py-1.5 rounded-full text-xs font-medium">
                      {product.category}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <span className="text-white font-semibold px-6 py-2 bg-blue-500/90 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        View Details →
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h2>
                  
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-400">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹
                          {Math.round(
                            product.price / (1 - product.discount / 100)
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>

      {/* 🔝 Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Scroll to top"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
}

export default Products;
