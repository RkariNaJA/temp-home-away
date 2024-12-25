//Render all the booking component here
"use client";

import { useProperty } from "@/utils/store";
import { Booking } from "@/utils/types";
import BookingCalendar from "./BookingCalendar";
import BookingContainer from "./BookingContainer";
import { useEffect } from "react";

type BookingWrapperProps = {
  //From database
  propertyId: string;
  price: number;
  bookings: Booking[];
};

//Get these 3 data from the PropertyDetailsPage
export default function BookingWrapper({
  propertyId,
  price,
  bookings,
}: BookingWrapperProps) {
  useEffect(() => {
    //Store in the state
    useProperty.setState({
      propertyId,
      price,
      bookings,
    });
  }, []);
  return (
    <>
      <BookingCalendar />
      <BookingContainer />
    </>
  );
}
