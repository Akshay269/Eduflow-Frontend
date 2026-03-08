import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { courses as coursesApi } from "@/lib/api";
import { Course, PageResponse } from "@/types";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const levels = ["", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageResponse<Course> | null>(null);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 12 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (level) params.level = level;
      const res = await coursesApi.search(params);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCourses();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-foreground mb-2">Explore Courses</h1>
      <p className="text-muted-foreground mb-8">Find the perfect course for your learning goals</p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-10" value={keyword} onChange={e => setKeyword(e.target.value)} />
        </div>
        <Input placeholder="Category" className="sm:w-40" value={category} onChange={e => setCategory(e.target.value)} />
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="gradient-accent border-0 text-accent-foreground font-semibold">Search</Button>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card animate-pulse h-72" />
          ))}
        </div>
      ) : data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" size="icon" disabled={data.first} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.pageNumber + 1} of {data.totalPages}
              </span>
              <Button variant="outline" size="icon" disabled={data.last} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
