import { create } from "zustand"; //state management library for React applications
import { Booking } from "./types";
import { DateRange } from "react-day-picker";
// Define the state's shape
type PropertyState = {
  propertyId: string;
  price: number;
  bookings: Booking[];
  range: DateRange | undefined;
};

// Create the store
// use create function that provided by Zustand library to create a state store
//<PropertyState> : indicates that the state inside the store is expected to conform to the PropertyState type
export const useProperty = create<PropertyState>(() => {
  return {
    propertyId: "",
    price: 0,
    bookings: [],
    range: undefined,
  };
});
