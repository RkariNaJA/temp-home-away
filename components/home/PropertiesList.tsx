// Go through the list and for every item going to render a property cart
import PropertyCard from "../card/PropertyCard";
import type { PropertyCardProps } from "@/utils/types";

export default function PropertiesList({
  properties,
}: {
  properties: PropertyCardProps[];
}) {
  return (
    <section className="mt-4 gap-8 grid sm:grid-cols-2  lg:grid-cols-3  xl:grid-cols-4">
      {properties.map((property) => {
        return <PropertyCard key={property.id} property={property} />; //passing  all  Property into PropertyCard
      })}
    </section>
  );
}
