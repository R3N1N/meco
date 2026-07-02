import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import API from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to change this user's account status to ${nextStatus.toUpperCase()}?`)) return;

    setUpdatingId(id);
    try {
      await API.put(`/admin/users/${id}/status`, { status: nextStatus });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading system users registry...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">System Users Management</h2>
          <p className="text-xs text-slate-400">Review patient and practitioner registrations</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 text-slate-100 rounded-lg pl-9 pr-4 py-1.5 border border-slate-800 focus:outline-none focus:border-teal-500 text-xs"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead>
              <tr className="bg-navy-950 text-black border-b border-slate-800">
                <th className="p-4 font-semibold uppercase tracking-wider">User Details</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Role</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Phone / Location</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/10">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-teal-400">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-black text-xs leading-none">{u.name}</span>
                        <span className="text-[10px] text-white mt-1 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.role === 'doctor' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5 text-slate-400 text-[10px]">
                      <span>Phone: {u.phone || 'N/A'}</span>
                      <span className="truncate max-w-[180px]" title={u.address}>Addr: {u.address || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${u.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      disabled={updatingId === u.id}
                      onClick={() => toggleStatus(u.id, u.status)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${u.status === 'active'
                        ? 'border-red-900/40 bg-red-950/20 hover:bg-red-900/20 text-red-400'
                        : 'border-green-900/40 bg-green-950/20 hover:bg-green-900/20 text-green-400'
                        }`}
                    >
                      {updatingId === u.id ? 'Saving...' : u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No registry rows match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
