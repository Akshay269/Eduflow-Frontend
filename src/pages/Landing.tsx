import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courses as coursesApi } from "@/lib/api";
import { Course } from "@/types";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Users, Award, ArrowRight } from "lucide-react";

const Landing = () => {
  const [featured, setFeatured] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    coursesApi
      .list(0, 6)
      .then((res) => setFeatured(res.content || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/courses?keyword=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
              Learn without limits
            </span>
            <h1 className="text-4xl font-display font-bold leading-tight text-primary-foreground lg:text-6xl">
              Master new skills with{" "}
              <span className="text-accent">EduFlow</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-lg">
              Access expert-led courses, build real-world projects, and
              accelerate your career growth.
            </p>
            <form onSubmit={handleSearch} className="flex max-w-md gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 bg-card/90 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="gradient-accent border-0 text-accent-foreground font-semibold"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: "Expert Courses", value: "500+" },
            { icon: Users, label: "Active Learners", value: "10K+" },
            { icon: Award, label: "Certificates Earned", value: "5K+" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-card"
            >
              <div className="rounded-lg bg-accent/10 p-3">
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-foreground">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Featured Courses
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start learning from the best
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="text-accent"
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No courses available yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-accent" />
            EduFlow
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 EduFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
