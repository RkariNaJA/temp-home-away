import countries from "world-countries";

export const formattedCountries = countries.map((item) => ({
  code: item.cca2,
  name: item.name.common,
  flag: item.flag,
  location: item.latlng,
  region: item.region,
}));

//Find country based on the country code

export const findCountryByCode = (code: string) =>
  formattedCountries.find((item) => item.code === code);
