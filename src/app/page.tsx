import Nav from "@/components/hero/Nav";
import Hero from "@/components/hero/Hero";
// About is commented out for now - copy needs another pass, and it was
// stepping on the Hero subheadline's job anyway. Projects moves up to
// right under Hero in the meantime. Bring back with <About /> below Hero.
// import About from "@/components/about/About";
import Projects from "@/components/projects/Projects";
import Contact from "@/components/contact/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      {/* <About /> */}
      <Projects />
      <Contact />
    </>
  );
}
