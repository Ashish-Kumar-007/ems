import React, { useState, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { OrgTreeNode as OrgTreeNodeType } from '@/types';
import { getInitials, cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';

interface TreeNodeProps {
  node: OrgTreeNodeType;
  level?: number;
  searchTerm: string;
}

export const OrgTreeNode = memo(function OrgTreeNode({ node, level = 0, searchTerm }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const router = useRouter();
  const hasChildren = node.children.length > 0;

  // Memoize search matching to avoid recalculating on every re-render of unrelated nodes
  const { matchesSearch, showNode } = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    const matches = term
      ? `${node.firstName} ${node.lastName} ${node.designation} ${node.department} ${node.email}`
          .toLowerCase()
          .includes(term)
      : true;

    const hasMatchingDescendant = (n: OrgTreeNodeType): boolean => {
      if (term && `${n.firstName} ${n.lastName} ${n.designation} ${n.department} ${n.email}`
        .toLowerCase().includes(term)) return true;
      return n.children.some(hasMatchingDescendant);
    };

    const show = !term || matches || hasMatchingDescendant(node);
    
    return { matchesSearch: matches, showNode: show };
  }, [node, searchTerm]);

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
            <OrgTreeNode
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
});
