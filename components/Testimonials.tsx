"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Global Youth Summit Participant",
    quote:
      "The Global Youth Summit was a life-changing experience. I met incredible young leaders from around the world and gained the confidence to make a difference in my community.",
    image: "/placeholder.svg",
  },
  {
    name: "Carlos Rodriguez",
    role: "Digital Skills Workshop Graduate",
    quote:
      "Thanks to TYPNI's Digital Skills Workshop, I learned coding and landed my dream job in tech. The skills I gained have opened up so many opportunities for me.",
    image: "/placeholder.svg",
  },
  {
    name: "Aisha Patel",
    role: "Environmental Action Program Leader",
    quote:
      "Leading a local initiative through TYPNI's Environmental Action Program has shown me the power of youth-driven change. We've made a real impact in our community's sustainability efforts.",
    image: "/placeholder.svg",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Success Stories</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-card p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

