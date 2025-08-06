import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Star, Store, Settings, Search, ArrowUpDown } from "lucide-react";

export default function UserDashboard() {
  // State management
  const [search, setSearch] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: stores = [] } = useQuery({ queryKey: ["/api/stores"] });
  const { data: userRatings = [] } = useQuery({ queryKey: ["/api/ratings/user"] });

  // Filter and sort stores
  const filteredAndSortedStores = (stores as Array<{
    id: string;
    name: string;
    address: string;
    averageRating?: number;
  }>)
    .filter((store: any) =>
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.address.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (!sortField) return 0;
      const aVal = a[sortField]?.toString().toLowerCase() || "";
      const bVal = b[sortField]?.toString().toLowerCase() || "";
      if (sortOrder === "asc") return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    });

  // Helper functions
  const getUserRating = (storeId: string) => {
    const userRating = (userRatings as Array<{ storeId: string; rating: number }>).find(r => r.storeId === storeId);
    return userRating?.rating || 0;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    }
  });

  const ratingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/ratings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setShowRatingModal(false);
      toast({ title: "Rating submitted successfully!" });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/auth/update-password", data),
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast({ title: "Password updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update password", variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">User Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPasswordModal(true)}
            data-testid="button-update-password"
          >
            <Settings className="h-4 w-4 mr-2" />
            Update Password
          </Button>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search stores by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
              data-testid="input-search-stores"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Stores</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                  data-testid="header-store-name"
                >
                  <div className="flex items-center gap-2">
                    Store Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("address")}
                  data-testid="header-address"
                >
                  <div className="flex items-center gap-2">
                    Address
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Overall Rating</TableHead>
                <TableHead>Your Rating</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStores.map((store: any) => {
                const userRating = getUserRating(store.id);
                return (
                  <TableRow key={store.id}>
                    <TableCell data-testid={`text-store-name-${store.id}`}>{store.name}</TableCell>
                    <TableCell data-testid={`text-store-address-${store.id}`}>{store.address}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span data-testid={`text-overall-rating-${store.id}`}>
                          {store.averageRating ? store.averageRating.toFixed(1) : "No ratings"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {userRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                          <span data-testid={`text-user-rating-${store.id}`}>{userRating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500" data-testid={`text-no-rating-${store.id}`}>Not rated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedStore(store);
                          setRating(userRating || 1);
                          setShowRatingModal(true);
                        }}
                        data-testid={`button-rate-store-${store.id}`}
                      >
                        {userRating > 0 ? "Update Rating" : "Rate Store"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent data-testid="modal-rating">
          <DialogHeader>
            <DialogTitle>Rate {selectedStore?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating (1-5 stars)</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                    data-testid={`button-star-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  ratingMutation.mutate({
                    storeId: selectedStore?.id,
                    rating,
                  })
                }
                disabled={ratingMutation.isPending}
                data-testid="button-submit-rating"
              >
                Submit Rating
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRatingModal(false)}
                data-testid="button-cancel-rating"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Update Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent data-testid="modal-password">
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                data-testid="input-current-password"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                data-testid="input-new-password"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => updatePasswordMutation.mutate(passwordForm)}
                disabled={updatePasswordMutation.isPending}
                data-testid="button-confirm-password"
              >
                Update Password
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                data-testid="button-cancel-password"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}