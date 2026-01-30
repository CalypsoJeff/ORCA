import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCompetitions } from "../../api/endpoints/competitions/user-competition";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import { MDBCard, MDBCardImage, MDBRow, MDBCol } from "mdb-react-ui-kit";

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search + sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("upcoming"); // upcoming | newest | oldest | az

  // Sidebar filters
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());

  // ✅ Mobile filters drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const getCompetitions = async () => {
      setLoading(true);
      try {
        const response = await fetchCompetitions();
        const list = response?.data?.competitions || [];

        const formatted = list.map((comp) => ({
          id: comp._id,
          title: comp.name,
          image: comp.image?.[0] || "/placeholder.jpg",
          description: comp.description || "",
          category: Array.isArray(comp.category) ? comp.category : comp.category ? [comp.category] : [],
          date: comp.date || "",
          place: comp.place || "N/A",
          duration: comp.duration || 0,
        }));

        setCompetitions(formatted);
      } catch (error) {
        console.error("Error fetching competitions:", error);
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };

    getCompetitions();
  }, []);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [mobileFiltersOpen]);

  const categories = useMemo(() => {
    const set = new Set();
    (competitions || []).forEach((c) => {
      (c.category || []).forEach((cat) => set.add(String(cat)));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [competitions]);

  const places = useMemo(() => {
    const set = new Set();
    (competitions || []).forEach((c) => set.add(String(c.place || "N/A")));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [competitions]);

  const toggleSetItem = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedPlaces(new Set());
    setSearchTerm("");
    setSortBy("upcoming");
  };

  const toDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const formatDate = (d) => {
    const dt = toDate(d);
    if (!dt) return "TBA";
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCompetitions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    let list = (competitions || []).filter((c) => {
      const nameOk = (c.title || "").toLowerCase().includes(q);
      const descOk = (c.description || "").toLowerCase().includes(q);
      const placeOkText = (c.place || "").toLowerCase().includes(q);

      const catOk =
        selectedCategories.size === 0 ||
        (c.category || []).some((cat) => selectedCategories.has(String(cat)));

      const placeOk =
        selectedPlaces.size === 0 || selectedPlaces.has(String(c.place || "N/A"));

      // search matches name/desc/place
      const searchOk = !q ? true : nameOk || descOk || placeOkText;

      return searchOk && catOk && placeOk;
    });

    // sort
    const now = new Date();
    list.sort((a, b) => {
      const ad = toDate(a.date);
      const bd = toDate(b.date);

      if (sortBy === "az") return String(a.title).localeCompare(String(b.title));
      if (sortBy === "newest") return (bd?.getTime() || 0) - (ad?.getTime() || 0);
      if (sortBy === "oldest") return (ad?.getTime() || 0) - (bd?.getTime() || 0);

      // upcoming (default):
      // - future dates first (closest first)
      // - then TBA
      // - then past dates (most recent past first)
      const aFuture = ad && ad >= now;
      const bFuture = bd && bd >= now;

      if (aFuture && bFuture) return ad.getTime() - bd.getTime();
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;

      const aHas = Boolean(ad);
      const bHas = Boolean(bd);
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;

      // both past or both null
      return (bd?.getTime() || 0) - (ad?.getTime() || 0);
    });

    return list;
  }, [competitions, searchTerm, selectedCategories, selectedPlaces, sortBy]);

  // eslint-disable-next-line react/prop-types
  const FiltersPanel = ({ compact = false }) => (
    <div className={compact ? "" : "bg-white border border-gray-200 rounded-lg p-4 lg:sticky lg:top-28"}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold mb-0">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          type="button"
        >
          Clear
        </button>
      </div>

      {/* Category */}
      <div className="mb-5">
        <div className="font-medium text-sm mb-2">Category</div>
        <div className="max-h-56 overflow-auto pr-1 space-y-2">
          {categories.length === 0 ? (
            <div className="text-sm text-gray-500">No categories</div>
          ) : (
            categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.has(cat)}
                  onChange={() => toggleSetItem(setSelectedCategories, cat)}
                  className="h-4 w-4"
                />
                <span className="text-gray-700">{cat}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Place */}
      <div className="mb-1">
        <div className="font-medium text-sm mb-2">Place</div>
        <div className="max-h-56 overflow-auto pr-1 space-y-2">
          {places.length === 0 ? (
            <div className="text-sm text-gray-500">No places</div>
          ) : (
            places.map((pl) => (
              <label key={pl} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPlaces.has(pl)}
                  onChange={() => toggleSetItem(setSelectedPlaces, pl)}
                  className="h-4 w-4"
                />
                <span className="text-gray-700">{pl}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />

      {/* ✅ fixed header spacing (no mt-8 / no marginTop) */}
      <section className="bg-gray-50 min-h-screen pt-28 md:pt-32 pb-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 mb-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold mb-1">
                  Competitions
                </h1>
                <p className="text-gray-600 text-sm mb-0">
                  Browse upcoming events and explore categories.
                </p>
              </div>

              {/* Search + sort */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search competitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-[320px] px-4 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-52 px-4 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="upcoming">Sort: Upcoming</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="oldest">Sort: Oldest</option>
                  <option value="az">Sort: A → Z</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredCompetitions.length}</span>{" "}
                of <span className="font-semibold">{competitions.length}</span>
              </div>

              {/* Mobile filters button */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                  type="button"
                >
                  Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
              <FiltersPanel />
            </aside>

            {/* Main grid */}
            <main className="lg:col-span-9">
              {loading ? (
                <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
                  Loading competitions...
                </div>
              ) : filteredCompetitions.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
                  No competitions found.
                </div>
              ) : (
                <MDBRow className="row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {filteredCompetitions.map((comp) => (
                    <MDBCol key={comp.id}>
                      <Link to={`/competition/${comp.id}`} className="block h-full no-underline">
                        <MDBCard className="h-full p-0 border-0 shadow-sm overflow-hidden rounded-xl hover:shadow-md transition-shadow">
                          <div className="relative w-full h-[260px] bg-gray-100">
                            <MDBCardImage
                              src={comp.image}
                              alt={comp.title}
                              className="w-full h-full object-cover"
                              position="top"
                            />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                            {/* Title */}
                            <div className="absolute bottom-0 left-0 w-full px-4 pb-4">
                              <h5 className="text-white text-lg font-semibold m-0 line-clamp-2">
                                {comp.title}
                              </h5>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs bg-white/15 text-white px-2 py-1 rounded-full">
                                  📍 {comp.place}
                                </span>
                                <span className="text-xs bg-white/15 text-white px-2 py-1 rounded-full">
                                  📅 {formatDate(comp.date)}
                                </span>
                                {comp.duration ? (
                                  <span className="text-xs bg-white/15 text-white px-2 py-1 rounded-full">
                                    ⏱ {comp.duration}h
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-4 bg-white">
                            {/* Categories */}
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(comp.category || []).slice(0, 3).map((c) => (
                                <span
                                  key={c}
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                                >
                                  {c}
                                </span>
                              ))}
                              {(comp.category || []).length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  +{comp.category.length - 3}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-0">
                              {comp.description || "View details for more information."}
                            </p>

                            <div className="mt-3 text-sm font-medium text-blue-600">
                              View details →
                            </div>
                          </div>
                        </MDBCard>
                      </Link>
                    </MDBCol>
                  ))}
                </MDBRow>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* ✅ Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-base font-semibold mb-0">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-50"
                aria-label="Close filters"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <FiltersPanel compact />
            </div>

            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => {
                  clearFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium"
                type="button"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                type="button"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Competitions;
