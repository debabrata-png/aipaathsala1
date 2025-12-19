// src/components/Footer.jsx
import Logo from "./ui/Logo"

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Column 1: Logo + Title */}
          <div className="flex flex-col items-start space-y-3">
            <Logo />
            <p className="text-sm text-gray-600">
              Empowering educational institutions <br /> with cutting-edge
              technology solutions.
            </p>
          </div>

          {/* Column 2: Contact Us */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Contact Us</h3>
            <p className="text-sm text-gray-600">support@campus.technology</p>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-800">Bengaluru Office:</strong> 2JJJ+56G, Service Rd, HBR
              Layout 4th Block, Bengaluru, Karnataka 560048
            </p>
          </div>
        </div>
        {/* Bottom divider */}
        <div className="mt-12 border-t border-gray-200 pt-4 flex justify-center text-sm text-gray-500">
          <p>© 2025 aipaathsala - All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}
