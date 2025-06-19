import Link from 'next/link';
import Image from 'next/image'; // <-- Add this import

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/trifle.jpg" // Make sure this file exists in your public folder
          alt="Background"
          fill
          className="object-cover"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 text-white">
        <h1 className="text-4xl font-bold mb-6">Fintech Management System</h1>
        <p className="text-lg mb-8 text-center max-w-2xl">
          A comprehensive solution for managing customers, accounts, and financial transactions.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/login"
            className="bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}    