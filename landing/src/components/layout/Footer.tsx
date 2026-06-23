import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#004D4C] text-white pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-[100px]">
        <div className="flex flex-col md:flex-row justify-between items-start w-full gap-12 md:gap-4 mb-12">
          {/* Brand Info */}
          <div className="w-full max-w-[344px] space-y-4">
            <Link
              to="/"
              className="text-[20px] font-semibold leading-[28px] tracking-[0px] text-[#F2F4F3] inline-block mb-2"
            >
              Denish
            </Link>
            <p className="font-normal text-[14px] leading-[22.75px] text-[#F2F4F3] w-full max-w-[344px]">
              Premium delivery service tailored for the Nigerian lifestyle. Fast, secure, and reliable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="w-full max-w-[150px]">
            <h3 className="font-semibold text-[16px] leading-[24px] text-[#F2F4F3] mb-6">Quick Links</h3>
            <ul className="space-y-4 font-normal text-[14px] leading-[20px] text-[#F2F4F3]">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="w-full max-w-[150px]">
            <h3 className="font-semibold text-[16px] leading-[24px] text-[#F2F4F3] mb-6">Navigation</h3>
            <ul className="space-y-4 font-normal text-[14px] leading-[20px] text-[#F2F4F3]">
              <li><Link to="/vendors" className="hover:text-white transition-colors">For Vendors</Link></li>
              <li><Link to="/riders" className="hover:text-white transition-colors">For Riders</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Main Site</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="w-full md:w-auto md:max-w-[300px]">
            <h3 className="font-semibold text-[16px] leading-[24px] text-[#F2F4F3] mb-6">Contact Us</h3>
            <ul className="space-y-4 font-normal text-[14px] leading-[20px] text-[#F2F4F3]">
              <li>Email: support@denishapp.com</li>
              <li>Phone: +234 800 000 0000</li>
              <li>Address: Kano, Nigeria</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F2F4F3] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="font-normal text-[14px] leading-[20px] text-[#F2F4F3]">
            © 2026 Denish App. Excellence in Delivery.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-transform hover:scale-110" aria-label="Facebook">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/></svg>
            </a>
            {/* Same for other icons */}
          </div>
        </div>
      </div>
    </footer>
  );
}
