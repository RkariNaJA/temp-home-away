"use client";
import { useState } from "react";
import { amenities, Amenity } from "@/utils/amenities";
import { Checkbox } from "@/components/ui/checkbox";

export default function AmenitiesInput({
  defaultValue,
}: {
  defaultValue?: Amenity[];
}) {
  // The icon is not saved in database
  //defaultValue = property.amenities : amenities that were saved in database with no icon
  //amenities = Amenity[] that havent been saved in database with icon
  const amenitiesWithIcons = defaultValue?.map(({ name, selected }) => ({
    name,
    selected,
    //To match the name of amenities and the name of property.amenities to get the icon
    icon: amenities.find((amenity) => amenity.name === name)!.icon, //The result will always be non-null
  }));

  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>(
    amenitiesWithIcons || amenities
  );

  //Toggle the check box for each Amenity
  /***********/
  const handleChange = (amenity: Amenity) => {
    setSelectedAmenities((prev) => {
      //Represents the list of amenities
      return prev.map((a) => {
        //This means you want to toggle the selected state of that amenity
        if (a.name === amenity.name) {
          //Done by creating a new object with the spread operator and then toggling the selected property (selected: !a.selected).
          //!a.selected: negates the current selected state. If it was true, it becomes false
          return { ...a, selected: !a.selected };
        }
        //If the name doesn’t match, it simply returns the original amenity a without any modification
        return a;
      });
    });
  };
  return (
    <section>
      <input
        type="hidden"
        name="amenities"
        value={JSON.stringify(selectedAmenities)}
      />
      <div className="grid grid-cols-2 gap-4">
        {selectedAmenities.map((amenity) => (
          <div key={amenity.name} className="flex items-center space-x-2">
            <Checkbox
              id={amenity.name}
              checked={amenity.selected}
              onCheckedChange={() => handleChange(amenity)}
            />
            <label
              htmlFor={amenity.name}
              className="text-sm font-medium leading-none capitalize flex gap-x-2 items-center"
            >
              {amenity.name}
              <amenity.icon className="w-4 h-4" />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
