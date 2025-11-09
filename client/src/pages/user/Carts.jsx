import { useState, useEffect } from "react";
import { loadCart } from "../../api/endpoints/products/user-products";
import NavBar from "../../components/user/NavBar";
import { InteractiveCheckout } from "../../components/ui/interactive-checkout";
import {
  MDBContainer,
  MDBBreadcrumb,
  MDBBreadcrumbItem,
} from "mdb-react-ui-kit";
import { Link } from "react-router-dom";

const InteractiveCheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await loadCart();
        const cartData = response.data;
        if (cartData && Array.isArray(cartData.items)) {
          setCartItems(cartData.items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* 🔹 Breadcrumbs */}
      <MDBContainer className="mt-28 mb-4">
        <MDBBreadcrumb>
          <MDBBreadcrumbItem>
            <Link to="/home" className="text-decoration-none text-sky-600">
              Home
            </Link>
          </MDBBreadcrumbItem>
          <MDBBreadcrumbItem>
            <Link to="/shop" className="text-decoration-none text-sky-600">
              Shop
            </Link>
          </MDBBreadcrumbItem>
          <MDBBreadcrumbItem active>Cart</MDBBreadcrumbItem>
        </MDBBreadcrumb>
      </MDBContainer>

      {/* 🔹 Page Heading */}
      <h2 className="text-center text-4xl text-black font-bold mb-6">
        Your Cart
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="text-gray-500">Loading cart...</div>
        </div>
      ) : (
        <InteractiveCheckout products={cartItems} />
      )}
    </div>
  );
};

export default InteractiveCheckoutPage;
