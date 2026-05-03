import { useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { User, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-[#605A57]">No profile data available.</p>
      </div>
    );
  }

  const roleColor = {
    admin: "bg-red-100 text-red-700 border-red-200",
    organization: "bg-blue-100 text-blue-700 border-blue-200",
    user: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#37322F]/10 rounded-lg">
          <User className="w-6 h-6 text-[#37322F]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#37322F]">Profile</h1>
          <p className="text-sm text-[#605A57]">Your account information</p>
        </div>
      </div>

      <Card className="border-[rgba(55,50,47,0.12)]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-[#37322F] text-white text-xl">
                {user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#605A57]" />
              <div>
                <p className="text-xs text-[#605A57] uppercase tracking-wide">Username</p>
                <p className="text-sm font-medium text-[#37322F]">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#605A57]" />
              <div>
                <p className="text-xs text-[#605A57] uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-[#37322F]">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#605A57]" />
              <div>
                <p className="text-xs text-[#605A57] uppercase tracking-wide">Role</p>
                <Badge className={`mt-1 capitalize ${roleColor[user.role] || roleColor.user}`}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
