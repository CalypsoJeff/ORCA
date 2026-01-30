import HeroImage from "../../assets/images/heroSection/boxed-water-is-better-zQNDCje06VM-unsplash.jpg";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-[80vh] flex flex-col items-center justify-center pt-20 pb-16 bg-black overflow-hidden"
      aria-label="Hero"
    >
      {/* textured background (keeps your hero-waves styling) */}
      <div className="hero-waves absolute inset-0 -z-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* promo pill */}
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-slate-800 text-sky-300 text-sm font-medium tracking-wide">
            Free shipping over ₹999 • Easy returns
          </div>

          {/* headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            <span className="block">Gear That Moves With You</span>
            <span className="block text-indigo-500">Perform. Recover. Repeat.</span>
          </h1>

          {/* subhead / punch */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Shop high-performance apparel, footwear and fitness essentials — built for comfort,
            backed by performance, delivered fast.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-orca-600 px-6 text-sm font-medium text-white hover:bg-orca-700 transition-colors no-underline"
              aria-label="Shop Now"
            >
              Shop Now
            </button>

            <a
              href="#collections"
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 hover:bg-gray-50 no-underline"
            >
              View Collections
            </a>
          </div>
        </div>

        {/* visual / product image card */}
        <div className="max-w-6xl mx-auto mt-10 sm:mt-12">
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
            <img
              src={HeroImage}
              alt="Featured product or lifestyle shot"
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
