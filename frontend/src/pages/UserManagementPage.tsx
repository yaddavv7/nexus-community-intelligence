import React from 'react';
import { Users, Shield, UserCheck, Mail, Phone, MapPin, Key } from 'lucide-react';

const SAMPLE_USERS = [
  {
    id: 1,
    name: 'Arjun Menon',
    email: 'admin@nexus.gov.in',
    role: 'Administrator',
    locality: 'Kochi Municipal Headquarters',
    phone: '+91 98470 11223',
    department: 'Directorate of Civic Operations',
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: 2,
    name: 'Reshma Pillai',
    email: 'volunteer@nexus.gov.in',
    role: 'Field Volunteer',
    locality: 'Aluva & Kalamassery Sector',
    phone: '+91 94471 88990',
    department: 'Kochi Rapid Response Wing',
    status: 'Active',
    lastActive: '22 mins ago',
  },
  {
    id: 3,
    name: 'Naveen George',
    email: 'citizen@nexus.gov.in',
    role: 'Citizen Contributor',
    locality: 'Kakkanad SmartCity Zone',
    phone: '+91 97455 33445',
    department: 'Resident Contributor (Level 4)',
    status: 'Active',
    lastActive: '1 hour ago',
  },
  {
    id: 4,
    name: 'Deepak Raj',
    email: 'deepak.pwd@kerala.gov.in',
    role: 'Municipal Officer',
    locality: 'Kalamassery Civic Zone',
    phone: '+91 94950 12345',
    department: 'PWD Urban Roads Division',
    status: 'Active',
    lastActive: 'Yesterday',
  },
  {
    id: 5,
    name: 'Clara Fernandez',
    email: 'clara.fortkochi@gmail.com',
    role: 'Citizen Contributor',
    locality: 'Fort Kochi Heritage Ward',
    phone: '+91 98460 55667',
    department: 'Resident Contributor (Level 2)',
    status: 'Active',
    lastActive: '2 days ago',
  },
];

export const UserManagementPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Role-Based Access Control (RBAC) Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">USER & ROLE MANAGEMENT</h1>
        <p className="text-xs text-slate-400">
          Governing citizen contributors, field response squads, and verified municipal engineering personnel
        </p>
      </div>

      {/* RBAC Policies Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-cyan-400">Citizen Role</span>
          <p className="text-xs text-slate-200 font-semibold">Public Problem Reporting</p>
          <p className="text-[11px] text-slate-400">
            Submit photos, mark map points, confirm active hazards, track personal complaints.
          </p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-400">Field Volunteer Role</span>
          <p className="text-xs text-slate-200 font-semibold">Field Triage & Remediation</p>
          <p className="text-[11px] text-slate-400">
            Access assigned coordinates, upload completion photographs, mark tickets resolved.
          </p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-purple-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-purple-400">Administrator Role</span>
          <p className="text-xs text-slate-200 font-semibold">Authoritative Oversight</p>
          <p className="text-[11px] text-slate-400">
            Verify/reject reports, merge duplicates, override priority, dispatch work orders.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Registered Stakeholder Directory</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-nexus-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Name & Email</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Ward / Locality</th>
                <th className="py-2.5 px-3">Department / Division</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SAMPLE_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-nexus-850/60 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-100">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        u.role === 'Administrator'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : u.role === 'Field Volunteer'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{u.locality}</td>
                  <td className="py-3 px-3 text-slate-400">{u.department}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center text-emerald-400 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 text-[10px]">
                    <span className="font-mono">{u.lastActive}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
