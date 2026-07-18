'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orgApi } from '@/lib/api';
import { OrgTreeNode } from '@/types';
import { getInitials, cn } from '@/lib/utils';
import { Network, ChevronDown, ChevronRight, Search, Users, UserCircle } from 'lucide-react';

function TreeNode({ node, level = 0, searchTerm }: { node: OrgTreeNode; level?: number; searchTerm: string }) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const router = useRouter();
  const hasChildren = node.children.length > 0;

  const matchesSearch = searchTerm
    ? `${node.firstName} ${node.lastName} ${node.designation} ${node.department} ${node.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    : true;

  const hasMatchingDescendant = (n: OrgTreeNode): boolean => {
    if (searchTerm && `${n.firstName} ${n.lastName} ${n.designation} ${n.department} ${n.email}`
      .toLowerCase().includes(searchTerm.toLowerCase())) return true;
    return n.children.some(hasMatchingDescendant);
  };

  const showNode = !searchTerm || matchesSearch || hasMatchingDescendant(node);

  if (!showNode) return null;

  // Auto-expand when searching
  const isExpanded = searchTerm ? true : expanded;

  return (
    <div className="relative">
      {/* Connecting line */}
      {level > 0 && (
        <div className="absolute -left-6 top-0 w-6 h-8 border-l-2 border-b-2 border-border/50 rounded-bl-xl" />
      )}

      <div
        className={cn(
          'org-node mb-3 animate-fade-in',
          matchesSearch && searchTerm && 'ring-2 ring-primary/50'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!isExpanded)}
              className="btn-ghost p-1 rounded-lg shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/employees/${node.id}`)}
          >
            {getInitials(node.firstName, node.lastName)}
          </div>

          {/* Info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => router.push(`/employees/${node.id}`)}
          >
            <p className="text-sm font-semibold text-foreground truncate">
              {node.firstName} {node.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{node.designation}</p>
          </div>

          {/* Department badge */}
          <span className="badge bg-primary/10 text-primary text-[10px] shrink-0 hidden sm:inline-flex">
            {node.department}
          </span>

          {/* Children count */}
          {hasChildren && (
            <span className="text-xs text-muted-foreground shrink-0">
              <Users className="w-3 h-3 inline mr-1" />
              {node.children.length}
            </span>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-10 pl-6 border-l-2 border-border/30 space-y-0">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [tree, setTree] = useState<OrgTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              <TreeNode key={node.id} node={node} searchTerm={search} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
