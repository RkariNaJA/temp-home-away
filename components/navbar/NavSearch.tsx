/*IMP Page */
//Grab the query params from the URL and every time user type something.
//navigate the user back to the home page. with the new query params
"use client";
import { Input } from "../ui/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // Allow running some functionality with delay
import { useState, useEffect } from "react";

export default function NavSearch() {
  const searchParams = useSearchParams(); //Access search params and manipulate query parameters from the URL.

  const pathname = usePathname(); //to get the current URL
  const { replace } = useRouter(); // use replace to navigate back to home page
  const [search, setSearch] = useState(
    //dafault value comes from the URL
    //"search" come from the URL when user type in the NavSearch bar
    searchParams.get("search")?.toString() || ""
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    //Get all of the params
    //Provides methods to read, manipulate, and work with query parameters.
    const params = new URLSearchParams(searchParams);
    //Check if anything has been provided
    if (value) {
      params.set("search", value); // Combine the search param to all of default params
    } else {
      params.delete("search");
    }
    replace(`/?${params.toString()}`); //Navigate back to home page with the final params that has been combined
  }, 300); //update the query parameters in the URL every 300ms.
  useEffect(() => {
    //Check if there anything in the URL parameter
    if (!searchParams.get("search")) {
      setSearch("");
    }
  }, [searchParams.get("search")]);
  return (
    <Input
      type="text"
      placeholder="Find a Property..."
      className="max-w-xs datk:bg-muted"
      onChange={(e) => {
        setSearch(e.target.value);
        handleSearch(e.target.value);
      }}
      value={search}
    />
  );
}
