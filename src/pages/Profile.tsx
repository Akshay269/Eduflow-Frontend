import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera } from "lucide-react";

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await users.updateProfile({ name, bio });
      await refreshProfile();
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handlePicture = async (file: File) => {
    try {
      await users.uploadPicture(file);
      await refreshProfile();
      toast.success("Profile picture updated");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">Profile</h1>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-secondary overflow-hidden border-2 border-border">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-display font-bold text-muted-foreground">
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent flex items-center justify-center cursor-pointer shadow-elevated">
              <Camera className="h-4 w-4 text-accent-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePicture(e.target.files[0])} />
            </label>
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="text-xs font-medium rounded-full bg-accent/10 text-accent px-2 py-0.5 mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell us about yourself..." />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gradient-accent border-0 text-accent-foreground font-semibold">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
