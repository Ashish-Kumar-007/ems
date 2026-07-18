'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orgApi } from '@/lib/api';
import { OrgTreeNode } from '@/types';
import { getInitials, cn } from '@/lib/utils';
import { Network, ChevronDown, ChevronRight, Search, Users, UserCircle } from 'lucide-react';

import { OrgTreeNode as OrgTreeNodeComponent } from './OrgTreeNode';
import { useDebounce } from '@/hooks/useDebounce';

export default function OrganizationPage() {
  const [tree, setTree] = useState<OrgTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await orgApi.getTree();
        setTree(response.data.data);
      } catch (error) {
        console.error('Failed to fetch org tree:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  const totalNodes = (nodes: OrgTreeNode[]): number =>
    nodes.reduce((sum, n) => sum + 1 + totalNodes(n.children), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 rounded-xl bg-muted animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse ml-[calc(theme(spacing[10])*${i})]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            <Network className="w-7 h-7 inline mr-2 text-primary" />
            Organization Tree
          </h1>
          <p className="text-muted-foreground mt-1">
            Reporting hierarchy — {totalNodes(tree)} employees
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, designation, department..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="glass-card p-6">
        {tree.length === 0 ? (
          <div className="text-center py-12">
            <UserCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No organizational data available</p>
          </div>
        ) : (
          <div className="space-y-0">
            {tree.map((node) => (
              <OrgTreeNodeComponent key={node.id} node={node} searchTerm={debouncedSearchTerm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
