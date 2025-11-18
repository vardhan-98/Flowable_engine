// // Footer Component
import at$t from "../../assets/at&t-logo.png";
import prodapt from "../../assets/prodapt-logo.png";
function Footer() {
    return (
        <footer className="flex items-center justify-end h-12 px-6 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-4">
                <p className="text-gray-400">
                    Powered BY
                </p>
                <img src={at$t} alt="At&t logo" className="h-[29.79px] w-[74.47px]" />
                <img src={prodapt} alt="At&t logo" className="h-[17.39px] w-[80.77px]" />
            </div>
        </footer>
    );
}

export default Footer;