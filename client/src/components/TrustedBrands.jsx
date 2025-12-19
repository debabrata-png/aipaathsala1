// src/components/TrustedBrands.jsx
import banglore from "../assets/images/brand/bangaloreUniversity.webp"
import cut from "../assets/images/brand/CUTNone.webp"
import NUJS from "../assets/images/brand/NUJS.webp"
import president from "../assets/images/brand/presidentUniversity.webp"
import stv from "../assets/images/brand/StVCollegeimagesone.webp"

const TrustedBrands = () => {
  const brands = [
    { name: 'Bangalore University', logo: banglore },
    { name: 'Centurion University', logo: cut },
    { name: 'NUJS', logo: NUJS },
    { name: 'President University', logo: president },
    { name: 'St. Vincent College', logo: stv }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
            Trusted by leading educational institutions worldwide
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-6  rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="h-12 w-auto max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300 mb-3"
              />
              <span className="text-sm font-medium text-gray-700 text-center">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustedBrands
