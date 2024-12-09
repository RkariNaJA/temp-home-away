//Map that show the current location that user hosted
"use client";
import { findCountryByCode } from "@/utils/countries";
import CountryFlagAndName from "../card/CountryFlagAndName";
import Title from "./Title";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";

//From docs
const iconUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";

//From docs
const markerIcon = icon({
  iconUrl: iconUrl,
  iconSize: [20, 30],
});

export default function PropertyMap({ countryCode }: { countryCode: string }) {
  //Default location set by libary
  const defaultLocation = [51.505, -0.09] as [number, number];
  //Our location
  const location = findCountryByCode(countryCode)?.location as [number, number];

  return (
    <div className="mt-4">
      <div className="mb-4">
        <Title text="Where you will be staying" />
        <CountryFlagAndName countryCode={countryCode} />
      </div>
      <MapContainer
        className="h-[50vh] rounded-lg relative z-0"
        scrollWheelZoom={false}
        zoomControl={false}
        center={location || defaultLocation}
        zoom={7}
      >
        {/* Coming from the docs */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <Marker
          position={location || defaultLocation}
          icon={markerIcon}
        ></Marker>
      </MapContainer>
    </div>
  );
}
