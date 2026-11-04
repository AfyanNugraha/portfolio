import Hero from './components/Hero';
import Navbar from './components/Navbar';
import SectionNav from './components/SectionNav';
import ScrollProgress from './components/ScrollProgress';
import Intro from './components/Intro';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Lanyard from './components/Lanyard';
import LanyardSection from './components/LanyardSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Intro />
      <Navbar />
      <SectionNav />
      <ScrollProgress />
      <div className="hidden md:block">
        <Hero />
      </div>
      <div className="md:hidden">
        <LanyardSection />
      </div>
      <About />
      <Projects />
      <Experience />
      <Certifications />
      <Contact />
      <Footer />
    </div>
  );
}

