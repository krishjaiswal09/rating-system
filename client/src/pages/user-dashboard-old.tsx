import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Star, Store } from "lucide-react";

export default function SimpleUser() {
  const [search, setSearch] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: stores = [] } = useQuery({ queryKey: ["/api/stores"] });
  const { data: userRatings = [] } = useQuery({ queryKey: ["/api/ratings/user"] });

  // Filter stores
  const filteredStores = stores.filter((store: any) =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.address.toLowerCase().includes(search.toLowerCase())
  );

  // Get user's rating for a store
  const getUserRating = (storeId: string) => {
    const userRating = userRatings.find((r: any) => r.storeId === storeId);
    return userRating?.rating || 0;
  };

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });

  // Submit rating
  const ratingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/ratings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/user"] });
      setShowRatingModal(false);
      setSelectedStore(null);
      setRating(0);
      toast({ title: "Success", description: "Rating submitted successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" }),
  });

  const handleRateStore = (store: any) => {
    setSelectedStore(store);
    setRating(getUserRating(store.id));
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (rating > 0 && selectedStore) {
      ratingMutation.mutate({
        storeId: selectedStore.id,
        rating: rating
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Store Directory</h1>
          <Button onClick={() => logoutMutation.mutate()} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store: any) => {
            const userRating = getUserRating(store.id);
            return (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Store className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{store.name}</h3>
                  <p className="text-gray-600 mb-2">{store.email}</p>
                  <p className="text-sm text-gray-500 mb-4">{store.address}</p>
                  
                  {/* Average Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex mr-2">
                      {renderStars(Math.round(store.averageRating || 0))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {store.averageRating ? store.averageRating.toFixed(1) : '0.0'} 
                      ({store.totalRatings || 0} reviews)
                    </span>
                  </div>

                  {/* User's Rating */}
                  {userRating > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Your rating: </span>
                      <span className="text-sm font-medium text-blue-600">{userRating} stars</span>
                    </div>
                  )}

                  <Button
                    onClick={() => handleRateStore(store)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {userRating ? 'Update Rating' : 'Rate Store'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No stores found matching your search.</p>
          </div>
        )}

        {/* Rating Modal */}
        <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate {selectedStore?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">How would you rate this store?</p>
              <div className="flex justify-center mb-6">
                {renderStars(rating, true, setRating)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowRatingModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={submitRating} disabled={rating === 0 || ratingMutation.isPending} className="flex-1">
                  {ratingMutation.isPending ? "Submitting..." : "Submit Rating"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}