import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
} from "mdb-react-ui-kit";
import { DollarSign, Tag, Calendar, User } from "lucide-react";
import { fetchPaymentDetails } from "../../api/endpoints/competitions/user-competition";

const PaymentConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPaymentDetails = async () => {
      try {
        const response = await fetchPaymentDetails(id);
        setPaymentDetails(response.data);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    };
    getPaymentDetails();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  if (!paymentDetails)
    return (
      <div className="text-center mt-5">Error fetching payment details.</div>
    );

  const initiatePayment = async () => {
    try {
        const response = await createRazorpayOrder(
          paymentDetails.competition._id
        );
        const orderData = response.data;

      const options = {
        key: "YOUR_RAZORPAY_KEY",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Competition Registration",
        description: `Registering for ${paymentDetails.competition.name}`,
        order_id: orderData.orderId,
        handler: function (response) {
          console.log("Payment Successful:", response);
          alert("Payment successful! Redirecting...");
          navigate(`/competition/${id}/payment-success`);
        },
        prefill: {
          name: paymentDetails.registrationDetails.name,
          email: paymentDetails.registrationDetails.email,
          contact: paymentDetails.registrationDetails.phone,
        },
        theme: { color: "#528FF0" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  return (
    <MDBContainer className="py-5 mt-24">
      <MDBCard className="shadow-lg border-0">
        <MDBCardBody>
          <MDBCardTitle className="text-center text-primary">
            Payment Confirmation
          </MDBCardTitle>

          <div className="mt-4 space-y-3">
            <p className="text-lg flex items-center">
              <Tag className="mr-2 text-blue-500" />{" "}
              <strong>Competition:</strong>
              <span className="ml-2">{paymentDetails.competition.name}</span>
            </p>
            <p className="text-lg flex items-center">
              <Calendar className="mr-2 text-green-500" />{" "}
              <strong>Date:</strong>
              <span className="ml-2">
                {new Date(paymentDetails.competition.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </p>
            <p className="text-lg flex items-center">
              <User className="mr-2 text-gray-500" />{" "}
              <strong>Registered By:</strong>
              <span className="ml-2">
                {paymentDetails.registrationDetails.name}
              </span>
            </p>
            <p className="text-lg flex items-center">
              <DollarSign className="mr-2 text-yellow-500" />{" "}
              <strong>Amount:</strong>
              <span className="ml-2">₹{paymentDetails.cost}</span>
            </p>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <MDBBtn color="success" onClick={initiatePayment}>
              Proceed to Payment
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default PaymentConfirmation;
