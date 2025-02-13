"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Homepage: React.FC = () => {
  const cardData = [
    {
      title: "Ferry Passenger Counting",
      description:
        "Monitor real-time ferry passenger counts and optimize boarding efficiency.",
    },
    {
      title: "Tire Condition Monitoring",
      description: "Ensure road safety with automatic tire inspections and alerts.",
    },
    {
      title: "Traffic Flow Analytics",
      description:
        "Gain insights into vehicle traffic patterns for improved traffic management.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 p-6">
      {/* Fading Header */}
      <header className="text-center max-w-4xl mx-auto py-10">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Welcome to the Traffic Monitoring Dashboard
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Efficient, real-time insights into traffic patterns, vehicle monitoring,
          and ferry passenger counts.
        </motion.p>
      </header>

      {/* Card Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardData.map(({ title, description }) => (
          <motion.div
            key={title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <Card className="w-full hover:shadow-xl transition-shadow bg-white rounded-2xl">
              <CardContent>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  {title}
                </h2>
                <p className="text-gray-500 mb-6">{description}</p>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
