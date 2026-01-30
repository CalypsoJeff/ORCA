import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import { loadProductDetails } from "../../api/endpoints/products/user-products";
import {
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import {
  addToCartLocally,
  addToCartAsync,
} from "../../features/ecommerce/cartSlice";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [availableColors, setAvailableColors] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!product) return;

    dispatch(
      addToCartLocally({
        product,
        size: selectedSize,
        color: selectedColor,
        quantity,
      })
    );

    const resultAction = await dispatch(
      addToCartAsync({
        productId: product._id,
        size: selectedSize,
        color: selectedColor,
        quantity,
      })
    );

    if (addToCartAsync.fulfilled.match(resultAction)) {
      navigate("/cart");
    } else {
      alert("Failed to add to cart. Please try again.");
    }
  };

  // Buy Now: add item then go to checkout
  const handleBuyNow = async () => {
    if (!product) return;

    dispatch(
      addToCartLocally({
        product,
        size: selectedSize,
        color: selectedColor,
        quantity,
      })
    );

    const resultAction = await dispatch(
      addToCartAsync({
        productId: product._id,
        size: selectedSize,
        color: selectedColor,
        quantity,
      })
    );

    if (addToCartAsync.fulfilled.match(resultAction)) {
      navigate("/checkout");
    } else {
      alert("Failed to proceed to checkout. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await loadProductDetails(id);
        const productData = response?.data?.product;
        setProduct(productData);

        // Defaults
        if (productData?.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0].size);
          setAvailableColors(productData.sizes[0].colors || []);

          if (productData.sizes[0]?.colors?.length > 0) {
            setSelectedColor(productData.sizes[0].colors[0].color);
            setCurrentStock(productData.sizes[0].colors[0].stock);
          }
        } else {
          // if no variants, optionally set stock from product.stock if available
          setCurrentStock(productData?.stock ?? 999999);
        }
      } catch (err) {
        setError(err?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  // Update colors when size changes
  useEffect(() => {
    if (!product || !selectedSize) return;

    const sizeObj = product.sizes?.find((s) => s.size === selectedSize);
    if (!sizeObj) return;

    setAvailableColors(sizeObj.colors || []);

    if (sizeObj.colors?.length > 0) {
      const exists = sizeObj.colors.some((c) => c.color === selectedColor);
      const nextColor = exists ? selectedColor : sizeObj.colors[0].color;
      setSelectedColor(nextColor);

      const colorObj = sizeObj.colors.find((c) => c.color === nextColor);
      setCurrentStock(colorObj?.stock ?? 0);
    } else {
      setSelectedColor(null);
      setCurrentStock(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, product]);

  // Update stock when color changes
  useEffect(() => {
    if (!product || !selectedSize || !selectedColor) return;

    const sizeObj = product.sizes?.find((s) => s.size === selectedSize);
    const colorObj = sizeObj?.colors?.find((c) => c.color === selectedColor);
    setCurrentStock(colorObj?.stock ?? 0);
  }, [selectedColor, selectedSize, product]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= currentStock)
      setQuantity(newQuantity);
  };

  const handleNextImage = () => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    const p = Number(price || 0);
    const d = Number(discount || 0);
    if (!d) return p;
    return Math.round(p - (p * d) / 100);
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <PageBreadcrumbs />
        <div className="container mx-auto py-10 px-6 mt-28 min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 border-4 border-t-sky-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Loading product details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <PageBreadcrumbs />
        <div className="container mx-auto py-10 px-6 mt-28 min-h-[60vh] flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Error Loading Product
            </h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  const discountedPrice = calculateDiscountedPrice(
    product?.price,
    product?.discount
  );

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />

      {/* Make the page area a fixed viewport height so right can scroll */}
      <div className="container mx-auto px-4 sm:px-6 mt-28 mb-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-7xl mx-auto">
          {/* height: viewport minus navbar+breadcrumbs area.
              adjust 160px if your header area differs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:h-[calc(100vh-160px)]">
            {/* LEFT: sticky image column */}
            <div className="md:border-r border-gray-200">
              <div className="md:sticky md:top-28 p-6 space-y-6">
                <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[320px] sm:h-[420px]">
                  <img
                    src={
                      product?.images?.[activeImageIndex] ||
                      "/fallback-image.jpg"
                    }
                    alt={product?.name || "Product image"}
                    className="w-full h-full object-contain p-2"
                  />

                  {product?.images?.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                        aria-label="Previous image"
                      >
                        <FaChevronLeft className="text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                        aria-label="Next image"
                      >
                        <FaChevronRight className="text-gray-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {product?.images?.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                          activeImageIndex === index
                            ? "border-sky-600 shadow-md"
                            : "border-gray-200"
                        }`}
                        aria-label={`Select image ${index + 1}`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product?.name || "Product"} - view ${
                            index + 1
                          }`}
                          className="w-full h-full object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:overflow-y-auto scrollbar-hide">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 pt-4">
                  {product?.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Brand: {product?.brand}
                </p>

                <div className="flex items-baseline mt-3">
                  <span className="text-3xl font-bold text-sky-600">
                    ₹{discountedPrice}
                  </span>
                  {product?.discount > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through ml-3">
                        ₹{product.price}
                      </span>
                      <span className="ml-3 text-green-600 font-medium">
                        {product.discount}% off
                      </span>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h2 className="font-semibold text-lg mb-2">Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {product?.description ||
                      "No description available for this product."}
                  </p>
                </div>
              </div>

              {/* Size */}
              {product?.sizes?.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-semibold text-lg mb-3">Select Size</h2>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((sizeObj) => (
                      <button
                        key={sizeObj._id}
                        onClick={() => setSelectedSize(sizeObj.size)}
                        className={`px-4 py-2 border rounded-md transition-all ${
                          selectedSize === sizeObj.size
                            ? "border-sky-600 bg-sky-50 text-sky-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {sizeObj.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}
              {availableColors.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-semibold text-lg mb-3">Select Color</h2>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((colorObj) => (
                      <button
                        key={colorObj._id}
                        onClick={() => setSelectedColor(colorObj.color)}
                        className={`relative px-4 py-2 border rounded-md transition-all ${
                          selectedColor === colorObj.color
                            ? "border-sky-600 bg-sky-50 text-sky-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colorObj.color }}
                          />
                          <span className="capitalize">{colorObj.color}</span>
                        </div>
                        {selectedColor === colorObj.color && (
                          <FaCheck className="absolute top-1 right-1 text-sky-600 text-xs" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="mb-6">
                <div
                  className={`py-2 px-3 rounded-md ${
                    currentStock > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {currentStock > 0 ? (
                    <div className="flex items-center">
                      <FaCheck className="mr-2" />
                      <span>
                        {currentStock > 10
                          ? "In Stock"
                          : `Only ${currentStock} left in stock - order soon`}
                      </span>
                    </div>
                  ) : (
                    <span>Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-3">Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Material:</span>
                    <span className="font-medium">{product?.material}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Brand:</span>
                    <span className="font-medium">{product?.brand}</span>
                  </div>
                </div>
              </div>

              {/* Cart */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <span className="mr-4 font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-x">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= currentStock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                    className="bg-sky-600 hover:bg-sky-700 px-6 py-3 text-white text-base font-medium flex-1 flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </Button>

                  <Button
                    onClick={handleBuyNow}
                    disabled={currentStock === 0}
                    className="border border-sky-600 bg-white text-sky-600 hover:bg-sky-50 px-6 py-3 text-base font-medium flex-1 flex items-center justify-center"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
              <div className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
