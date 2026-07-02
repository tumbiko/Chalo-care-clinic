import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Stats from "./components/landing/Stats";
import Features from "./components/landing/Features";
import Testimonials from "./components/landing/Testimonials";
import FAQ from "./components/landing/FAQ";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
