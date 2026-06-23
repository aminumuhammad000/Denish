import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

// Pages
import Home from "./pages/Home";
import Vendors from "./pages/Vendors";
import Riders from "./pages/Riders";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LandingLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/riders" element={<Riders />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </LandingLayout>
    </BrowserRouter>
  );
}
