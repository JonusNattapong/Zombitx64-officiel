"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  walletAddress: string | null;
  createdAt: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/admin/users");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

const updateUser = async (user: Partial<User>): Promise<User> => {
  const response = await fetch(`/api/admin/users/${user.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("Failed to update user");
  }
  return response.json();
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: fetchUsers,
  });

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    mutate: updateUserMutation,
  }: UseMutationResult<User, Error, Partial<User>, unknown> = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setOpen(false);
      setSelectedUser(null);
    },
  });

  const {
    mutate: deleteUserMutation,
  }: UseMutationResult<void, Error, string, unknown> = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteUserMutation(id);
  };

  const handleUpdate = () => {
    if (selectedUser) {
      updateUserMutation(selectedUser);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">User Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.walletAddress}</TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                      <DialogDescription>
                        Make changes to the user profile here. Click save when
                        you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={selectedUser?.name || ""}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          value={selectedUser?.email || ""}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <Select
                          value={selectedUser?.role}
                          onValueChange={(value: string) => {
                            if (selectedUser) {
                              setSelectedUser({
                                ...selectedUser,
                                role: value,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="creator">Creator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" onClick={handleUpdate}>
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
