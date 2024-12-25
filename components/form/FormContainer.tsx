"use client";

import { useFormState } from "react-dom";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { actionFunction } from "@/utils/types";

const initialState = {
  message: "",
};
//For managing a form's state, handling its submission, and displaying notifications (toast messages)
//It is flexible and can be used to wrap any form, manage its state, and provide feedback to the user upon submission.
export default function FormContainer({
  action,
  children,
}: {
  action: actionFunction; //handles the form's submission logic
  children: React.ReactNode; //represent the form’s content
}) {
  const [state, formAction] = useFormState(action, initialState); //Looking for action when we click submit buttons;
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({ description: state.message });
    }
  }, [state]);
  //FormAction will be triggered by the form's submit button
  //children  contains the form's content prop which will be passed into the form and rendered inside it
  return <form action={formAction}>{children}</form>;
}
