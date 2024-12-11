//Displayed in the property details page or display in the in the card
// inPage = display in the property details page
import { fetchPropertyRating } from "@/utils/actions";
import { FaStar } from "react-icons/fa";

export default async function PropertyRating({
  propertyId,
  inPage,
}: {
  propertyId: string;
  inPage: boolean;
}) {
  // temp
  // const rating = 4.7;
  // const count = 100;
  const { rating, count } = await fetchPropertyRating(propertyId);
  if (count === 0) return null;
  const className = `flex gap-1 items-center ${inPage ? "text-md" : "text-xs"}`; //Display component inPage or in cart
  const countText = count > 1 ? "reviews" : "review";
  const countValue = `(${count}) ${inPage ? countText : ""}`;
  return (
    <span className={className}>
      <FaStar className="w-3 h-3" />
      {rating} {countValue}
    </span>
  );
}
