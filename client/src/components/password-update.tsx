import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PasswordUpdateProps {
  onClose?: () => void;
}

export default function PasswordUpdate({ onClose }: PasswordUpdateProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update password");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      onClose?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Update Password</h3>
        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              data-testid="input-current-password"
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              data-testid="input-new-password"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => updatePasswordMutation.mutate({ currentPassword, newPassword })}
              disabled={updatePasswordMutation.isPending || !currentPassword || !newPassword}
              data-testid="button-update-password"
            >
              {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}