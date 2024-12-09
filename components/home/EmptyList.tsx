//When cannot find any properties on the search bar
import { Button } from "../ui/button";
import Link from "next/link";

export default function EmptyList({
  heading = "No items in the list.",
  message = "Keep exploring our properties.",
  btnText = "back home",
}: {
  heading?: string;
  message?: string;
  btnText?: string;
}) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold ">{heading}</h2>
      <p className="text-lg">{message}</p>
      {/* asChild allows the Button component to render its child component as the
      root element. In this case, it's rendering a Link instead of a default
      button element. */}
      <Button asChild className="mt-4 capitalize" size="lg">
        <Link href="/">{btnText}</Link>
      </Button>
    </div>
  );
}
