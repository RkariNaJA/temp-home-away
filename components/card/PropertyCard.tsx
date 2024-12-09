//Display card with all the info
import Image from "next/image";
import Link from "next/link";
import CountryFlagAndName from "./CountryFlagAndName";
import PropertyRating from "./PropertyRating";
import FavoriteToggleButton from "./FavoriteToggleButton";
import { PropertyCardProps } from "@/utils/types";
import { formatCurrency } from "@/utils/format";

export default function PropertyCard({
  property,
}: {
  property: PropertyCardProps;
}) {
  const { name, image, price } = property; //Destructure from the props
  const { country, id: propertyId, tagline } = property; //Destructure from the props
  return (
    //To be able to zoom in by using group
    <article className="group relative">
      {/*Navigate to a single property page */}
      <Link href={`/properties/${propertyId}`}>
        {/* property image */}
        <div className="relative h-[300px] mb-2 overflow-hidden rounded-md">
          <Image
            src={image}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
            alt={name}
            className="rounded-md object-cover transform group-hover:scale-110 transition-transform duration-500" // zoom in using group-hover and adjust the scale
          />
        </div>
        {/* property name */}
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold mt-1">
            {/* To disable a text from spanning in two lines */}
            {name.substring(0, 30)}
          </h3>
          {/* property rating */}
          <PropertyRating inPage={false} propertyId={propertyId} />
        </div>
        {/* property tagline */}
        <p className="text-sm mt-1 text-muted-foreground ">
          {/* To disable a text from spanning in two lines */}
          {tagline.substring(0, 40)}
        </p>
        {/* property price */}
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm mt-1 ">
            <span className="font-semibold">{formatCurrency(price)} </span>
            night
          </p>
          {/* country and flag */}
          <CountryFlagAndName countryCode={country} />
        </div>
      </Link>
      <div className="absolute top-5 right-5 z-5">
        {/* favorite toggle button */}
        <FavoriteToggleButton propertyId={propertyId} />
      </div>
    </article>
  );
}
