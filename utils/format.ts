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
