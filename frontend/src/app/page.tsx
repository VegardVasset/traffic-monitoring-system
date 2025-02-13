"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const Homepage: React.FC = () => {
  const cardData = [
    {
      title: "Ferry Passenger Counting",
      description: "Monitor real-time ferry passenger counts and optimize boarding efficiency."
    },
    {
      title: "Tire Condition Monitoring",
      description: "Ensure road safety with automatic tire inspections and alerts."
    },
    {
      title: "Traffic Flow Analytics",
      description: "Gain insights into vehicle traffic patterns for improved traffic management."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to the Traffic Monitoring Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Efficient, real-time insights into traffic patterns, vehicle monitoring, and ferry passenger counts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardData.map(({ title, description }) => (
          <Card key={title}>
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
              <p className="text-gray-500 mb-4">{description}</p>
              <Button>Learn More</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <motion.div className="mt-12 text-center" whileHover={{ scale: 1.05 }}>
        <Button className="px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-xl shadow-lg">
          Explore Dashboard
        </Button>
      </motion.div>
    </div>
  );
};

export default Homepage;
