// src/components/Navbar.jsx
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './ui/Logo'
import ContactForm from './ContactForm'
import {useNavigate} from 'react-router-dom'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const navigate = useNavigate()

  const handleContactClick = (e) => {
    e.preventDefault()
    setFormOpen(true)
    setIsOpen(false) // Close mobile menu if open
  }

  const handleCloseForm = () => {
    setFormOpen(false)
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Only */}
            <a href='/'>
              <div className="flex items-center">
                <Logo />
              </div>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a 
                href="#contact" 
                onClick={handleContactClick}
                className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer"
              >
                Contact
              </a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
              >
                Start Building
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Features</a>
                <a 
                  href="#contact" 
                  onClick={handleContactClick}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  Contact
                </a>
                <div className="flex flex-col space-y-2 px-3 pt-4">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsOpen(false);
                    }} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-center transition-colors duration-200"
                  >
                    Start Building
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={formOpen} 
        onClose={handleCloseForm} 
      />
    </>
  )
}

export default Navbar
