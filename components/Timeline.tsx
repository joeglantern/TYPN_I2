"use client"

import { motion } from "framer-motion"

const timelineEvents = [
  {
    year: 2010,
    title: "TYPNI Founded",
    description: "TYPNI was established with the vision of connecting young people globally.",
  },
  {
    year: 2015,
    title: "Global Youth Summit Launched",
    description: "Our flagship annual event bringing together young leaders from around the world.",
  },
  {
    year: 2018,
    title: "Digital Skills Initiative",
    description: "Launched a program to equip youth with essential tech skills for the future.",
  },
  {
    year: 2020,
    title: "Virtual Collaboration Platform",
    description: "Developed an online platform for youth to collaborate on global projects.",
  },
  {
    year: 2023,
    title: "Climate Action Program",
    description: "Initiated a global youth-led program to combat climate change.",
  },
]

export default function Timeline() {
  return (
    <div className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary"></div>
      {timelineEvents.map((event, index) => (
        <motion.div
          key={event.year}
          className={`flex items-center mb-8 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
          initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
        >
          <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
            <h3 className="text-2xl font-bold mb-2">{event.year}</h3>
            <h4 className="text-xl font-semibold mb-2">{event.title}</h4>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
          <div className="w-2/12 flex justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          <div className="w-5/12"></div>
        </motion.div>
      ))}
    </div>
  )
}

