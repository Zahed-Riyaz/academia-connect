'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '@/lib/api/opportunities';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const TYPES = [
  { value: '', label: 'All types' },
  { value: 'ra_position', label: 'Research Assistant' },
  { value: 'phd_opening', label: 'PhD Opening' },
  { value: 'masters_opening', label: 'Masters Opening' },
  { value: 'postdoc', label: 'Postdoc' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'project', label: 'Project' },
  { value: 'internship', label: 'Internship' },
];

const ROLES = [
  { value: '', label: 'All roles' },
  { value: 'professor', label: 'Professor' },
  { value: 'phd_student', label: 'PhD Student' },
  { value: 'masters_student', label: 'Masters Student' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'independent_researcher', label: 'Independent Researcher' },
];

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', { search, type, required_role: role }],
    queryFn: () => opportunitiesApi.list({ search: search || undefined, type: type || undefined, required_role: role || undefined }).then(r => r.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Opportunities</h1>
        <Button asChild size="sm">
          <Link href="/opportunities/new"><Plus className="h-4 w-4 mr-1.5" />Post opportunity</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search opportunities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {(data?.results ?? []).map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)}
          {data?.results.length === 0 && (
            <p className="text-center text-slate-500 py-12">No opportunities found.</p>
          )}
        </div>
      )}
    </div>
  );
}
