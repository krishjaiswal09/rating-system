import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

export default function SimpleAdmin() {
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [storeForm, setStoreForm] = useState({ name: "", email: "", address: "", ownerId: "" });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: stats } = useQuery({ queryKey: ["/api/stats"] });
  const { data: users = [] } = useQuery({ queryKey: ["/api/users"] });
  const { data: stores = [] } = useQuery({ queryKey: ["/api/stores"] });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });

  // Create user
  const createUserMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setUserForm({ name: "", email: "", password: "", address: "", role: "user" });
      setShowUserForm(false);
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to create user", variant: "destructive" }),
  });

  // Create store
  const createStoreMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/stores", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setStoreForm({ name: "", email: "", address: "", ownerId: "" });
      setShowStoreForm(false);
      toast({ title: "Success", description: "Store created successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to create store", variant: "destructive" }),
  });

  const storeOwners = users.filter((u: any) => u.role === "store_owner");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={() => logoutMutation.mutate()} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Total Stores</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.totalStores || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Total Ratings</h3>
              <p className="text-3xl font-bold text-purple-600">{stats?.totalRatings || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowUserForm(!showUserForm)}>
            {showUserForm ? "Cancel" : "Add User"}
          </Button>
          <Button onClick={() => setShowStoreForm(!showStoreForm)}>
            {showStoreForm ? "Cancel" : "Add Store"}
          </Button>
        </div>

        {/* User Form */}
        {showUserForm && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} />
                </div>
                <div>
                  <Label>Role</Label>
                  <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full p-2 border rounded">
                    <option value="user">User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Input value={userForm.address} onChange={(e) => setUserForm({...userForm, address: e.target.value})} />
                </div>
              </div>
              <Button onClick={() => createUserMutation.mutate(userForm)} className="mt-4" disabled={createUserMutation.isPending}>
                Create User
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Store Form */}
        {showStoreForm && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Store</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Store Name</Label>
                  <Input value={storeForm.name} onChange={(e) => setStoreForm({...storeForm, name: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={storeForm.email} onChange={(e) => setStoreForm({...storeForm, email: e.target.value})} />
                </div>
                <div>
                  <Label>Owner</Label>
                  <select value={storeForm.ownerId} onChange={(e) => setStoreForm({...storeForm, ownerId: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select Owner</option>
                    {storeOwners.map((owner: any) => (
                      <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={storeForm.address} onChange={(e) => setStoreForm({...storeForm, address: e.target.value})} />
                </div>
              </div>
              <Button onClick={() => createStoreMutation.mutate(storeForm)} className="mt-4" disabled={createStoreMutation.isPending}>
                Create Store
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Users</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stores Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Stores</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Average Rating</TableHead>
                  <TableHead>Total Ratings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store: any) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell>{store.averageRating?.toFixed(1) || '0.0'}</TableCell>
                    <TableCell>{store.totalRatings || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}