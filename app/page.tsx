import CategoriesList from "@/components/home/CategoriesList";
import PropertiesContainer from "@/components/home/PropertiesContainer";
import LoadingCards from "@/components/card/LoadingCards";
import { Suspense } from "react"; //used to handle the loading state of components that might not be immediately ready to render

async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }; //We get params from the category icon and the search bar
}) {
  // console.log(searchParams);
  const { category, search } = await searchParams; // use await to fix error in console [`searchParams` should be awaited before using its properties]
  return (
    <section>
      <CategoriesList category={category} search={search} />
      {/* The fallback prop specifies what should be displayed while the component is waiting for asynchronous data to load */}
      {/* In this case, fallback={<LoadingCards />} means that while the PropertiesContainer is waiting for the necessary data, 
      the LoadingCards component will be rendered instead. */}

      <Suspense fallback={<LoadingCards />}>
        <PropertiesContainer category={category} search={search} />
      </Suspense>
    </section>
  );
}
export default HomePage;
