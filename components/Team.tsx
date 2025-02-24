"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const teamMembers = [
  {
    name: "Jane Doe",
    title: "Founder & CEO",
    image: "/placeholder.svg",
    bio: "Jane has been passionate about youth empowerment for over a decade.",
  },
  {
    name: "John Smith",
    title: "Chief Operations Officer",
    image: "/placeholder.svg",
    bio: "John brings years of experience in non-profit management to TYPNI.",
  },
  {
    name: "Emily Chen",
    title: "Program Director",
    image: "/placeholder.svg",
    bio: "Emily leads our global initiatives with creativity and dedication.",
  },
  {
    name: "Michael Johnson",
    title: "Technology Lead",
    image: "/placeholder.svg",
    bio: "Michael ensures our digital platforms are cutting-edge and user-friendly.",
  },
]

export default function Team() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="bg-card p-6 rounded-lg shadow-lg text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Image
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
              <h4 className="text-primary mb-2">{member.title}</h4>
              <p className="text-muted-foreground">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

