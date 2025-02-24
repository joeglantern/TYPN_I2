import DonationForm from "@/components/DonationForm"

export default function DonatePage() {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">Support Our Mission</h1>
          <p className="text-lg text-center max-w-3xl mx-auto mb-12">
            Your donation helps us empower young people around the world and create positive change in communities.
          </p>
          <DonationForm />
        </div>
      </section>
    </div>
  )
}

