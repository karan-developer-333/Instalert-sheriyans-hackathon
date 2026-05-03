import { UserMinus } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

export default function EmployeeRow({ employee, isOwner, onRemove }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white hover:bg-[#F7F5F3] transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-[#37322F] text-white text-sm">
            {employee.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-[#37322F]">{employee.username}</p>
          <p className="text-xs text-[#605A57]">{employee.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={employee.organizationRole === "owner" ? "default" : "outline"}>
          {employee.organizationRole || employee.role}
        </Badge>
        {isOwner && employee.organizationRole !== "owner" && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(employee._id)}
            className="text-[#605A57] hover:text-red-600 hover:bg-red-50"
            title="Remove from organization"
          >
            <UserMinus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
