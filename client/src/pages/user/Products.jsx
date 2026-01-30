import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import { loadShopProducts } from "../../api/endpoints/products/user-products";

import {
  addToCartLocally,
  addToCartAsync,
} from "../../features/ecommerce/cartSlice";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search + sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Sidebar filters
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await loadShopProducts();

        // ✅ Handles either response.data.products OR response.data.Products
        const list =
          response?.data?.products ||
          response?.data?.Products ||
          response?.data?.data?.products ||
          [];

        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Category display helper (supports populated + id-only)
  const getCategoryLabel = (category) => {
    if (!category) return "Uncategorized";
    if (typeof category === "string") return "Category"; // fallback if only id is present
    if (typeof category === "object") return category?.name || "Category";
    return "Category";
  };

  // Unique categories for filter (use populated name if available, otherwise group into "Category")
  const categories = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      set.add(getCategoryLabel(p?.category));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setMinPrice("");
    setMaxPrice("");
    setMinDiscount(0);
    setSearchTerm("");
    setSortBy("default");
  };

  // Helpers
  const calcMrp = (price, discount) => {
    const p = Number(price || 0);
    const d = Number(discount || 0);
    if (!d || d <= 0) return null;
    return Math.round(p / (1 - d / 100));
  };

  const hasVariants = (product) =>
    Array.isArray(product?.sizes) && product.sizes.length > 0;

  // Quick-add allowed only if we can auto-pick first size/color safely
  const canQuickAdd = (product) => {
    if (!hasVariants(product)) return true;
    const firstSize = product.sizes?.[0];
    const firstColor = firstSize?.colors?.[0];
    return Boolean(firstSize?.size && firstColor?.color);
  };

  const getDefaultVariant = (product) => {
    if (!hasVariants(product)) {
      return { size: null, color: null, stock: product?.stock ?? 999999 };
    }
    const firstSize = product.sizes?.[0];
    const firstColor = firstSize?.colors?.[0];
    return {
      size: firstSize?.size ?? null,
      color: firstColor?.color ?? null,
      stock: firstColor?.stock ?? 0,
    };
  };

  const handleAddToCartFromCard = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    // If not safe to quick-add, go to product details to choose options
    if (!canQuickAdd(product)) {
      navigate(`/product/${product._id}`);
      return;
    }

    const { size, color, stock } = getDefaultVariant(product);
    const quantity = 1;

    if (stock <= 0) {
      alert("Out of stock");
      return;
    }

    dispatch(
      addToCartLocally({
        product,
        size,
        color,
        quantity,
      })
    );

    const resultAction = await dispatch(
      addToCartAsync({
        productId: product._id,
        size,
        color,
        quantity,
      })
    );

    if (addToCartAsync.fulfilled.match(resultAction)) {
      navigate("/cart");
    } else {
      alert("Failed to add to cart. Please try again.");
    }
  };

  const filteredProducts = useMemo(() => {
    const minP = minPrice === "" ? null : Number(minPrice);
    const maxP = maxPrice === "" ? null : Number(maxPrice);

    return (products || [])
      .filter((p) => {
        const nameOk = (p?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const catLabel = getCategoryLabel(p?.category);
        const catOk =
          selectedCategories.size === 0 || selectedCategories.has(catLabel);

        const price = Number(p?.price || 0);
        const priceOk =
          (minP === null || price >= minP) && (maxP === null || price <= maxP);

        const discount = Number(p?.discount || 0);
        const discountOk = discount >= Number(minDiscount || 0);

        return nameOk && catOk && priceOk && discountOk;
      })
      .sort((a, b) => {
        const ap = Number(a?.price || 0);
        const bp = Number(b?.price || 0);
        const ad = Number(a?.discount || 0);
        const bd = Number(b?.discount || 0);

        if (sortBy === "price-low") return ap - bp;
        if (sortBy === "price-high") return bp - ap;
        if (sortBy === "discount") return bd - ad;
        return 0;
      });
  }, [
    products,
    searchTerm,
    selectedCategories,
    minPrice,
    maxPrice,
    minDiscount,
    sortBy,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="pt-28 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-500" />
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="pt-28 flex items-center justify-center px-4">
          <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md w-full">
            <p className="text-red-600 font-medium">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavBar />

      {/* pt-48 because NavBar + fixed Breadcrumbs take vertical space */}
      <div className="container mx-auto px-4 pt-48 pb-10">
        <PageBreadcrumbs current="Shop" />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Our Products</h1>
          <p className="text-gray-600 mt-1">
            Filter by category, price and discount — simple marketplace layout.
          </p>
        </div>

        {/* Top bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Discount: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <button
              onClick={clearFilters}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 lg:sticky lg:top-28">
              <h2 className="text-base font-semibold mb-4">Filters</h2>

              {/* Category */}
              <div className="mb-5">
                <div className="font-medium text-sm mb-2">Category</div>
                <div className="max-h-56 overflow-auto pr-1 space-y-2">
                  {categories.length === 0 ? (
                    <div className="text-sm text-gray-500">No categories</div>
                  ) : (
                    categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="h-4 w-4"
                        />
                        <span className="text-gray-700">{cat}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <div className="font-medium text-sm mb-2">Price Range</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Discount */}
              <div className="mb-1">
                <div className="font-medium text-sm mb-2">Discount</div>
                <div className="space-y-2">
                  {[0, 10, 20, 30, 40, 50].map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="discount"
                        checked={Number(minDiscount) === d}
                        onChange={() => setMinDiscount(d)}
                        className="h-4 w-4"
                      />
                      <span className="text-gray-700">
                        {d === 0 ? "All" : `${d}% or more`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
                No products found.
              </div>
            ) : (
              <div
                className="
                  grid gap-4
                  grid-cols-2
                  md:grid-cols-3
                  lg:grid-cols-4
                "
              >
                {filteredProducts.map((product) => {
                  const discount = Number(product?.discount || 0);
                  const mrp = calcMrp(product?.price, discount);

                  // If it has variants, better UX to open details to pick size/color
                  const showSelectOptions = hasVariants(product);

                  return (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="
                        group bg-white border border-gray-200 rounded-lg overflow-hidden
                        hover:shadow-md transition-shadow relative
                        no-underline
                      "
                      style={{ textDecoration: "none" }} // extra safety
                    >
                      {/* Image */}
                      <div className="relative bg-gray-100 h-44 sm:h-52">
                        <img
                          src={product.images?.[0] || "/fallback-image.jpg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {discount > 0 && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                            {discount}% OFF
                          </div>
                        )}

                        {/* Hover button */}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              if (showSelectOptions) {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/product/${product._id}`);
                              } else {
                                handleAddToCartFromCard(e, product);
                              }
                            }}
                            className="w-full text-sm font-semibold py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                          >
                            {showSelectOptions ? "Select options" : "Add to cart"}
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="text-xs text-gray-500 mb-1 line-clamp-1">
                          {getCategoryLabel(product.category)}
                        </div>

                        <h2
                          className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]"
                          style={{ textDecoration: "none" }}
                        >
                          {product.name}
                        </h2>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-semibold text-gray-900">
                            ₹{Number(product.price || 0).toLocaleString()}
                          </span>

                          {mrp && (
                            <span className="text-xs text-gray-500 line-through">
                              ₹{mrp.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div
                          className="mt-2 text-xs text-blue-600 font-medium"
                          style={{ textDecoration: "none" }}
                        >
                          View details
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Products;
