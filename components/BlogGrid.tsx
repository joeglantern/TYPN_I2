"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const blogPosts = [
  {
    title: "Youth-Led Climate Initiatives Making a Difference",
    excerpt: "Discover how young activists are leading the charge in environmental conservation and sustainability.",
    image: "/placeholder.svg",
    date: "2023-05-15",
    slug: "youth-led-climate-initiatives",
  },
  {
    title: "The Power of Cross-Cultural Exchange in a Digital Age",
    excerpt: "Exploring the impact of virtual cultural exchanges on fostering global understanding among youth.",
    image: "/placeholder.svg",
    date: "2023-05-10",
    slug: "cross-cultural-exchange-digital-age",
  },
  {
    title: "Innovative Solutions from Young Entrepreneurs",
    excerpt: "Highlighting the creative business ideas and social enterprises launched by TYPNI members.",
    image: "/placeholder.svg",
    date: "2023-05-05",
    slug: "innovative-solutions-young-entrepreneurs",
  },
  {
    title: "Mental Health Awareness: Breaking the Stigma",
    excerpt:
      "How young people are leading conversations and initiatives to support mental health in their communities.",
    image: "/placeholder.svg",
    date: "2023-04-30",
    slug: "mental-health-awareness-breaking-stigma",
  },
  {
    title: "The Future of Work: Skills Young People Need",
    excerpt:
      "Insights into the evolving job market and the skills that will be crucial for the next generation of professionals.",
    image: "/placeholder.svg",
    date: "2023-04-25",
    slug: "future-of-work-skills",
  },
  {
    title: "Voices of Change: Youth Activists Making Headlines",
    excerpt: "Profiles of inspiring young activists who are driving social and political change around the world.",
    image: "/placeholder.svg",
    date: "2023-04-20",
    slug: "voices-of-change-youth-activists",
  },
]

export default function BlogGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogPosts.map((post, index) => (
        <motion.div
          key={post.slug}
          className="bg-card rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-muted-foreground mb-4">{post.excerpt}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{post.date}</span>
              <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">
                Read more
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

