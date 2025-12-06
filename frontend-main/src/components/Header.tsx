import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isAccaddRoute = location.pathname.startsWith("/accadd");

  const handleDownloadBrochure = () => {
    const link = document.createElement("a");
    link.href = "/files/Program Brochure.pdf";
    link.download = "Program Brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToFAQ = () => {
    if (location.pathname === "/accadd") {
      // If already on landing page, scroll to FAQ
      setTimeout(() => {
        const faqSection = document.getElementById("faq");
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // If not on landing page, navigate to landing page with hash
      window.location.href = "/accadd#faq";
    }
  };

  if (isAccaddRoute) {
    return (
      <>
        {/* ACCADD Header with Gradient Background */}
        <header className="bg-gradient-to-r from-blue-100 via-blue-500 to-purple-600 shadow-md">
          <div className="container mx-auto px-4 py-6">
            {/* Logo Section */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Link to="/">
                  <img
                    src="/images/logo.png"
                    alt="ASCETA Logo"
                    className="h-20 w-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const fallback = document.createElement("div");
                      fallback.className =
                        "w-20 h-20 bg-white rounded-full flex items-center justify-center text-asceta-blue font-bold text-sm";
                      fallback.textContent = "ASCETA";
                      (e.target as HTMLImageElement).parentElement?.appendChild(
                        fallback
                      );
                    }}
                  />
                </Link>
              </div>
              <div className="flex items-center">
                <img
                  src="/images/accadd.jpg"
                  alt="ACCADD Logo"
                  className="h-20 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.className =
                      "w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-sm";
                    fallback.textContent = "ACCADD";
                    (e.target as HTMLImageElement).parentElement?.appendChild(
                      fallback
                    );
                  }}
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center justify-center gap-6 pt-4 border-t border-white/30">
              <button
                onClick={handleDownloadBrochure}
                className="text-white font-semibold hover:underline transition-colors"
              >
                Brochure
              </button>
              <button
                onClick={scrollToFAQ}
                className="text-white font-semibold hover:underline transition-colors"
              >
                FAQ
              </button>
            </nav>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      {/* Top Blue Bar */}
      <div className="bg-asceta-blue text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center text-sm">
            <div className="flex gap-4">
              <Link to="/" className="hover:underline">
                ASCETA Home
              </Link>
              <Link to="/news" className="hover:underline">
                ASCETA News
              </Link>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </div>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/student/dashboard" className="hover:underline">
                    My Portal
                  </Link>
                  <button onClick={logout} className="hover:underline">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/student/login" className="hover:underline">
                  My Portal
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/logo.png"
                alt="ASCETA Logo"
                className="h-16 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const fallback = document.createElement("div");
                  fallback.className =
                    "w-16 h-16 bg-asceta-blue rounded-full flex items-center justify-center text-white font-bold";
                  fallback.textContent = "ASCETA";
                  (e.target as HTMLImageElement).parentElement?.appendChild(
                    fallback
                  );
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-asceta-blue">
                  ABIA STATE COLLEGE OF EDUCATION (TECHNICAL) AROCHUKWU
                </h1>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <Link to="/about" className="hover:text-asceta-blue">
                About
              </Link>
              <Link to="/admission" className="hover:text-asceta-blue">
                Admission
              </Link>
              <Link to="/academics" className="hover:text-asceta-blue">
                Academics
              </Link>
              <Link to="/leadership" className="hover:text-asceta-blue">
                Leadership
              </Link>
              <Link to="/news" className="hover:text-asceta-blue">
                News
              </Link>
              <Link to="/events" className="hover:text-asceta-blue">
                Events
              </Link>
            </nav>
            <button className="md:hidden">☰</button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
