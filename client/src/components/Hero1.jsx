// src/components/Hero.jsx
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
    const navigate = useNavigate()
  return (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            🚀 Trusted by 30+ Educational Institutions
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI classroom and collaboration tool{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              platform for faculties
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Conduct Classes and Take assessment using automatic ai tool. Connect with others faculties for joint project an publications
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <button 
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center text-lg font-semibold transition-colors duration-200"
            >
              Start Building
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">3K+</div>
              <div className="text-gray-600">Faculty Connect</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">90K+</div>
              <div className="text-gray-600">Students Benefited</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">13</div>
              <div className="text-gray-600">In A/A+/A++ Tier</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
