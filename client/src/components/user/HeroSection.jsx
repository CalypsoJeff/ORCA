import { useEffect, useRef } from "react";
import { Waves } from "../ui/waves-background";
import HeroImage from "../../assets/images/heroSection/boxed-water-is-better-zQNDCje06VM-unsplash.jpg";

const HeroSection = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } =
        heroRef.current.getBoundingClientRect();

      const x = (clientX - left) / width;
      const y = (clientY - top) / height;

      heroRef.current.style.setProperty("--mouse-x", `${x}`);
      heroRef.current.style.setProperty("--mouse-y", `${y}`);
    };

    const element = heroRef.current; // ✅ Store reference

    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (element) {
        element.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="
    relative
    min-h-[100svh]
    flex flex-col items-center justify-center
    pt-20 pb-16 md:pb-24
    bg-black
    overflow-x-hidden
    md:overflow-hidden
  "
      style={{
        "--mouse-x": "0.5",
        "--mouse-y": "0.5",
      }}
    >
      {/* Animated Sparkles Background */}
     <div className="absolute inset-0 pointer-events-none">
        <Waves
          id="heroSparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={0.5}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-orca-100 text-orca-800 text-xs font-medium tracking-wide animate-fade-in">
            Elevate Your Fitness Journey 🏋️‍♂️
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-fade-in animate-delay-100">
            <span className="block">Your Transformation Begins</span>
            <span className="text-shimmer">Here & Now</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto text-balance animate-fade-in animate-delay-200">
            Unlock your potential with AI-powered coaching, personalized
            workouts, and a fitness community that keeps you going.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animate-delay-300">
            <a
              href="#demo"
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-orca-600 px-8 text-sm font-medium text-white transition-colors hover:bg-orca-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orca-500 no-underline"
            >
              Watch Demo
            </a>
            <a
              href="#features"
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-8 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orca-500 no-underline"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Section Image */}
        <div className="max-w-6xl mx-auto mt-16 relative animate-fade-in animate-delay-400">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl glass-card">
            <img
              src={HeroImage}
              alt="Gym Workout Motivation"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Subtle Reflection */}
          <div
            className="absolute -bottom-10 left-[10%] right-[10%] h-20 rounded-[100%] bg-black/5 blur-xl opacity-60 transform scale-x-[0.85]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
