"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Page() {
  // Which card (if any) is expanded
  const [expandedCard, setExpandedCard] = React.useState<number | null>(null);

  // Toggle expand/collapse
  const handleReadMore = (index: number) => {
    setExpandedCard((prev) => (prev === index ? null : index));
  };

  // Card data
  const cardData = [
    {
      title: "Detailed Traffic Statistics (DTS)",
      description:
        "Our DTS solution classifies traffic into 24 distinct categories, offering unparalleled road usage insights.",
      expandedDescription: `
Leveraging advanced algorithms, our solution delivers high-resolution insights 
into the diverse types of traffic traversing the roads. High resolution insight 
into types of traffic on the road. Web portal showing passings and statistics.
      `,
    },
    {
      title: "Ferry Passenger Counting (VPCS)",
      description:
        "Accurately count passengers in moving vehicles with advanced optics and real-time data.",
      expandedDescription: `
Introducing our cutting-edge Vehicle Passenger Counting System (VPCS). 
Special optics to see through car windows. VPCS utilizes advanced technology 
to deliver precise results in real-time. For single-lane, HOV-lanes, one or two 
cameras is needed on only one side of the lane. Multi-camera solution to manage 
two lanes boarding on ferries.
      `,
    },
    {
      title: "Tire Scanner",
      description:
        "On-the-go scanning capabilities at speeds up to 80 km/h for seamless tire inspections.",
      expandedDescription: `
Our Tire Scanner solution transforms tire inspections by delivering 
high-efficiency, on-the-go scanning capabilities. Designed for seamless 
installation and non-invasive to road surfaces, our system enables accurate tire 
inspections at speeds up to 80 km/h, optimizing the inspection process without 
disrupting road integrity. Low cost and easy to install. Can be used as a 
mobile sensor. No need to stop vehicles and gives detailed images of tires. 
Information is given in real-time so vehicles can be stopped for more 
thorough inspections.
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 p-6">
      {/* HERO SECTION */}
      <header className="max-w-4xl mx-auto pt-24 pb-10 flex flex-col items-center text-center">
        {/* Logo (fade in) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Image
            src="/countin-hero-logo-small.webp"
            alt="Counting Hero Logo"
            width={500}
            height={500}
            className="object-contain"
          />
        </motion.div>


        {/* Subheading */}
        <motion.h2
          className="text-2xl text-gray-700 mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Traffic Monitoring Solutions
        </motion.h2>

        {/* Brief description */}
        <motion.p
          className="text-lg text-gray-600 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Real-time insights into traffic patterns, vehicle monitoring, 
          and ferry passenger counts.
        </motion.p>
      </header>

      {/* CARD GRID OR EXPANDED VIEW */}
      <AnimatePresence mode="wait">
        {expandedCard === null ? (
          // --- GRID VIEW ---
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {cardData.map(({ title, description }, index) => (
              <motion.div
                key={title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="w-full hover:shadow-xl transition-shadow bg-white rounded-2xl">
                  <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                      {title}
                    </h2>
                    <p className="text-gray-500 mb-2">{description}</p>
                    <Button
                      onClick={() => handleReadMore(index)}
                      className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // --- EXPANDED VIEW ---
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto"
          >
            {(() => {
              const { title, description, expandedDescription } =
                cardData[expandedCard];
              return (
                <Card className="w-full hover:shadow-xl transition-shadow bg-white rounded-2xl">
                  <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                      {title}
                    </h2>
                    <p className="text-gray-500 mb-2">{description}</p>
                    <div className="text-gray-700 whitespace-pre-line mb-4">
                      {expandedDescription}
                    </div>
                    <Button
                      onClick={() => handleReadMore(expandedCard)}
                      className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Read Less
                    </Button>
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
