//Check if payment was successful
//Check if booking exists and if it does exist then update the payment status property
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import { redirect } from "next/navigation";

import { NextResponse, type NextRequest } from "next/server";
import db from "@/utils/db";

export const GET = async (req: NextRequest) => {
  //This creates a URL object from the request URL.
  const { searchParams } = new URL(req.url);
  //This extracts the session_id query parameter from the URL.
  //The session ID is required to fetch the associated Stripe checkout session.
  const session_id = searchParams.get("session_id") as string;

  try {
    //This retrieves a Stripe Checkout session based on the provided session_id.
    const session = await stripe.checkout.sessions.retrieve(session_id);

    //Grab the booking ID from metadata ; metadata is an optional so we need to use optional chaining (?)
    const bookingId = session.metadata?.bookingId;
    if (session.status !== "complete" || !bookingId) {
      throw new Error("Something went wrong");
    }
    //Update Databse
    await db.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: true },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
  redirect("/bookings");
};

//Steps
// Retrieves the Stripe Checkout session corresponding to that session_id.
// Checks if the session is completed and contains a valid bookingId in its metadata.
// Updates the paymentStatus of the booking in the database.
// Redirects the user to the /bookings page.
