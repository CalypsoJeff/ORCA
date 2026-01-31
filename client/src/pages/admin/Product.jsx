/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import Modal from "react-modal";
import { Menu, X, Star, Tag } from "lucide-react";

import SideBar from "../../components/admin/SideBar";
import ProductModal from "../../components/admin/ProductModal";
import { loadCategories } from "../../api/endpoints/categories/admin-categories";
import {
  addProduct,
  editProduct,
  loadProducts,
} from "../../api/endpoints/products/admin-products";

Modal.setAppElement("#root");

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // ✅ NEW: keep old URLs here
  const [existingImages, setExistingImages] = useState([]);
  // ✅ NEW: store newly selected files here
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: 0,
    category: "",
    brand: "",
    material: "",
    // ❌ remove images from here (images must not be URLs)
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await loadProducts();
      const list = response?.data?.products || [];
      setProducts(list);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      Swal.fire("Error!", "Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await loadCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openModal = (product = null) => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price ?? "",
        discount: product.discount ?? 0,
        category: product.category?._id || "",
        brand: product.brand || "",
        material: product.material || "",
      });

      // ✅ keep existing URLs separate
      setExistingImages(Array.isArray(product.images) ? product.images : []);
      // ✅ reset new files
      setNewImages([]);

      setSelectedProduct(product);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        discount: 0,
        category: "",
        brand: "",
        material: "",
      });

      setExistingImages([]);
      setNewImages([]);

      setSelectedProduct(null);
    }
    setModalIsOpen(true);
  };

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIdx(0);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedProduct(null);
    setActiveImageIdx(0);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProduct(null);
    setExistingImages([]);
    setNewImages([]);
  };

  // ✅ FIXED SUBMIT
  const handleSubmit = async (payload) => {
    try {
      const formDataToSend = new FormData();

      // append basic fields
      formDataToSend.append("name", payload.name);
      formDataToSend.append("description", payload.description);
      formDataToSend.append("price", payload.price);
      formDataToSend.append("discount", payload.discount);
      formDataToSend.append("category", payload.category);
      formDataToSend.append("brand", payload.brand);
      formDataToSend.append("material", payload.material);

      // ✅ send existingImages (so backend can keep old ones)
      formDataToSend.append(
        "existingImages",
        JSON.stringify(existingImages || [])
      );

      // ✅ send new images ONLY if user selected files
      if (newImages.length > 0) {
        newImages.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      if (selectedProduct) {
        await editProduct(selectedProduct._id, formDataToSend);
        Swal.fire("Updated!", "Product has been updated.", "success");
      } else {
        // add product requires images (your backend already enforces this)
        await addProduct(formDataToSend);
        Swal.fire("Added!", "Product has been added.", "success");
      }

      await fetchProducts();
      closeModal();
    } catch (error) {
      console.error("❌ Error submitting product:", error);
      Swal.fire("Error!", "Failed to save product.", "error");
    }
  };

  const formatMoney = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const calcFinalPrice = (price, discount) => {
    const p = Number(price || 0);
    const d = Number(discount || 0);
    if (!d) return p;
    return Math.round(p - (p * d) / 100);
  };

  const modalStyles = {
    overlay: {
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    },
    content: {
      position: "relative",
      inset: "auto",
      padding: 0,
      border: "none",
      background: "transparent",
      maxWidth: "980px",
      width: "100%",
      maxHeight: "90vh",
      overflow: "visible",
    },
  };

  return (
    <div className="flex h-screen">
      <SideBar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 focus:outline-none lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold">Product Management</h1>
        </header>

        <div className="p-5">
          <button
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-md shadow-lg hover:scale-105 transition-transform duration-300"
            onClick={() => openModal()}
          >
            ➕ Add Product
          </button>

          {loading && <div className="text-center mt-4">Loading...</div>}

          {!loading && products.length === 0 && (
            <div className="text-center text-gray-500 mt-6 text-lg">
              🚫 No products available.
            </div>
          )}

          {!loading && products.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>
                      {product.category?.name || "Uncategorized"}
                    </TableCell>
                    <TableCell>
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                        onClick={() => openViewModal(product)}
                      >
                        👁️ View
                      </button>
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:scale-105 transition-transform"
                        onClick={() => openModal(product)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:scale-105 transition-transform"
                        onClick={() => console.log("Unlist", product._id)}
                      >
                        🗑️ Unlist
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* ✅ Pass image states to ProductModal */}
          <ProductModal
            isOpen={modalIsOpen}
            onClose={closeModal}
            onSubmit={handleSubmit}
            product={selectedProduct}
            categories={categories}
            formData={formData}
            setFormData={setFormData}
            existingImages={existingImages}
            setExistingImages={setExistingImages}
            newImages={newImages}
            setNewImages={setNewImages}
          />

          {/* ✅ View Product Modal (unchanged UI) */}
          <Modal
            isOpen={viewModalOpen}
            onRequestClose={closeViewModal}
            style={modalStyles}
            contentLabel="View Product Details"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {selectedProduct?.name || "Product"}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {selectedProduct?.category?.name && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        <Tag className="w-3.5 h-3.5" />
                        {selectedProduct.category.name}
                      </span>
                    )}
                    {selectedProduct?.status && (
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          String(selectedProduct.status).toLowerCase() ===
                          "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {selectedProduct.status}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={closeViewModal}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left: Gallery */}
                <div className="bg-gray-50 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-gray-200">
                  {selectedProduct?.images?.length ? (
                    <>
                      <div className="w-full aspect-square bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <img
                          src={selectedProduct.images[activeImageIdx]}
                          alt={`Product image ${activeImageIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {selectedProduct.images.slice(0, 10).map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIdx(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border transition ${
                              idx === activeImageIdx
                                ? "border-sky-500 ring-2 ring-sky-200"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            title={`View image ${idx + 1}`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-square bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500">
                      No images
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatMoney(
                              calcFinalPrice(
                                selectedProduct?.price,
                                selectedProduct?.discount
                              )
                            )}
                          </div>
                          {Number(selectedProduct?.discount || 0) > 0 && (
                            <>
                              <div className="text-sm text-gray-500 line-through">
                                {formatMoney(selectedProduct?.price)}
                              </div>
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                {selectedProduct.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500">Rating</div>
                        <div className="mt-1 inline-flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold text-gray-900">
                            {Number(selectedProduct?.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500">Brand</div>
                        <div className="font-semibold text-gray-900">
                          {selectedProduct?.brand || "—"}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500">Material</div>
                        <div className="font-semibold text-gray-900">
                          {selectedProduct?.material || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedProduct?.description || "No description provided."}
                    </p>
                  </div>

                  {!!selectedProduct?.sizes?.length && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Variants / Stock
                      </h3>

                      <div className="space-y-3">
                        {selectedProduct.sizes.map((s, idx) => (
                          <div
                            key={s._id || idx}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-900">
                                Size:{" "}
                                <span className="text-sky-700">{s.size}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {s.colors?.length || 0} color(s)
                              </div>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {s.colors?.map((c, cidx) => (
                                <span
                                  key={c._id || cidx}
                                  className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-800"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                                  {c.color}
                                  <span className="text-gray-500 font-medium">
                                    • Stock: {c.stock ?? 0}
                                  </span>
                                </span>
                              ))}
                              {!s.colors?.length && (
                                <span className="text-xs text-gray-500">
                                  No colors found
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Meta</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500">Created</div>
                        <div className="font-semibold text-gray-900">
                          {selectedProduct?.createdAt
                            ? new Date(
                                selectedProduct.createdAt
                              ).toLocaleString("en-IN")
                            : "—"}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500">Updated</div>
                        <div className="font-semibold text-gray-900">
                          {selectedProduct?.updatedAt
                            ? new Date(
                                selectedProduct.updatedAt
                              ).toLocaleString("en-IN")
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => {
                        closeViewModal();
                        openModal(selectedProduct);
                      }}
                      className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition shadow-sm"
                    >
                      ✏️ Edit Product
                    </button>
                    <button
                      onClick={closeViewModal}
                      className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition"
                    >
                      Close
                    </button>
                  </div>

                  <div className="h-2" />
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Product;
