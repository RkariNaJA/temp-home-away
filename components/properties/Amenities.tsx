import { Amenity } from "@/utils/amenities";
import { LuFolderCheck } from "react-icons/lu";
import Title from "./Title";

// Use .every() when you want to check if all elements meet a condition (and return a true/false result).

// Use .map() when you want to create a new array based on transformations applied to each element in the original array.

export default function Amenities({ amenities }: { amenities: string }) {
  //Get amenities data from database
  const amenitiesList: Amenity[] = JSON.parse(amenities as string);
  //Check if any amenity has been selected
  const noAmenities = amenitiesList.every((amenity) => !amenity.selected);
  return (
    <div className="mt-4">
      <Title text="What this place offers" />
      <div className="grid md:grid-cols-2 gap-x-4">
        {/* Check and Display all amenity that have been selected */}
        {amenitiesList.map((amenity) => {
          if (!amenity.selected) {
            return null;
          }
          return (
            <div key={amenity.name} className="flex items-center gap-x-4 mb-2 ">
              <LuFolderCheck className="h-6 w-6 text-primary" />
              <span className="font-light text-sm capitalize">
                {amenity.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
