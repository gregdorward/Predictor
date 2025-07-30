import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 <= 0.75;
  const totalStars = 5;

  return (
    <div className='Star'>
      {[...Array(totalStars)].map((_, index) => {
        if (index < fullStars) {
          return <FaStar key={index} color="#fe8c00" size="1.5em" />;
        } else if (index === fullStars && hasHalfStar) {
          return <FaStarHalfAlt key={index} color="#fe8c00" size="1.5em" />;
        } else {
          return <FaRegStar key={index} color="#d3d3d3" size="1.5em" />;
        }
      })}
    </div>
  );
};

export default StarRating;