import { FaHeart } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { CardSignInButton } from "../form/Buttons";
import { fetchFavoriteId } from "@/utils/actions";
import FavoriteToggleForm from "./FavoriteToggleForm";

async function FavoriteToggleButton({ propertyId }: { propertyId: string }) {
  //Get the userId to see whether the user has logged in or not
  const { userId } = auth();
  if (!userId) {
    return <CardSignInButton />;
  }
  const favoriteId = await fetchFavoriteId({ propertyId });
  return (
    <FavoriteToggleForm favoriteId={favoriteId} propertyId={propertyId} />
    // <Button size="icon" variant="outline" className="p-2 cursor-pointer">
    //   <FaHeart />
    // </Button>
  );
}
export default FavoriteToggleButton;
