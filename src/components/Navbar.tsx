import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, User, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <BookOpen className="h-6 w-6 text-accent" />
          EduFlow
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Courses
          </Link>
          {user ? (
            <>
              <Link
                to={user.role === "INSTRUCTOR" ? "/instructor" : "/dashboard"}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium rounded-full bg-accent/10 text-accent px-3 py-1">
                  {user.role}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button onClick={() => navigate("/register")} className="gradient-accent border-0 text-accent-foreground font-semibold">
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden space-y-3">
          <Link to="/courses" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Courses
          </Link>
          {user ? (
            <>
              <Link to={user.role === "INSTRUCTOR" ? "/instructor" : "/dashboard"} className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link to="/profile" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-sm text-destructive">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Sign in</Button>
              <Button onClick={() => { navigate("/register"); setMobileOpen(false); }} className="gradient-accent border-0 text-accent-foreground">Get Started</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
