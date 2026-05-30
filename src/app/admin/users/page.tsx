"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("operator");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/admin");
          return;
        }
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Auth.js authenticated with owner role
    if (status === "authenticated") {
      if (session?.user?.role !== "owner") {
        router.push("/admin");
        return;
      }
      fetchUsers();
      return;
    }
    // Bootstrap mode — no Auth.js session but has cookie
    if (status === "unauthenticated" && document.cookie.includes("admin_token=")) {
      fetchUsers();
    }
  }, [status, session, router, fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to create user");
        return;
      }

      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("operator");
      setShowAddForm(false);
      fetchUsers();
    } catch {
      setAddError("Connection error");
    } finally {
      setAddLoading(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: user.id, active: !user.active }),
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: userId, role }),
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="text-charcoal-400 text-sm">Loading users...</div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-charcoal-100">
            Admin Users
          </h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Manage who has access to the admin panel.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {showAddForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Add user form */}
      {showAddForm && (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-charcoal-200 mb-4">
            New Admin User
          </h2>

          {addError && (
            <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
              {addError}
            </div>
          )}

          <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-charcoal-400 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-charcoal-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-charcoal-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Strong password"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-xs text-charcoal-400 mb-1">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="viewer">Viewer (read-only)</option>
                <option value="operator">Operator (standard access)</option>
                <option value="owner">Owner (full access)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={addLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded transition-colors"
              >
                {addLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-800 text-charcoal-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Last Login</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-charcoal-800/50 hover:bg-charcoal-800/30"
              >
                <td className="px-4 py-3 text-charcoal-200">{user.name}</td>
                <td className="px-4 py-3 text-charcoal-400">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="bg-charcoal-800 border border-charcoal-700 rounded px-2 py-1 text-xs text-charcoal-300 focus:outline-none focus:border-emerald-500"
                    disabled={user.id === session?.user?.id}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="operator">Operator</option>
                    <option value="owner">Owner</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-charcoal-500 text-xs">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.active
                        ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
                        : "bg-red-900/30 text-red-400 border border-red-800/50"
                    }`}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.id !== session?.user?.id && (
                    <button
                      onClick={() => toggleActive(user)}
                      className={`text-xs font-medium transition-colors ${
                        user.active
                          ? "text-red-400/70 hover:text-red-400"
                          : "text-emerald-400/70 hover:text-emerald-400"
                      }`}
                    >
                      {user.active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-charcoal-500"
                >
                  No admin users found. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
