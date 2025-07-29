import { useEffect, useState } from "react";
import NavBar from "../../components/user/NavBar";

// Mock data
const mockEvents = [
  {
    id: 1,
    title: "Coastal Ride to Varkala",
    date: "2025-05-18",
    location: "Kollam to Varkala",
    distance: "60 km",
    ridersJoined: 15,
    tags: ["Beginner", "Beach"],
    category: "Beach",
  },
  {
    id: 2,
    title: "Hill Climb Challenge",
    date: "2025-06-02",
    location: "Ponmudi Hills",
    distance: "75 km",
    ridersJoined: 22,
    tags: ["Expert", "Hill"],
    category: "Hill",
  },
  {
    id: 3,
    title: "Midnight City Sprint",
    date: "2025-06-15",
    location: "Trivandrum City Loop",
    distance: "40 km",
    ridersJoined: 30,
    tags: ["Night", "Urban"],
    category: "Night Ride",
  },
  {
    id: 4,
    title: "Munnar Mountain Rally",
    date: "2025-06-22",
    location: "Munnar Hills",
    distance: "120 km",
    ridersJoined: 28,
    tags: ["Expert", "Hill"],
    category: "Hill",
  },
  {
    id: 5,
    title: "Beachside Breeze Ride",
    date: "2025-06-29",
    location: "Cherai Beach",
    distance: "65 km",
    ridersJoined: 18,
    tags: ["Intermediate", "Beach"],
    category: "Beach",
  },
  {
    id: 6,
    title: "Rain Rider Run",
    date: "2025-07-05",
    location: "Athirapally Falls",
    distance: "90 km",
    ridersJoined: 25,
    tags: ["Rain Ride", "Adventure"],
    category: "Forest",
  },
  {
    id: 7,
    title: "Temple Town Ride",
    date: "2025-07-20",
    location: "Guruvayur",
    distance: "85 km",
    ridersJoined: 19,
    tags: ["Cultural", "Beginner"],
    category: "City Ride",
  },
  {
    id: 8,
    title: "Valley Vista Cruise",
    date: "2025-07-27",
    location: "Wayanad Loop",
    distance: "140 km",
    ridersJoined: 35,
    tags: ["Hill", "Scenic"],
    category: "Hill",
  },
];

const categories = ["All", "Beach", "Hill", "Night Ride", "Forest", "City Ride"];
const allTags = ["Beginner", "Expert", "Night", "Adventure", "Rain Ride", "Scenic", "Intermediate", "Cultural"];

const RidersPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;

  const filteredEvents = mockEvents.filter((event) => {
    const matchCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchTags = selectedTags.length === 0 || selectedTags.every(tag => event.tags.includes(tag));
    return matchCategory && matchTags;
  });

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [selectedCategory, selectedTags]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
        <NavBar/>
      <h1 className="text-3xl font-bold mt-16 mb-6 text-center">🏍️ Upcoming Rider Events</h1>


      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        {/* Category Select */}
        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
          className="p-2 rounded border w-full md:w-1/3"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )
              }
              className={`px-3 py-1 rounded-full border ${
                selectedTags.includes(tag) ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedEvents.length === 0 ? (
          <p className="text-center col-span-full">No events match your filter.</p>
        ) : (
          paginatedEvents.map((event) => (
            <div key={event.id} className="bg-white p-4 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-blue-700">{event.title}</h2>
              <p className="text-sm text-gray-600">📅 {event.date}</p>
              <p className="text-sm">📍 {event.location}</p>
              <p className="text-sm">🛣️ {event.distance}</p>
              <p className="text-sm">👥 {event.ridersJoined} riders joined</p>

              {/* Tags */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {event.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
                Join Ride
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => setCurrentPage(page + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === page + 1 ? "bg-blue-700 text-white" : "bg-gray-300"
              }`}
            >
              {page + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RidersPage;
