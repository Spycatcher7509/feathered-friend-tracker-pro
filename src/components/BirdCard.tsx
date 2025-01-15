import { motion } from "framer-motion";

interface BirdCardProps {
  image: string;
  name: string;
  location: string;
  date: string;
}

const BirdCard = ({ image, name, location, date }: BirdCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bird-card"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img src={image} alt={name} className="h-48 w-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-nature-800">{name}</h3>
        <p className="text-sm text-nature-600">{location}</p>
        <p className="text-xs text-nature-500">{date}</p>
      </div>
    </motion.div>
  );
};

export default BirdCard;