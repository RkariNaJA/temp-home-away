//Display the booking user has made
import EmptyList from "@/components/home/EmptyList";
import CountryFlagAndName from "@/components/card/CountryFlagAndName";
import Link from "next/link";

import { formatDate, formatCurrency } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import FormContainer from "@/components/form/FormContainer";
import { IconButton } from "@/components/form/Buttons";
import { fetchBookings, deleteBookingAction } from "@/utils/actions";

async function BookingsPage() {
  const bookings = await fetchBookings(); //Get booking data from database
  if (bookings.length === 0) {
    return <EmptyList />;
  }
  return (
    <div className="mt-16">
      {/* showcase how many booking in total */}
      <h4 className="mb-4 capitalize">total bookings : {bookings.length}</h4>
      <Table>
        <TableCaption>A list of your recent bookings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Property Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Nights</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            //Data from booking database
            const { id, orderTotal, totalNights, checkIn, checkOut } = booking;
            //Data from property database
            const { id: propertyId, name, country } = booking.property;
            const startDate = formatDate(checkIn);
            const endDate = formatDate(checkOut);
            return (
              <TableRow key={id}>
                {/* Link back to property */}
                <TableCell>
                  <Link
                    href={`/properties/${propertyId}`}
                    className="underline text-muted-foreground tracking-wide"
                  >
                    {name}
                  </Link>
                </TableCell>
                {/* Country name and flag */}
                <TableCell>
                  <CountryFlagAndName countryCode={country} />
                </TableCell>
                {/* Total night of staying */}
                <TableCell>{totalNights}</TableCell>
                {/* Total price */}
                <TableCell>{formatCurrency(orderTotal)}</TableCell>
                {/* checkIn */}
                <TableCell>{startDate}</TableCell>
                {/*checkOut*/}
                <TableCell>{endDate}</TableCell>
                {/*Delete button*/}
                <TableCell>
                  <DeleteBooking bookingId={id} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function DeleteBooking({ bookingId }: { bookingId: string }) {
  //To pass bookingId to the deleteBookingAction function
  const deleteBooking = deleteBookingAction.bind(null, { bookingId });
  return (
    <FormContainer action={deleteBooking}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
}

export default BookingsPage;
