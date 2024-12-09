//Description component page
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Title from "./Title";

const Description = ({ description }: { description: string }) => {
  const [isFullDescriptionShown, setIsFullDescriptionShown] = useState(false);

  //To get the amount of words
  const words = description.split(" ");
  //Check if the description is too long
  const isLongDescription = words.length > 100;

  const toggleDescription = () => {
    setIsFullDescriptionShown(!isFullDescriptionShown);
  };

  //Display all description or part of it
  const displayedDescription =
    isLongDescription && !isFullDescriptionShown
      ? //slices the first 100 words from the words array and joins those 100 words into a single string, with each word separated by a space.
        words.slice(0, 100).join(" ") + "..."
      : description;
  return (
    <article className="mt-4">
      <Title text="Description" />
      <p className="text-muted-foreground font-light leading-loose">
        {displayedDescription}
      </p>
      {isLongDescription && (
        <Button variant="link" className="pl-0" onClick={toggleDescription}>
          {isFullDescriptionShown ? "Show less" : "Show more"}
        </Button>
      )}
    </article>
  );
};
export default Description;
