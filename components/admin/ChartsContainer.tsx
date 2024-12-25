//fetch the Charts
import { fetchChartsData } from "@/utils/actions";
import Chart from "./Chart";

export default async function ChartsContainer() {
  const booking = await fetchChartsData();
  if (booking.length < 1) {
    return null;
  }
  return <Chart data={booking} />;
}
