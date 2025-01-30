"use client";
import { useEffect, useState } from "react";
import { fetchTrafficData } from "./lib/api";
import { Button } from "@/components/ui/button"


export default function Home() {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function loadData() {
            const result = await fetchTrafficData();
            setData(result);
        }
        loadData();
    }, []);

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Traffic Monitoring Dashboard</h1>
        <ul>
          {data.map((item, index) => (
            <li key={index} className="border p-2 mt-2">
              {JSON.stringify(item)}
            </li>
          ))}
        </ul>
        <div>
          <Button>Click me</Button>
        </div>
      </div>
    );
}
