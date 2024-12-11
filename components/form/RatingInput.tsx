//Rating reviews
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RatingInput({
  name,
  labelText,
}: {
  name: string;
  labelText?: string;
}) {
  //Use Array.from to creates a new array from an array-like (In this case creates an array of length 5 with values from 1 to 5)
  //The second argumen is a mapping function, which is applied to each element in the array as it's being created.
  // _ represents the current element (underscore convention to indicate an unused parameter)
  // i is the index of the current element.
  const numbers = Array.from({ length: 5 }, (_, i) => {
    const value = i + 1;
    return value.toString(); // Convert back to string
  }).reverse(); // reverses the order of the elements in an array
  return (
    <div className="mb-2 max-w-xs">
      <Label htmlFor={name} className="capitalize">
        {labelText || name}
      </Label>
      <Select defaultValue={numbers[0]} name={name} required>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {numbers.map((number) => {
            return (
              <SelectItem key={number} value={number}>
                {number}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
