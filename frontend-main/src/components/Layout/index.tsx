import { useLocation } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAccaddRoute = location.pathname.startsWith("/accadd");

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header isAccaddRoute={isAccaddRoute} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
}
