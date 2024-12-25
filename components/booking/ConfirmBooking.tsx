//Confirm booking button
"use client";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/utils/store";
import FormContainer from "@/components/form/FormContainer";
import { SubmitButton } from "@/components/form/Buttons";
import { createBookingAction } from "@/utils/actions";

//User must be login
export default function ConfirmBooking() {
  const { userId } = useAuth();
  const { propertyId, range } = useProperty((state) => state);
  const checkIn = range?.from as Date;
  const checkOut = range?.to as Date;

  if (!userId) {
    return (
      <SignInButton mode="modal">
        <Button type="button" className="w-full">
          Sign In to Complete Booking
        </Button>
      </SignInButton>
    );
  }
  //Pass propertyId, checkIn, checkOut, into createBookingAction using bind
  //And navigate to the checkout session
  const createBooking = createBookingAction.bind(null, {
    propertyId,
    checkIn,
    checkOut,
  });
  return (
    <section>
      <FormContainer action={createBooking}>
        <SubmitButton text="Reserve" className="w-full" />
      </FormContainer>
    </section>
  );
}
