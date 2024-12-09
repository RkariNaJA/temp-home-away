//To display the country flag and name
import { findCountryByCode } from "@/utils/countries";

function CountryFlagAndName({ countryCode }: { countryCode: string }) {
  //Find country based on the country code using findCountryByCode function
  const validCountry = findCountryByCode(countryCode)!; // !  tells the TypeScript compiler to assume that the value being accessed will never be null or undefined
  //Check the length of the country
  const countryName =
    validCountry!.name.length > 20
      ? `${validCountry!.name.substring(0, 20)}...`
      : validCountry!.name;
  return (
    <span className="flex justify-between items-center gap-2 text-sm ">
      {validCountry.flag} {countryName}
    </span>
  );
}
export default CountryFlagAndName;
