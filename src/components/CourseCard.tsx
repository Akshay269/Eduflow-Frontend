import { Course } from "@/types";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { Badge } from "@/components/ui/badge";

const levelColors: Record<string, string> = {
  BEGINNER: "bg-success/10 text-success border-success/20",
  INTERMEDIATE: "bg-accent/10 text-accent border-accent/20",
  ADVANCED: "bg-destructive/10 text-destructive border-destructive/20",
};

const CourseCard = ({ course }: { course: Course }) => {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div className="aspect-video bg-secondary overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground font-display text-lg">
            {course.category || "Course"}
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${levelColors[course.level] || ""}`}>
            {course.level}
          </span>
          {course.category && (
            <span className="text-xs text-muted-foreground">{course.category}</span>
          )}
        </div>
        <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">by {course.instructorName}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <StarRating rating={course.averageRating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({course.totalReviews})
            </span>
          </div>
          <span className="font-display font-bold text-foreground">
            {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
