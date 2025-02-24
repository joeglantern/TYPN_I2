"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const programs = [
  {
    title: "Global Youth Summit",
    description:
      "Annual conference bringing together young leaders from around the world to discuss global issues and collaborate on solutions.",
    image: "/placeholder.svg",
  },
  {
    title: "Digital Skills Workshop",
    description:
      "Equipping youth with essential tech skills for the future, including coding, data analysis, and digital marketing.",
    image: "/placeholder.svg",
  },
  {
    title: "Environmental Action Program",
    description:
      "Empowering youth to tackle climate change in their communities through local initiatives and global collaboration.",
    image: "/placeholder.svg",
  },
  {
    title: "Youth Entrepreneurship Incubator",
    description:
      "Supporting young entrepreneurs in developing and launching innovative business ideas with social impact.",
    image: "/placeholder.svg",
  },
  {
    title: "Cross-Cultural Exchange Program",
    description:
      "Fostering understanding and cooperation between youth from different cultures through virtual and in-person exchanges.",
    image: "/placeholder.svg",
  },
  {
    title: "Mental Health Awareness Campaign",
    description:
      "Promoting mental health awareness and providing resources for youth to support their well-being and that of their peers.",
    image: "/placeholder.svg",
  },
]

export default function ProgramGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {programs.map((program, index) => (
        <motion.div
          key={program.title}
          className="bg-card p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Image
            src={program.image || "/placeholder.svg"}
            alt={program.title}
            width={400}
            height={300}
            className="rounded-lg mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
          <p className="text-muted-foreground">{program.description}</p>
        </motion.div>
      ))}
    </div>
  )
}

