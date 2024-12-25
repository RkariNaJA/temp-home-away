//This function Converts a given number (or null) into a formatted string that represents the value as a U.S. dollar amount.
export const formatCurrency = (amount: number | null) => {
  const value = amount || 0;
  // It uses the built-in Intl.NumberFormat to format the number according to the U.S. currency
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

//Run this function for bedrooms, bathrooms, guests and beds
export function formatQuantity(quantity: number, noun: string): string {
  return quantity === 1 ? `${quantity} ${noun}` : `${quantity} ${noun}s`;
}

//For check-in and check-out in the booking page (EX: Result: july 10, 2024)
export const formatDate = (date: Date, onlyMonth?: boolean) => {
  //Intl.DateTimeFormatOptions: used to specify options for formatting a Date
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  if (!onlyMonth) {
    options.day = "numeric";
  }
  //.format() :  formats the provided date according to those options.
  return new Intl.DateTimeFormat("en-US", options).format(date);
};
