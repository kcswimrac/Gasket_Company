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
    // Just try to fetch — the middleware handles auth.
    // If we get 403, we're not authorized (not owner).
    // If we get data, we're in.
    fetchUsers();
  }, [fetchUsers]);

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

      {/* Users list */}
      <div className="space-y-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onUpdated={fetchUsers} />
        ))}
        {users.length === 0 && (
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-8 text-center text-charcoal-400">
            No admin users found. Add one above.
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, onUpdated }: { user: AdminUser; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { id: user.id };
      if (name !== user.name) body.name = name;
      if (email !== user.email) body.email = email;
      if (password) body.password = password;
      if (role !== user.role) body.role = role;

      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      setEditing(false);
      setPassword("");
      onUpdated();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const toggleActive = async () => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: user.id, active: !user.active }),
    });
    onUpdated();
  };

  const inputCls = "w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className={`bg-charcoal-900 border rounded-lg p-4 ${user.active ? "border-charcoal-800" : "border-red-800/30 opacity-60"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-charcoal-100">{user.name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
              user.role === "owner" ? "bg-amber-500/10 text-amber-400" :
              user.role === "operator" ? "bg-emerald-500/10 text-emerald-400" :
              "bg-charcoal-700 text-charcoal-400"
            }`}>{user.role}</span>
            {!user.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold">Inactive</span>}
          </div>
          <p className="text-xs text-charcoal-400">{user.email}</p>
          <p className="text-[10px] text-charcoal-500 mt-1">
            {user.last_login_at ? `Last login: ${new Date(user.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}` : "Never logged in"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setEditing(!editing)} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={toggleActive} className={`text-[11px] font-medium ${user.active ? "text-red-400/70 hover:text-red-400" : "text-emerald-400/70 hover:text-emerald-400"}`}>
            {user.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-3 border-t border-charcoal-800 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-1">New Password (leave blank to keep)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                <option value="viewer">Viewer</option>
                <option value="operator">Operator</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded uppercase tracking-wider disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
