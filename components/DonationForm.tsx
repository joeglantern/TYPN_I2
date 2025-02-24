"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Banknote } from "lucide-react"
import Image from "next/image"

export default function DonationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    paymentMethod: "",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission (e.g., process payment)
    console.log("Donation submitted:", formData)
  }

  // Show/hide phone field based on payment method
  const showPhoneField = formData.paymentMethod === "mpesa"

  // Simulated fundraising progress
  const goalAmount = 100000
  const raisedAmount = 75000

  return (
    <motion.div
      className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="amount">Donation Amount ($)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            required
            min="1"
            step="1"
            value={formData.amount}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit-card">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </div>
              </SelectItem>
              <SelectItem value="bank-transfer">
                <div className="flex items-center">
                  <Banknote className="w-4 h-4 mr-2" />
                  Bank Transfer
                </div>
              </SelectItem>
              <SelectItem value="mpesa">
                <div className="flex items-center">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 mr-2 text-[#4CAF50]" 
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 17.5h-2v-6h2v6zm4 0h-2v-6h2v6zm.5-8.5c0 .552-.448 1-1 1h-5c-.552 0-1-.448-1-1v-2c0-.552.448-1 1-1h5c.552 0 1 .448 1 1v2z"/>
                  </svg>
                  M-Pesa
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {showPhoneField && (
          <div>
            <Label htmlFor="phone">M-Pesa Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g., 254712345678"
              required={showPhoneField}
              value={formData.phone}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your M-Pesa registered phone number starting with country code (254)
            </p>
          </div>
        )}
        <Button type="submit" className="w-full">
          Donate Now
        </Button>
      </form>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Fundraising Progress</h3>
        <Progress value={(raisedAmount / goalAmount) * 100} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          ${raisedAmount.toLocaleString()} raised of ${goalAmount.toLocaleString()} goal
        </p>
      </div>
    </motion.div>
  )
}

