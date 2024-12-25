//Display charts
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"; //Library for creating a charts

//[Recharts](https://recharts.org/en-US/) for the config

type ChartPropsType = {
  data: {
    date: string;
    count: number;
  }[];
};
//All from Recharts library
export default function Chart({ data }: ChartPropsType) {
  return (
    <section className="mt-24">
      <h1 className="text-4xl font-semibold text-center">Monthly Bookings</h1>
      <ResponsiveContainer width="100%" height={300}>
        {/* This data props need to be in a specific format */}
        <BarChart data={data} margin={{ top: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          {/* Display date(month) on the XAxis */}
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          {/* Display count on the Bar */}
          <Bar dataKey="count" fill="#F97215" barSize={75} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
