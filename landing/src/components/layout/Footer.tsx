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
          <div className="flex items-center space-x-6">
            <a
              href="https://www.instagram.com/denishapp/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-transform hover:scale-110"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.25-3.25a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
              </svg>
            </a>
            <a
              href="https://x.com/denishapp"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-transform hover:scale-110"
              aria-label="X"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.9 2H22l-6.7 7.7L23.3 22h-5.9l-4.7-6.1L7.4 22H4.3l7.1-8.2L0.7 2h6.1l4.3 5.7L18.9 2Zm-1 18h1.1L6.2 4H5.1l12.8 16Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
