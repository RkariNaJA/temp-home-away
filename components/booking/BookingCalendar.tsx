//Calendar for booking property
"use client";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { useProperty } from "@/utils/store";

import {
  generateDisabledDates,
  generateDateRange,
  defaultSelected,
  generateBlockedPeriods,
} from "@/utils/calendar";

export default function BookingCalendar() {
  const currentDate = new Date();

  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  const bookings = useProperty((state) => state.bookings);
  const { toast } = useToast(); //Display toast message

  //Block the date that has been booked and all past dates
  const blockedPeriods = generateBlockedPeriods({
    bookings,
    today: currentDate,
  });
  //All of the dates that have been booked
  const unavailableDates = generateDisabledDates(blockedPeriods);

  //setstate : Update state with the new value of range
  //range : where user choose which date to book (Ex 14/12-20/12)
  useEffect(() => {
    const selectedRange = generateDateRange(range);
    //.some used to check if at least one element in an array meets a specified condition ; It returns a boolean value
    //Use some method to check if any date in selectedRange is meet the condition below
    const isDisabledDateIncluded = selectedRange.some((date) => {
      //Check if whether any of these dates is in the unavailableDates
      if (unavailableDates[date]) {
        //If any unavailable date is found, resets the date range to a default value
        setRange(defaultSelected);
        toast({
          description: "Some dates are booked. Please select again.",
        });
        //Return true when an unavailable date is found and stop the further checks
        // (because .some will stop iterating once it finds a true condition).
        return true;
      }
      return false;
    });

    useProperty.setState({ range });
  }, [range]);

  return (
    //selected : showcase which date use have selected
    <Calendar
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
      className="mb-4"
      // add disabled
      disabled={blockedPeriods}
    />
  );
}
