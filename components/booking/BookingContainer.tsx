//Booking container page
import { useProperty } from "@/utils/store"; //Zustand library
import ConfirmBooking from "./ConfirmBooking";
import BookingForm from "./BookingForm";

function BookingContainer() {
  //Passing the entire state and then returns the range
  const { range } = useProperty((state) => state);

  //Check
  //!range.from : Is there any starting date of the range
  //!range.to : Is there any ending date of the range
  if (!range || !range.from || !range.to) return null;

  //Check if the date are the same
  //getTime() : To get the numeric timestamp of the to/from date
  if (range.to.getTime() === range.from.getTime()) return null;
  return (
    <div className="w-full">
      <BookingForm />
      <ConfirmBooking />
    </div>
  );
}

export default BookingContainer;
