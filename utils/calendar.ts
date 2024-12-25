import { DateRange } from "react-day-picker";
import { Booking } from "@/utils/types";

export const defaultSelected: DateRange = {
  from: undefined,
  to: undefined,
};
//For displaying unavailable or booked dates in a calendar
export const generateBlockedPeriods = ({
  bookings,
  today,
}: {
  bookings: Booking[];
  today: Date;
}) => {
  today.setHours(0, 0, 0, 0); // Set the time to 00:00:00.000

  //Date ranges representing the blocked booking periods (from checkIn to checkOut for each booking).
  const disabledDays: DateRange[] = [
    ...bookings.map((booking) => ({
      from: booking.checkIn,
      to: booking.checkOut,
    })),
    {
      //This creates a date range representing **all dates before today**:
      from: new Date(0), // This is 01 January 1970 00:00:00 UTC.
      to: new Date(today.getTime() - 24 * 60 * 60 * 1000), // This is yesterday.
    },
  ];
  return disabledDays;
};

// Generates an array of string representations of all the dates between a given from and to,
// ensuring that each date is represented as a string in the YYYY-MM-DD format.
export const generateDateRange = (range: DateRange | undefined): string[] => {
  if (!range || !range.from || !range.to) return [];

  let currentDate = new Date(range.from); //object based on the from date in the range
  const endDate = new Date(range.to); //object based on the to date in the range.
  const dateRange: string[] = []; //an empty array that will store the date strings.

  //loop continues until currentDate is greater than endDate
  while (currentDate <= endDate) {
    //The current date is converted to ISO format ; which gives a string like "YYYY-MM-DDT00:00:00.000Z"
    // The .split("T")[0] extracts the date part ("YYYY-MM-DD").
    const dateString = currentDate.toISOString().split("T")[0];
    dateRange.push(dateString);
    // setDate() method is used to set the day of the month for the currentDate object
    // currentDate.getDate() retrieves the current day of the month
    // +1 is to increment the current date by one day in each iteration of the loop.
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateRange;
};

// For marking unavailable or booked dates in a calendar system
export const generateDisabledDates = (
  disabledDays: DateRange[]
): { [key: string]: boolean } => {
  if (disabledDays.length === 0) return {};

  //store the dates that should be marked as disabled
  const disabledDates: { [key: string]: boolean } = {};
  //set to the current date and the time is reset to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0); // set time to 00:00:00 to compare only the date part

  disabledDays.forEach((range) => {
    if (!range.from || !range.to) return;

    let currentDate = new Date(range.from); //the from date of the range
    const endDate = new Date(range.to); //the to date of the range.

    //loop continues until currentDate is greater than endDate
    while (currentDate <= endDate) {
      //This ensures that only future or current dates are marked as disabled, while past dates are ignored.
      if (currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      //If the currentDate is today or in the future, it is converted to an ISO string and split to extract the YYYY-MM-DD format
      //This dateString is added to the disabledDates object with a value of true, marking that date as disabled.
      const dateString = currentDate.toISOString().split("T")[0];
      disabledDates[dateString] = true;
      // // +1 is to increment the current date by one day in each iteration of the loop.
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return disabledDates;
};

export function calculateDaysBetween({
  checkIn,
  checkOut,
}: {
  checkIn: Date;
  checkOut: Date;
}) {
  // Calculate the difference in milliseconds
  const diffInMs = Math.abs(checkOut.getTime() - checkIn.getTime());

  // Convert the difference in milliseconds to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays;
}
