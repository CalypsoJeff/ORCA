import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCompetitions } from "../../api/endpoints/competitions/user-competition";
import NavBar from "../../components/user/NavBar";
import { MDBCard, MDBCardImage, MDBRow, MDBCol } from "mdb-react-ui-kit";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    const getCompetitions = async () => {
      try {
        const response = await fetchCompetitions();
        const formattedCompetitions = response.data.competitions.map(
          (comp) => ({
            id: comp._id,
            title: comp.name,
            image: comp.image[0],
            description: comp.description,
            category: comp.category || [],
            date: comp.date || "",
            place: comp.place || "N/A",
            duration: comp.duration || 0,
          })
        );
        setCompetitions(formattedCompetitions);
      } catch (error) {
        console.error("Error fetching competitions:", error);
      }
    };
    getCompetitions();
  }, []);

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />
      <div className="container py-5 mt-8">
        <h2 className="text-center mb-4">Competitions</h2>
        <MDBRow className="row-cols-1 row-cols-md-3 g-4">
          {competitions.map((comp) => (
            <MDBCol key={comp.id}>
              <Link to={`/competition/${comp.id}`} className="block h-full">
                <MDBCard className="h-full p-0 border-none shadow-md overflow-hidden rounded-lg">
                  <div className="relative w-full h-[500px]">
                    <MDBCardImage
                      src={comp.image}
                      alt={comp.title}
                      className="w-full h-full object-cover"
                      position="top"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-black/20 bg-opacity-60 px-4 py-2">
                      <h5 className="text-white text-lg font-semibold m-0 text-center">
                        {comp.title}
                      </h5>
                    </div>
                  </div>
                </MDBCard>
              </Link>
            </MDBCol>
          ))}
        </MDBRow>
      </div>
    </>
  );
};

export default Competitions;
