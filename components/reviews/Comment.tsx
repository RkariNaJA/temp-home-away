//Comment from user
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Comment({ comment }: { comment: string }) {
  // By default text will be hidden
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  //Check comment length
  const longComment = comment.length > 130;
  //Will display the short comment version or the full comment version
  const displayComment =
    longComment && !isExpanded ? `${comment.slice(0, 130)}...` : comment;

  return (
    <div>
      <p className="text-sm">{displayComment}</p>
      {longComment && (
        <Button
          variant="link"
          className="pl-0 text-muted-foreground"
          onClick={toggleExpanded}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
      )}
    </div>
  );
}
