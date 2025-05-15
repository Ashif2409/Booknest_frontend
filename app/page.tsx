import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, BookText, Users, Award } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          <span>LibraryHub</span>
        </h1>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Digital Library Management Solution</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Discover, borrow, and manage books with ease. Join our community of readers today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Get Started
              </Button>
            </Link>
            <Link href="/books">
              <Button size="lg" variant="outline">
                Browse Books
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
            <BookText className="h-12 w-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Extensive Collection</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Access thousands of books across various genres and languages.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
            <Users className="h-12 w-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Issue, return, and request books with just a few clicks.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
            <Award className="h-12 w-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Top Recommendations</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Discover popular books based on user activity and ratings.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-slate-100 dark:bg-slate-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-300">
            © {new Date().getFullYear()} LibraryHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
