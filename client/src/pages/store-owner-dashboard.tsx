import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LogOut, Star, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SimpleOwner() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch owned stores
  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
    select: (data: any[]) => data.filter(store => store.ownerId === (user as any)?.id),
  });

  const store = stores[0]; // Assuming one store per owner

  // Fetch store stats
  const { data: storeStats } = useQuery({
    queryKey: ["/api/stores", store?.id, "stats"],
    enabled: !!store?.id,
    queryFn: async () => {
      const response = await fetch(`/api/stores/${store.id}/stats`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch store stats');
      return response.json();
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Store Owner Dashboard</h1>
            <Button onClick={() => logoutMutation.mutate()} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No store assigned to your account.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Store Owner Dashboard</h1>
          <Button onClick={() => logoutMutation.mutate()} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Store Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Store className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h2 className="text-2xl font-semibold">{store.name}</h2>
                <p className="text-gray-600">{store.email}</p>
                <p className="text-sm text-gray-500">{store.address}</p>
              </div>
            </div>
            
            {storeStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {renderStars(storeStats.averageRating || 0)}
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {storeStats.averageRating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {storeStats.totalRatings || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ratings Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
            {storeStats?.ratings?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storeStats.ratings.map((rating: any) => (
                    <TableRow key={rating.id}>
                      <TableCell>{rating.user.name}</TableCell>
                      <TableCell>{rating.user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {renderStars(rating.rating)}
                          </div>
                          <span className="text-sm">{rating.rating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(rating.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No ratings yet for your store.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}