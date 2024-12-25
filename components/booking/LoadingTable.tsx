//Loading action page
import { Skeleton } from "../ui/skeleton";

function LoadingTable({ rows }: { rows?: number }) {
  //generate an array of rows number of elements (or 5 if no rows prop is passed).
  //(_, i) : The second argument is a mapping function that is called for each element being created in the new array
  //_ : represents the element of the array being created (as a placeholder)
  //i: This is the index of the current element in the array. It starts from 0 and increments by 1 for each subsequent element.
  const tableRows = Array.from({ length: rows || 5 }, (_, i) => {
    return (
      <div className="mb-4" key={i}>
        <Skeleton className="w-full h-8 rounded" />
      </div>
    );
  });
  return <>{tableRows}</>;
}
export default LoadingTable;
