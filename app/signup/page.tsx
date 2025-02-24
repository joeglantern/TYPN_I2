import SignUpForm from "@/components/SignUpForm"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">Create an Account</h1>
          <p className="text-lg text-center max-w-3xl mx-auto mb-12">
            Join our community and start participating in discussions, events, and more.
          </p>
          <div className="max-w-md mx-auto">
            <SignUpForm />
            <p className="text-center mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
} 