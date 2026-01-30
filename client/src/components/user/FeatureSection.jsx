import { cn } from "@/lib/utils";

const featureBlocks = [
  {
    title: "Performance Gear",
    description:
      "Engineered fabrics and precise fits that move with you — sweat-wicking, durable, built for athletes.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2v6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 8l6 14 6-14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Satisfaction Promise",
    description:
      "30-day easy returns, quality checks, and secure checkout — shop risk-free with a trusted guarantee.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Fast Shipping",
    description:
      "Get your essentials delivered quickly with reliable courier partners and real-time tracking.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 7h13l3 4v6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 15h1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="7.5"
          cy="18.5"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle
          cx="18.5"
          cy="18.5"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    title: "Trainer Approved",
    description:
      "Products and routines vetted by certified trainers — pick gear that matches real workouts.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Member Rewards",
    description:
      "Earn points, unlock discounts and priority drops — loyal customers move faster.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2l2.2 4.5L19 8l-3.6 3.2L15.5 16 12 13.8 8.5 16l.1-4.8L5 8l4.8-.5L12 2z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Easy Fit Guide",
    description:
      "Quick size guide and AI recommendations so your first order fits right the first time.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 12h18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

// eslint-disable-next-line react/prop-types
const FeatureSection = ({ variant = "light" }) => {
  // variant: "dark" or "light" if you want a white background version later
  const isDark = variant === "dark";

  return (
    <section
      id="features"
      className={cn(
        "py-16 md:py-24",
        isDark ? "bg-black text-white" : "bg-white text-gray-900",
      )}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div
            className={cn(
              "inline-block px-3 py-1 mb-4 rounded-full text-xs font-medium tracking-wide",
              isDark
                ? "bg-slate-800 text-sky-300"
                : "bg-orca-100 text-orca-800",
            )}
          >
            Why ORCA
          </div>

          <h2
            className={cn(
              "text-3xl md:text-4xl font-display font-bold mb-4",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            Performance, comfort, and trust — all in one place
          </h2>

          <p
            className={cn(
              "max-w-2xl mx-auto text-lg",
              isDark ? "text-gray-300" : "text-gray-600",
            )}
          >
            Shop performance-driven fitness gear and accessories — thoughtfully
            designed, trainer-approved, and backed by a satisfaction promise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureBlocks.map((f, idx) => (
            <article
              key={f.title}
              className={cn(
                "flex gap-4 p-5 rounded-2xl border transition-transform duration-200",
                isDark
                  ? "border-gray-800 bg-black/40 hover:scale-[1.02]"
                  : "border-gray-100 bg-white hover:shadow-md",
              )}
              style={{ alignItems: "flex-start" }}
              tabIndex={0}
              aria-labelledby={`feature-${idx}`}
              data-animate="true"
            >
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                  isDark
                    ? "bg-slate-800 text-sky-400"
                    : "bg-orca-50 text-orca-600",
                )}
              >
                {f.icon}
              </div>

              <div className="min-w-0">
                <h3
                  id={`feature-${idx}`}
                  className={cn(
                    "text-lg font-semibold mb-1",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  {f.title}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-gray-300" : "text-gray-600",
                  )}
                >
                  {f.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => (window.location.href = "/shop")}
            className={cn(
              "px-6 py-3 rounded-md font-medium transition-colors",
              isDark
                ? "bg-orca-600 text-white hover:bg-orca-700"
                : "bg-orca-600 text-white hover:bg-orca-700",
            )}
          >
            Browse Bestsellers
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
