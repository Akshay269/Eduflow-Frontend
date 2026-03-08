import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { courses as coursesApi, enrollments, reviews as reviewsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Course, Review, PageResponse } from "@/types";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Clock, Tag, BarChart3, Pencil, Trash2 } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [reviewsData, setReviewsData] = useState<PageResponse<Review> | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [reviewPage, setReviewPage] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [c, revs] = await Promise.all([
          coursesApi.get(courseId),
          reviewsApi.list(courseId, 0, 10),
        ]);
        setCourse(c);
        setReviewsData(revs);

        if (user) {
          try {
            const isEnrolled = await enrollments.check(courseId);
            setEnrolled(!!isEnrolled);
          } catch { }
          if (user.role === "STUDENT") {
            try {
              const mr = await reviewsApi.myReview(courseId);
              setMyReview(mr);
            } catch { }
          }
        }
      } catch {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, user]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollments.enroll(courseId);
      setEnrolled(true);
      toast.success("Enrolled successfully!");
    } catch (err: any) {
      toast.error(err.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (editing && myReview) {
        await reviewsApi.update(myReview.id, { rating: newRating, comment: newComment });
        toast.success("Review updated");
      } else {
        await reviewsApi.create(courseId, { rating: newRating, comment: newComment });
        toast.success("Review submitted");
      }
      const [revs, mr] = await Promise.all([
        reviewsApi.list(courseId, 0, 10),
        reviewsApi.myReview(courseId),
      ]);
      setReviewsData(revs);
      setMyReview(mr);
      setEditing(false);
      setNewComment("");
      setNewRating(5);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    try {
      await reviewsApi.delete(myReview.id);
      setMyReview(null);
      toast.success("Review deleted");
      const revs = await reviewsApi.list(courseId, 0, 10);
      setReviewsData(revs);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 animate-pulse"><div className="h-8 w-64 bg-secondary rounded mb-4" /><div className="h-4 w-full bg-secondary rounded" /></div>;
  }

  if (!course) {
    return <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Course not found.</div>;
  }

  const canEnroll = user?.role === "STUDENT" && !enrolled;
  const canReview = user?.role === "STUDENT" && enrolled;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground font-display text-2xl">
                {course.category || "Course"}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">{course.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{course.instructorName}</span>
            <span className="flex items-center gap-1"><Tag className="h-4 w-4" />{course.category}</span>
            <span className="flex items-center gap-1"><BarChart3 className="h-4 w-4" />{course.level}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={course.averageRating} />
            <span className="text-sm text-muted-foreground">{course.averageRating.toFixed(1)} ({course.totalReviews} reviews)</span>
          </div>
          <div className="prose max-w-none">
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>

          {/* Reviews */}
          <div className="pt-8 border-t border-border">
            <h2 className="text-xl font-display font-bold text-foreground mb-6">Reviews</h2>

            {/* My review or form */}
            {canReview && !myReview && (
              <div className="rounded-lg border border-border bg-card p-5 mb-6 space-y-3">
                <p className="text-sm font-medium text-foreground">Write a review</p>
                <StarRating rating={newRating} interactive onRate={setNewRating} size="lg" />
                <Textarea placeholder="Share your experience..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <Button onClick={handleSubmitReview} className="gradient-accent border-0 text-accent-foreground font-semibold" disabled={!newComment.trim()}>
                  Submit Review
                </Button>
              </div>
            )}

            {canReview && myReview && !editing && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Your Review</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(true); setNewRating(myReview.rating); setNewComment(myReview.comment); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDeleteReview}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <StarRating rating={myReview.rating} />
                <p className="text-sm text-foreground/80 mt-2">{myReview.comment}</p>
              </div>
            )}

            {editing && (
              <div className="rounded-lg border border-border bg-card p-5 mb-6 space-y-3">
                <p className="text-sm font-medium text-foreground">Edit your review</p>
                <StarRating rating={newRating} interactive onRate={setNewRating} size="lg" />
                <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview} className="gradient-accent border-0 text-accent-foreground font-semibold">Update</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Review list */}
            <div className="space-y-4">
              {reviewsData?.content.map(r => (
                <div key={r.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{r.studentName}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={r.rating} size="sm" />
                  <p className="text-sm text-foreground/70 mt-1">{r.comment}</p>
                </div>
              ))}
              {(!reviewsData || reviewsData.content.length === 0) && (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6 shadow-card space-y-5">
            <p className="text-3xl font-display font-bold text-foreground">
              {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
            </p>
            {canEnroll && (
              <Button onClick={handleEnroll} disabled={enrolling} className="w-full gradient-accent border-0 text-accent-foreground font-semibold text-base py-5">
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </Button>
            )}
            {enrolled && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-center">
                <span className="text-sm font-medium text-success">✓ You're enrolled</span>
              </div>
            )}
            {!user && (
              <Button onClick={() => window.location.href = "/login"} className="w-full" variant="outline">
                Sign in to enroll
              </Button>
            )}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Level</span><span className="text-foreground font-medium">{course.level}</span></div>
              <div className="flex justify-between"><span>Category</span><span className="text-foreground font-medium">{course.category}</span></div>
              <div className="flex justify-between"><span>Reviews</span><span className="text-foreground font-medium">{course.totalReviews}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
