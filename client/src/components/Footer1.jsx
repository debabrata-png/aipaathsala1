// src/components/Footer.jsx
import Logo from "./ui/Logo"

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Logo + Title */}
          <div className="flex flex-col items-start space-y-3">
            <Logo />
            <p className="text-sm text-gray-600">
              Empowering educational institutions <br /> with cutting-edge
              technology solutions.
            </p>
          </div>

          {/* Column 2: Resources */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#0" className="text-gray-600 transition hover:text-indigo-600">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#0" className="text-gray-600 transition hover:text-indigo-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#0" className="text-gray-600 transition hover:text-indigo-600">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://campustechnology.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 transition hover:text-indigo-600"
                >
                  Campus Technology
                </a>
              </li>
              <li>
                <a
                  href="https://ctapp.netlify.app/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 transition hover:text-indigo-600"
                >
                  CourseHub
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Contact Us</h3>
            <p className="text-sm text-gray-600">support@campus.technology</p>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-800">Bengaluru Office:</strong> 2JJJ+56G, Service Rd, HBR
              Layout 4th Block, Bengaluru, Karnataka 560048
            </p>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-800">Kolkata Office:</strong> Campus Technology, Godrej
              Waterside, Tower 2, 12th floor, Sector 5
            </p>
            <div className="flex gap-4 mt-2">
              {/* Social Links */}
              <a href="#0" className="text-gray-500 hover:text-indigo-600 transition-colors" aria-label="Facebook">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988h-2.54v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33V21.88C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#0" className="text-gray-500 hover:text-indigo-600 transition-colors" aria-label="LinkedIn">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M4.98 3.5C3.34 3.5 2 4.84 2 6.48s1.34 2.98 2.98 2.98c1.63 0 2.97-1.34 2.97-2.98S6.61 3.5 4.98 3.5zM2.4 21h5.16V9H2.4v12zm7.44-12h4.96v1.67h.07c.69-1.31 2.37-2.7 4.88-2.7 5.22 0 6.18 3.44 6.18 7.91V21h-5.16v-6.49c0-1.55-.03-3.55-2.16-3.55-2.16 0-2.49 1.68-2.49 3.42V21H9.84V9z" />
                </svg>
              </a>
              <a href="#0" className="text-gray-500 hover:text-indigo-600 transition-colors" aria-label="Twitter">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14.86 4.48 4.48 0 0 0 1.95-2.48 9.9 9.9 0 0 1-3.13 1.2A4.92 4.92 0 0 0 16.5 2c-2.73 0-4.94 2.21-4.94 4.94 0 .39.04.77.13 1.14A13.96 13.96 0 0 1 1.64 3.16a4.93 4.93 0 0 0-.67 2.48c0 1.71.87 3.22 2.2 4.1a4.9 4.9 0 0 1-2.24-.62v.06c0 2.39 1.7 4.38 3.95 4.83a4.93 4.93 0 0 1-2.23.08 4.94 4.94 0 0 0 4.6 3.42A9.87 9.87 0 0 1 1 19.54a13.86 13.86 0 0 0 7.5 2.2c9.05 0 14-7.5 14-14 0-.21 0-.42-.02-.63A10.06 10.06 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#0" className="text-gray-500 hover:text-indigo-600 transition-colors" aria-label="Instagram">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.16c3.2 0 3.584.012 4.85.07 1.17.054 1.98.24 2.44.403a4.92 4.92 0 0 1 1.78 1.05 4.92 4.92 0 0 1 1.05 1.78c.163.46.35 1.27.403 2.44.058 1.27.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.98-.403 2.44a4.92 4.92 0 0 1-1.05 1.78 4.92 4.92 0 0 1-1.78 1.05c-.46.163-1.27.35-2.44.403-1.27.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.98-.24-2.44-.403a4.92 4.92 0 0 1-1.78-1.05 4.92 4.92 0 0 1-1.05-1.78c-.163-.46-.35-1.27-.403-2.44-.058-1.27-.07-1.65-.07-4.85s.012-3.584.07-4.85c.054-1.17.24-1.98.403-2.44a4.92 4.92 0 0 1 1.05-1.78 4.92 4.92 0 0 1 1.78-1.05c.46-.163 1.27-.35 2.44-.403 1.27-.058 1.65-.07 4.85-.07zm0-2.16C8.71 0 8.292.012 7.027.07 5.76.127 4.88.31 4.12.562a7.13 7.13 0 0 0-2.57 1.33 7.13 7.13 0 0 0-1.33 2.57C.31 5.12.127 6 .07 7.267.012 8.533 0 8.95 0 12s.012 3.467.07 4.733c.057 1.267.24 2.147.562 2.907a7.13 7.13 0 0 0 1.33 2.57 7.13 7.13 0 0 0 2.57 1.33c.76.323 1.64.505 2.907.562 1.266.058 1.684.07 4.733.07s3.467-.012 4.733-.07c1.267-.057 2.147-.24 2.907-.562a7.13 7.13 0 0 0 2.57-1.33 7.13 7.13 0 0 0 1.33-2.57c.323-.76.505-1.64.562-2.907.058-1.266.07-1.684.07-4.733s-.012-3.467-.07-4.733c-.057-1.267-.24-2.147-.562-2.907a7.13 7.13 0 0 0-1.33-2.57 7.13 7.13 0 0 0-2.57-1.33c-.76-.323-1.64-.505-2.907-.562C15.467.012 15.05 0 12 0z" />
                  <circle cx="12" cy="12" r="3.2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="mt-12 border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between text-sm text-gray-500">
          <p>© 2025 Campus Technology - All rights reserved</p>
          <p>Designed by ctTeam</p>
        </div>
      </div>
    </footer>
  )
}
