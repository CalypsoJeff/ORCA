import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTrekkings } from "../../api/endpoints/trekkings/user-trekking";
import NavBar from "../../components/user/NavBar";
import { MDBCard, MDBCardImage, MDBRow, MDBCol } from "mdb-react-ui-kit";

const Trekkings = () => {
  const [trekkings, setTrekkings] = useState([]);

  useEffect(() => {
    const getTrekkings = async () => {
      try {
        const response = await fetchTrekkings();
        const formattedTrekkings = response.data.trekking.map((trek) => ({
          id: trek._id,
          title: trek.name,
          image: trek.image,
          description: trek.description,
          location: trek.place || "Unknown",
          difficulty: trek.difficulty || "N/A",
          duration: trek.trekDuration || "Unknown",
          distance: trek.trekDistance || 0,
          date: trek.startDate || "",
          cost: trek.costPerPerson || 0,
          maxParticipants: trek.maxParticipants || "N/A",
          registeredParticipants: trek.registeredParticipants || 0,
        }));
        setTrekkings(formattedTrekkings);
      } catch (error) {
        console.error("Error fetching trekkings:", error);
      }
    };
    getTrekkings();
  }, []);

  return (
    <>
      <NavBar />
      <div className="container py-5 mt-8">
        <h2 className="text-center mb-4">Trekkings</h2>
        <MDBRow className="row-cols-1 row-cols-md-3 g-4">
          {trekkings.map((trek) => (
            <MDBCol key={trek.id}>
              <Link to={`/trekking/${trek.id}`} className="block h-full">
                <MDBCard className="h-full p-0 border-none shadow-md overflow-hidden rounded-lg">
                  <div className="relative w-full h-[500px]">
                    <MDBCardImage
                      src={trek.image}
                      alt={trek.title}
                      className="w-full h-full object-cover"
                      position="top"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-black/20 bg-opacity-60 px-4 py-2">
                      <h5 className="text-white text-lg font-semibold m-0">
                        {trek.title}
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

export default Trekkings;
