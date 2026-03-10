import { useEffect, useState } from "react";
import { enrollments as enrollApi } from "@/lib/api";
import { Enrollment } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollApi
      .myEnrollments()
      .then((res) => {
        setEnrolled(Array.isArray(res) ? res : res.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue your learning journey
        </p>
      </div>

      <h2 className="text-xl font-display font-semibold text-foreground mb-4">
        My Courses
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-lg bg-secondary animate-pulse"
            />
          ))}
        </div>
      ) : enrolled.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolled.map((e) => (
            <Link
              key={e.id}
              to={`/courses/${e.courseId}`}
              className="group rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden"
            >
              <div className="aspect-video bg-secondary overflow-hidden">
                {e.thumbnailUrl ? (
                  <img
                    src={e.thumbnailUrl}
                    alt={e.courseName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <BookOpen className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                  {e.courseName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  by {e.instructorName}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg border border-border bg-card">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/courses"
            className="text-accent font-medium text-sm hover:underline mt-2 inline-block"
          >
            Browse courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
