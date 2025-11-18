import { useNavigate } from "react-router-dom";
// import logo from "../assets/Group 4.svg";
// import serviceDeliveryLogo from "../assets/Vector (3).svg";
// import serviceAssuranceLogo from "../assets/Group 46.svg"
import logo from "../../assets/Group 4.svg";
import serviceDeliveryLogo from "../../assets/Vector (3).svg";
import serviceAssuranceLogo from "../../assets/Group 46.svg";
// import { LogOut } from "lucide-react";

export default function ServiceSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFF]">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-3 bg-white border-b-2 border-blue-500">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Nucleus Logo" className="h-8" />
          <span className="font-semibold text-blue-600">Nucleus</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Welcome, <span className="font-semibold">Dummyuser</span>
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/login");
            }}
            className="cursor-pointer px-4 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition flex items-center space-x-1"
          >
            {/* <LogOut size={16} /> */}
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow flex flex-col items-center px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Network Management platform
        </h1>
        <p className="text-gray-500 mb-10">
          Select your service area to continue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-4xl w-full">
          {/* Service Delivery → dashboard */}
          <div
            onClick={() => navigate("/config")}
            className="border-2 border-orange-400 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <img src={serviceDeliveryLogo} alt="Service Delivery" className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-orange-500">
                  Service Delivery
                </h2>
                <p className="text-sm text-gray-600">
                  Manage service provisioning, deployment, and delivery
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </div>

          {/* Service Assurance → config */}
          <div
            onClick={() => navigate("/config")}
            className="border-2 border-blue-400 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <img src={serviceAssuranceLogo} alt="Service Assurance" className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-500">
                  Service Assurance
                </h2>
                <p className="text-sm text-gray-600">
                  Monitor network performance, uptime, and quality metrics
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        </div>

        {/* NA cards (static) */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="bg-white rounded-lg p-10 text-center text-gray-600 shadow">NA</div>
          <div className="bg-white rounded-lg p-10 text-center text-gray-600 shadow">NA</div>
          <div className="bg-white rounded-lg p-10 text-center text-gray-600 shadow">NA</div>
        </div> */}
      </main>

      <footer className="bg-blue-600 py-3 text-white text-center text-sm">
        © AT&T
      </footer>
    </div>
  );
}
