// src/components/ui/Logo.jsx
import logo from "../../assets/logo.png"

const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      <img 
        src={logo} 
        alt="CampusTechnology Logo" 
        className="h-24 w-24 object-contain"
      />

    </div>
  )
}

export default Logo
