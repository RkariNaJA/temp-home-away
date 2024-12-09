import { categories } from "@/utils/categories";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Link from "next/link";

//Combine search query param with the category
export default function CategoriesList({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  const searchTerm = search ? `&search=${search}` : ""; //use this value whenever user click on the category
  return (
    <section>
      <ScrollArea className="py-6">
        <div className="flex gap-x-4">
          {categories.map((item) => {
            const isActive = item.label === category; //category = props.category form the params
            return (
              <Link
                key={item.label}
                href={`/?category=${item.label}${searchTerm}`} //Navigate to the specigic category
              >
                <article
                  className={`p-3 flex flex-col items-center cursor-pointer duration-300  hover:text-primary w-[100px] ${
                    isActive ? "text-primary" : "" //Control the color
                  }`}
                >
                  <item.icon className="w-8 h-8 " />
                  <p className="capitalize text-sm mt-1">{item.label}</p>
                </article>
              </Link>
            );
          })}
        </div>
        {/*ScrollBar for small screen */}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
