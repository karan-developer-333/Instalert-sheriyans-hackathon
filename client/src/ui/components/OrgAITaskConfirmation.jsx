import { useState } from "react";
import { Building2, UserMinus, AlertTriangle, Loader2, CheckCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

export default function OrgAITaskConfirmation({ action, onConfirm, onCancel }) {
  const [executing, setExecuting] = useState(false);

  const getIcon = () => {
    switch (action?.actionType) {
      case "create_incident":
        return <Building2 className="w-8 h-8 text-[#37322F]" />;
      case "remove_user":
        return <UserMinus className="w-8 h-8 text-red-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getTitle = () => {
    switch (action?.actionType) {
      case "create_incident":
        return "Create Incident";
      case "remove_user":
        return "Remove User";
      default:
        return "Execute Action";
    }
  };

  const getDescription = () => {
    switch (action?.actionType) {
      case "create_incident":
        return `Create an incident titled "${action.params?.title}"`;
      case "remove_user":
        return `Remove user from organization`;
      default:
        return action?.params?.reason || "Execute suggested action";
    }
  };

  const handleConfirm = async () => {
    setExecuting(true);
    try {
      await onConfirm(action.actionType, action.params);
    } finally {
      setExecuting(false);
    }
  };

  if (!action) return null;

  return (
    <div className="px-4 py-4">
      <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#37322F]/10 rounded-lg">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{getTitle()}</CardTitle>
              <CardDescription>{getDescription()}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {action.params?.description && (
            <div className="bg-[#F7F5F3] rounded-lg p-3 mb-4">
              <p className="text-sm text-[#49423D]">{action.params.description}</p>
            </div>
          )}
          {action.params?.reason && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-blue-50 border border-blue-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">{action.params.reason}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={executing}
              className="flex-1 bg-[#37322F] hover:bg-[#37322F]/90"
            >
              {executing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {executing ? "Executing..." : "Confirm"}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={executing}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
