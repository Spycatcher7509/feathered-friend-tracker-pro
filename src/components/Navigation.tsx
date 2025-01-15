import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-nature-600">
            BirdWatch
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/sightings"
              className="text-nature-600 hover:text-nature-700"
            >
              Sightings
            </Link>
            <Link
              to="/add"
              className="rounded-full bg-nature-500 px-4 py-2 text-white transition-colors hover:bg-nature-600"
            >
              Add Sighting
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;