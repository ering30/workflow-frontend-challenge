import { useDraggable } from "@dnd-kit/core";
import { Play, FileText, GitBranch, Square, Globe } from 'lucide-react';

export default function useDraggableBlocks() {
  const blocks = [
    {
      id: 'start',
      name: 'Start Block',
      icon: Play,
      description: 'Starting point of the workflow',
      color: '#10b981',
      darkColor: '#059669',
      callbacks: {
        draggable: (id: string) => useDraggable({ id }),
      },
    },
    {
      id: 'form',
      name: 'Form Block',
      icon: FileText,
      description: 'User input form',
      color: '#3b82f6',
      darkColor: '#2563eb',
      callbacks: {
        draggable: (id: string) => useDraggable({ id }),
      },
    },
    {
      id: 'conditional',
      name: 'Conditional Block',
      icon: GitBranch,
      description: 'Decision point with conditions',
      color: '#f59e0b',
      darkColor: '#d97706',
      callbacks: {
        draggable: (id: string) => useDraggable({ id }),
      },
    },
    {
      id: 'api',
      name: 'API Block',
      icon: Globe,
      description: 'Make HTTP API calls',
      color: '#a855f7',
      darkColor: '#9333ea',
      callbacks: {
        draggable: (id: string) => useDraggable({ id }),
      },
    },
    {
      id: 'end',
      name: 'End Block',
      icon: Square,
      description: 'End point of the workflow',
      color: '#ef4444',
      darkColor: '#dc2626',
      callbacks: {
        draggable: (id: string) => useDraggable({ id }),
      },
    },
  ];

  return {
    blocks,
  }
}