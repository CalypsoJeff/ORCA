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
    <div className="w-full px-6 py-12">
      <NavBar />
      <PageBreadcrumbs />
      <h1 className="text-4xl font-bold text-white text-center mb-10 pt-8">
        Our Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <SpotlightCard
            key={product._id}
            className="custom-spotlight-card h-81"
            spotlightColor="rgba(255, 255, 255, 0.25)"
          >
            <div className="flex flex-col w-full h-full">
              {/* Product Image */}
              <img
                src={product.images?.[0] || "/fallback-image.jpg"}
                alt={product.name}
                className="w-full h-60 object-cover rounded-t-3xl"
              />

              {/* Product Details */}
              <div className="p-2 flex flex-col justify-start items-center flex-1">
                <Link to={`/product/${product._id}`}>
                  <h2 className="text-base font-medium text-black mt-2 hover:underline text-center line-clamp-2">
                    {product.name}
                  </h2>
                </Link>

                <p className="text-sm text-gray-700 mt-1">
                  <span className="text-black font-semibold">
                    ₹{product.price}
                  </span>
                  {product.discount > 0 && (
                    <span className="ml-2 text-red-500 text-xs">
                      ({product.discount}% OFF)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}

export default Products;
