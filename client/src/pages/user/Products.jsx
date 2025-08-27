import { useEffect, useState } from "react";
import SpotlightCard from "../../components/ui/SpotlightCard";
import { loadShopProducts } from "../../api/endpoints/products/user-products";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import { Link } from "react-router";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Show loading state
  if (loading) {
    return (
      <section className="py-20 bg-gray-50 text-center">
        <p className="text-lg font-medium text-gray-700">Loading products...</p>
      </section>
    );
  }
  // Show error state
  if (error) {
    return (
      <section className="py-20 bg-gray-50 text-center">
        <p className="text-lg font-medium text-red-600">Error: {error}</p>
      </section>
    );
  }

  return (
    <div className="container py-10">
      <NavBar />
      <PageBreadcrumbs />
      <h1 className="text-4xl font-bold text-white text-center mb-10 pt-8">
        Our Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <SpotlightCard
            key={product._id}
            className="custom-spotlight-card p-0 relative overflow-hidden rounded-3xl"
            spotlightColor="rgba(255, 255, 255, 0.25)"
          >
            <Link
              to={`/product/${product._id}`}
              className="block w-full h-[500px] relative"
            >
              {/* Product Image */}
              <img
                src={product.images?.[0] || "/fallback-image.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Overlay Text */}
              <div className="absolute bottom-0 left-0 w-full bg-black/20 text-white px-4 py-2 text-center ">
                <h2 className="text-base font-semibold line-clamp-1">
                  {product.name}
                </h2>
                <p className="text-sm mt-1">
                  <span className="font-bold">₹{product.price}</span>
                  {product.discount > 0 && (
                    <span className="ml-2 text-red-400 text-xs">
                      ({product.discount}% OFF)
                    </span>
                  )}
                </p>
              </div>
            </Link>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}

export default Products;
