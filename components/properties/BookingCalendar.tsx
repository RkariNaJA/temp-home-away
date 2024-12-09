//Calendar
"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

export default function BookingCalendar() {
  const currentDate = new Date();
  // Will get back from the database and display which data are already booked
  const defaultSelected: DateRange = {
    from: undefined,
    to: undefined,
  };
  //The state var range can either be DateRange or undefined
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);

  return (
    <Calendar
      id="test"
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
    />
  );
}
