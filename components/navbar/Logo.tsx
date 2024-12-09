import Link from "next/link";
import { LuTent } from "react-icons/lu";
import { Button } from "../ui/button";

export default function Logo() {
  return (
    //To see the link not the Button
    <Button size="icon" asChild>
      <Link href="/">
        <LuTent className="w-6 h-6" />
      </Link>
    </Button>
  );
}
