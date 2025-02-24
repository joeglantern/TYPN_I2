"use client"

import React, { createContext, useContext, useState } from 'react'

interface TutorialContextType {
  showTutorial: boolean
  setShowTutorial: (show: boolean) => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const TutorialContext = createContext<TutorialContextType>({
  showTutorial: false,
  setShowTutorial: () => {},
  currentStep: 0,
  setCurrentStep: () => {},
})

export const tutorialSteps = [
  {
    title: "Welcome to TYPNI! 👋",
    description: "Let's explore our interactive platform together! We've got some amazing features to show you.",
  },
  {
    title: "Interactive Earth Globes 🌍",
    description: "On our home page, you'll find two interactive 3D Earth globes. Try spinning them around! The first one shows our global presence, and the second visualizes our worldwide connections.",
  },
  {
    title: "AI Blog Reading Assistant 🎧",
    description: "When reading our blog posts, look for the speaker icon. TYPNI AI can read the content aloud for you - perfect for multitasking or accessibility!",
  },
  {
    title: "Real-time Polls 📊",
    description: "Visit our Polls section to make your voice heard! Watch the results update instantly after you vote, and see what others in the community think.",
  },
  {
    title: "Photo Gallery 📸",
    description: "Our Gallery showcases events and activities from around the world. Each image tells a story of impact and change.",
  },
  {
    title: "Programs & Impact 🌟",
    description: "Explore our Programs page to discover youth empowerment initiatives. You can join existing programs or propose new ones!",
  },
  {
    title: "Get Involved! 🤝",
    description: "Ready to make an impact? Join our newsletter, follow us on social media, and become part of our global community of changemakers!",
  }
]

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <TutorialContext.Provider value={{ showTutorial, setShowTutorial, currentStep, setCurrentStep }}>
      {children}
    </TutorialContext.Provider>
  )
}

export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
} 