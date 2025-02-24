"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"

type StatusStep = {
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming' | 'rejected'
}

const steps: StatusStep[] = [
  {
    title: "Application Submitted",
    description: "Your application has been received",
    status: 'completed'
  },
  {
    title: "Under Review",
    description: "Our team is reviewing your application",
    status: 'upcoming'
  },
  {
    title: "Final Decision",
    description: "Your application has been reviewed",
    status: 'upcoming'
  },
  {
    title: "Welcome to TYPNI",
    description: "You are now a member",
    status: 'upcoming'
  }
]

export function MembershipStatus({ currentStatus }: { currentStatus: string }) {
  // Get step description based on status
  const getStepDescription = (index: number): string => {
    if (currentStatus === 'rejected' && index === 2) {
      return "Your application was not approved at this time";
    }
    if (currentStatus === 'approved') {
      if (index === 2) {
        return "Congratulations! Your application has been approved";
      }
      if (index === 3) {
        return "Please check your email for next steps and login details";
      }
    }
    return steps[index].description;
  }

  // Map the database status to step statuses
  const getStepStatus = (index: number): StatusStep['status'] => {
    if (currentStatus === 'rejected') {
      return index === 0 ? 'completed' : 
             index === 1 ? 'completed' : 
             index === 2 ? 'rejected' : 
             'upcoming';
    }

    switch (currentStatus) {
      case 'pending':
        return index === 0 ? 'completed' : index === 1 ? 'current' : 'upcoming';
      case 'reviewing':
        return index <= 1 ? 'completed' : index === 2 ? 'current' : 'upcoming';
      case 'approved':
        return index <= 3 ? 'completed' : 'upcoming';
      case 'active':
        return 'completed';
      default:
        return 'upcoming';
    }
  }

  const getStatusIcon = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-8 h-8 text-primary" />;
      case 'current':
        return <Clock className="w-8 h-8 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-300" />;
    }
  }

  const getStatusColor = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-primary';
      case 'current':
        return 'bg-blue-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-[2.25rem] top-0 h-full w-px bg-gray-200" />

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            return (
              <motion.div
                key={step.title}
                className="relative flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                {/* Step Icon */}
                <motion.div
                  className="relative z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.2 + 0.1
                  }}
                >
                  {getStatusIcon(status)}
                </motion.div>

                {/* Step Content */}
                <div className="ml-4 min-w-0 flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.2 }}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {getStepDescription(index)}
                    </p>
                  </motion.div>

                  {/* Progress Bar */}
                  {status === 'current' && (
                    <motion.div
                      className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                    >
                      <motion.div
                        className={`h-full ${getStatusColor(status)}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "60%" }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 