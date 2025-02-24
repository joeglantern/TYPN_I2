"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "./ui/button"

const news = [
  {
    title: "TYPNI Launches New Mentorship Program",
    excerpt: "Connecting young professionals with industry leaders for career guidance and support.",
    image: "/placeholder.svg",
    link: "/blog/mentorship-program",
  },
  {
    title: "Youth-Led Climate Initiative Gains Momentum",
    excerpt: "TYPNI members spearhead innovative solutions to combat climate change in their communities.",
    image: "/placeholder.svg",
    link: "/blog/climate-initiative",
  },
  {
    title: "Global Youth Summit 2023: Registration Now Open",
    excerpt: "Don't miss out on this year's biggest youth empowerment event. Register now!",
    image: "/placeholder.svg",
    link: "/blog/youth-summit-2023",
  },
]

export default function LatestNews() {
  return (
    <section className="py-16 bg-muted">
      <div className="container">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Latest News
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.div
              key={item.title}
              className="bg-card rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={item.link}>
                    Read more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

