import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TrustedBrands from '../components/TrustedBrands'
import Features from '../components/Features'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import SplitCards from '../components/SplitCards'
import WhyUs from '../components/WhyUs'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <SplitCards/>
      <WhyUs/>
      {/* <TrustedBrands /> */}
      {/* <Features /> */}
      {/* <FAQ /> */}
      <Footer />
    </div>
  )
}

export default LandingPage;