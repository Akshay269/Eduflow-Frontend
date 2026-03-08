import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const sizeMap = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

const StarRating = ({ rating, maxStars = 5, size = "md", interactive = false, onRate }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={`${sizeMap[size]} ${filled ? "fill-accent text-accent" : "text-border"} ${interactive ? "cursor-pointer hover:text-accent transition-colors" : ""}`}
            onClick={() => interactive && onRate?.(i + 1)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
