import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function JoinCodeInput({ onJoin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a join code");
      return;
    }
    setError("");
    onJoin(code.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="joinCode">Organization Join Code</Label>
        <div className="flex gap-2">
          <Input
            id="joinCode"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="e.g. KALKI-XXXXXXXXX"
            className="uppercase tracking-wider"
          />
          <Button type="submit" className="bg-[#37322F] hover:bg-[#37322F]/90 shrink-0">
            Join <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
