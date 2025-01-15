import Navigation from "../components/Navigation";
import BirdCard from "../components/BirdCard";

const recentSightings = [
  {
    id: 1,
    image: "https://source.unsplash.com/random/800x600/?bird",
    name: "Northern Cardinal",
    location: "Central Park, NY",
    date: "2024-02-20",
  },
  {
    id: 2,
    image: "https://source.unsplash.com/random/800x600/?bird,flying",
    name: "Blue Jay",
    location: "Prospect Park, NY",
    date: "2024-02-19",
  },
  {
    id: 3,
    image: "https://source.unsplash.com/random/800x600/?bird,nest",
    name: "American Robin",
    location: "Bryant Park, NY",
    date: "2024-02-18",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-nature-50 to-nature-100">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-nature-800">
            Welcome to BirdWatch
          </h1>
          <p className="text-lg text-nature-600">
            Document and share your bird sightings with fellow enthusiasts
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-nature-700">
            Recent Sightings
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentSightings.map((sighting) => (
              <BirdCard key={sighting.id} {...sighting} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;