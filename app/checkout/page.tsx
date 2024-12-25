//Load the stripe and pass along to our back-end
"use client";
import axios from "axios"; //Http library
import { useSearchParams } from "next/navigation"; //To access the booking ID
import React, { useCallback } from "react"; //Control how often to invoke the function
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

//Communicate with strioe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

function CheckoutPage() {
  //access the query parameters in the URL
  const searchParams = useSearchParams();

  //The bookingId will be used to fetch payment information from our backend.
  const bookingId = searchParams.get("bookingId");
  //useCallback: used to memoize functions so that they don't get recreated on every render unless their dependencies change.
  //useCallback: function is only recreated if any dependencies change, but in this case, it has no dependencies ([]), so it will only be created once.
  const fetchClientSecret = useCallback(async () => {
    //Make a request to our backend with the bookingId as the request body to create a Checkout Session.
    const response = await axios.post("/api/payment", {
      bookingId: bookingId,
    });
    //Get from our own backend which is required for the Stripe payment process
    return response.data.clientSecret;
  }, []);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
export default CheckoutPage;
