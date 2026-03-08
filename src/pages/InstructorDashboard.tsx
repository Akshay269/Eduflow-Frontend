import { useEffect, useState } from "react";
import { courses as coursesApi, enrollments as enrollApi } from "@/lib/api";
import { Course } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Image } from "lucide-react";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "0", category: "", level: "BEGINNER" });
  const [studentsDialog, setStudentsDialog] = useState<{ courseId: number; title: string } | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  const loadCourses = () => {
    coursesApi.myCourses().then(res => {
      setMyCourses(Array.isArray(res) ? res : res.content || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const openCreate = () => {
    setEditingCourse(null);
    setForm({ title: "", description: "", price: "0", category: "", level: "BEGINNER" });
    setDialogOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditingCourse(c);
    setForm({ title: c.title, description: c.description, price: String(c.price), category: c.category, level: c.level });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form, price: parseFloat(form.price) || 0 };
    try {
      if (editingCourse) {
        await coursesApi.update(editingCourse.id, data);
        toast.success("Course updated");
      } else {
        await coursesApi.create(data);
        toast.success("Course created");
      }
      setDialogOpen(false);
      loadCourses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    try {
      await coursesApi.delete(id);
      toast.success("Course deleted");
      loadCourses();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleThumbnail = async (courseId: number, file: File) => {
    try {
      await coursesApi.uploadThumbnail(courseId, file);
      toast.success("Thumbnail uploaded");
      loadCourses();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  const viewStudents = async (courseId: number, title: string) => {
    setStudentsDialog({ courseId, title });
    try {
      const res = await enrollApi.students(courseId);
      setStudents(Array.isArray(res) ? res : res.content || []);
    } catch { setStudents([]); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your courses, {user?.name}</p>
        </div>
        <Button onClick={openCreate} className="gradient-accent border-0 text-accent-foreground font-semibold">
          <Plus className="h-4 w-4 mr-1" /> New Course
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-24 rounded-lg bg-secondary animate-pulse" />)}</div>
      ) : myCourses.length > 0 ? (
        <div className="space-y-4">
          {myCourses.map(c => (
            <div key={c.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="h-16 w-24 rounded bg-secondary overflow-hidden flex-shrink-0">
                {c.thumbnailUrl ? <img src={c.thumbnailUrl} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No image</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground truncate">{c.title}</h3>
                <p className="text-xs text-muted-foreground">{c.level} · {c.category} · ${c.price} · {c.totalReviews} reviews</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleThumbnail(c.id, e.target.files[0])} />
                  <div className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-accent/10 transition-colors"><Image className="h-4 w-4 text-muted-foreground" /></div>
                </label>
                <Button variant="ghost" size="icon" onClick={() => viewStudents(c.id, c.title)}><Users className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg border border-border bg-card">
          <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
          <Button onClick={openCreate} className="gradient-accent border-0 text-accent-foreground font-semibold">Create your first course</Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingCourse ? "Edit Course" : "New Course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full gradient-accent border-0 text-accent-foreground font-semibold">
              {editingCourse ? "Update" : "Create"} Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Students Dialog */}
      <Dialog open={!!studentsDialog} onOpenChange={() => setStudentsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Students — {studentsDialog?.title}</DialogTitle>
          </DialogHeader>
          {students.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {students.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded border border-border">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                    {(s.studentName || s.name || "?")[0]}
                  </div>
                  <span className="text-sm text-foreground">{s.studentName || s.name || "Student"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorDashboard;
