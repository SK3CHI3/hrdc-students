import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-green-bg to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-jungle-green-dark">HR Student Organisation</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-jungle-green hover:text-jungle-green-dark font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-jungle-green hover:bg-jungle-green-dark text-white px-4 py-2 rounded-lg transition"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Unified Repository of{' '}
            <span className="text-jungle-green">HR Students</span> in Kenya
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the largest network of Human Resource students across Kenyan universities and colleges. 
            Get your unique student code and connect with fellow HR professionals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-jungle-green hover:bg-jungle-green-dark text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-gray-50 text-jungle-green-dark border-2 border-jungle-green px-8 py-4 rounded-lg text-lg font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-jungle-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-jungle-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Student Registration</h3>
            <p className="text-gray-600">
              Register with your details and get a unique student code for all official communications.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-jungle-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-jungle-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Verification</h3>
            <p className="text-gray-600">
              Secure your account with email verification before accessing your student portal.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-jungle-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-jungle-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Institution Network</h3>
            <p className="text-gray-600">
              Connect with HR students from universities and colleges across Kenya.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} HR Student Organisation Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}