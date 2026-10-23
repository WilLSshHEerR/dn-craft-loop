import './landing.css';
import ProgressBar from './ProgressBar';
import Nav from './Nav';
import Hero from './Hero';
import { Services, Process, Tech, Projects, Stats, FinalCta } from './Sections';
import { Contact, Footer } from './Contact';

export default function LandingPage() {
  return (
    <div className="lp">
      <a className="skip" href="#main">Saltar al contenido</a>
      <ProgressBar />
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <Process />
        <Tech />
        <Projects />
        <Stats />
        <FinalCta />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

