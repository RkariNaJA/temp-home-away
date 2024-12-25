//Navigate user to this page after booking a property
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import { type NextRequest, type NextResponse } from "next/server";
import db from "@/utils/db";
import { formatDate } from "@/utils/format";
// incoming HTTP request object and outgoing response object
export const POST = async (req: NextRequest, res: NextResponse) => {
  //Create a new Headers and access to the request's headers.
  const requestHeaders = new Headers(req.headers);
  //Origin contains the domain from the request ; Origin will = (Ex: https://example.com) or (Ex: localhost:3000)
  //Useful when you need to know where to redirect the user after a successful or canceled payment
  const origin = requestHeaders.get("origin");

  //Parses the incoming request body as JSON and extracts the bookingId from it.
  const { bookingId } = await req.json();

  //Get booking data from database
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!booking) {
    return Response.json(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  //Preparing Data for Stripe Checkout
  //Destructured from booking
  const {
    totalNights,
    orderTotal,
    checkIn,
    checkOut,
    property: { image, name },
  } = booking;

  //Communicate with stripe
  try {
    //Create checkout sessions.The session represents the transaction that the user will complete.
    const session = await stripe.checkout.sessions.create({
      //Optional parameter that controls the user interface of the Stripe Checkout session
      ui_mode: "embedded",
      //Custom data sent along with the session
      //If the payment is successful will update the booking data
      metadata: { bookingId: booking.id },
      // This defines what the customer is purchasing
      line_items: [
        {
          //The quantity of the product being purchased (1 booking).
          quantity: 1,
          //Details about the product (the booking):
          price_data: {
            currency: "usd",

            product_data: {
              //The name of the property
              name: `${name}`,
              //An array containing the image URL of the property
              images: [image],
              //A description of the booking
              description: `Stay in this wonderful place for ${totalNights} nights, from ${formatDate(
                checkIn
              )} to ${formatDate(checkOut)}. Enjoy your stay!`,
            },
            //The amount for the booking, in cents (because Stripe expects the price in the smallest unit of the currency) then convet the total from dollas to cent
            unit_amount: orderTotal * 100,
          },
        },
      ],
      //Specifies that the session is a one-time payment
      mode: "payment",
      //After the user completes (or cancels) the checkout process, they will be redirected to this URL
      //{CHECKOUT_SESSION_ID} placeholder that Stripe will replace with the actual session ID
      return_url: `${origin}/api/confirm?session_id={CHECKOUT_SESSION_ID}`,
    });
    //Returned the client_secret to client.This client_secret is required on the frontend to complete the payment.
    //The frontend will use this client secret with Stripe's JavaScript SDK to confirm and complete the payment process in the user's browser.
    return Response.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.log(error);

    return Response.json(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};

//Goal of this page is to create a Stripe Checkout session for a booking
//Steps:
//The server extracts the bookingId from the request body.
// It queries the database to retrieve the booking details.
// If the booking is found, the relevant information (total nights, price, property details) is extracted.
// A Stripe Checkout session is created with this information, and the client secret for the session is returned to the client.
// If an error occurs, the server logs the error and returns a 500 error response.
// The client will use the clientSecret to complete the payment process via Stripe on the frontend.
