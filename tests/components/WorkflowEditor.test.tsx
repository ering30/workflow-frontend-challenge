import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Theme } from '@radix-ui/themes';
import WorkflowEditor from '../../src/components/WorkflowEditor';
import { WorkflowEditorContext } from '../../src/contexts/WorkflowEditorContext';
import { ModalContext } from '../../src/contexts/ModalContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console methods
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
Object.defineProperty(window, 'console', {
  value: consoleMock,
});

// Mock ReactFlow
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, onNodeClick, nodes, edges, onConnect, onNodesChange, onEdgesChange, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      <div data-testid="nodes-container">
        {nodes?.map((node: any) => (
          <div 
            key={node.id} 
            data-testid={`node-${node.id}`}
            data-node-type={node.type}
            onClick={() => onNodeClick && onNodeClick({}, node)}
          >
            {node.data?.label || node.type}
          </div>
        ))}
      </div>
      <div data-testid="edges-container">
        {edges?.map((edge: any, index: number) => (
          <div key={index} data-testid={`edge-${edge.source}-${edge.target}`}>
            {edge.source} → {edge.target}
          </div>
        ))}
      </div>
      {children}
    </div>
  ),
  MiniMap: () => <div data-testid="minimap">MiniMap</div>,
  Controls: () => <div data-testid="controls">Controls</div>,
  Background: () => <div data-testid="background">Background</div>,
  addEdge: (connection: any, edges: any[]) => [...edges, { ...connection, id: `e${edges.length + 1}` }],
  useNodesState: (initialNodes: any[]) => [initialNodes, vi.fn(), vi.fn()],
  useEdgesState: (initialEdges: any[]) => [initialEdges, vi.fn(), vi.fn()],
}));

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd, onDragStart, collisionDetection }: any) => (
    <div data-testid="dnd-context" data-collision-detection={collisionDetection?.name}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => (
    <div data-testid="drag-overlay">
      {children || <div data-testid="empty-overlay">Empty Overlay</div>}
    </div>
  ),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
  }),
  useDroppable: () => ({
    setNodeRef: vi.fn(),
  }),
  closestCorners: { name: 'closestCorners' },
}));

// Mock child components
vi.mock('../../src/components/BlockPanel', () => ({
  default: () => <div data-testid="block-panel">Block Panel</div>,
}));

vi.mock('../../src/components/DraggableBlockOverlay', () => ({
  default: ({ block }: any) => (
    <div data-testid="draggable-block-overlay">
      {block ? `Overlay: ${block.name}` : 'No Block'}
    </div>
  ),
}));

vi.mock('../../src/components/WorkflowEditor/components/WorkflowCanvas', () => ({
  default: ({ onConnect, nodeTypes }: any) => (
    <div data-testid="workflow-canvas" data-has-on-connect={!!onConnect} data-has-node-types={!!nodeTypes}>
      Workflow Canvas
    </div>
  ),
}));

// Mock hooks
vi.mock('../../src/hooks/useDraggableBlocks', () => ({
  default: () => ({
    blocks: [
      { id: 'start', name: 'Start Block' },
      { id: 'form', name: 'Form Block' },
      { id: 'api', name: 'API Block' },
      { id: 'conditional', name: 'Conditional Block' },
      { id: 'end', name: 'End Block' },
    ],
  }),
}));

vi.mock('../../src/hooks/useModals', () => ({
  default: () => ({
    showModal: false,
    callbacks: {
      closeModal: vi.fn(),
      launchFormModal: vi.fn(),
      launchApiModal: vi.fn(),
    },
  }),
}));

// Test data
const mockNodes = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 100, y: 100 },
    data: { label: 'Start Node' },
    deletable: false,
  },
  {
    id: 'form-1',
    type: 'form',
    position: { x: 300, y: 100 },
    data: { label: 'Form Node', customName: 'User Form' },
    deletable: true,
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 500, y: 100 },
    data: { label: 'End Node' },
    deletable: false,
  },
];

const mockEdges = [
  { id: 'e1-2', source: 'start-1', target: 'form-1' },
  { id: 'e2-3', source: 'form-1', target: 'end-1' },
];

const createMockWorkflowContext = (
  nodes: any[] = [],
  edges: any[] = [],
  showSaveDialog: boolean = false,
  workflowErrors: string[] = [],
  activeItem: string | null = null
) => ({
  nodes,
  edges,
  setNodes: vi.fn(),
  onNodesChange: vi.fn(),
  setEdges: vi.fn(),
  onEdgesChange: vi.fn(),
  showSaveDialog,
  setShowSaveDialog: vi.fn(),
  workflowErrors,
  setWorkflowErrors: vi.fn(),
  activeItem,
  setActiveItem: vi.fn(),
  hasNodes: nodes.length > 0,
  hasStartNode: nodes.some(node => node.type === 'start'),
  hasEndNode: nodes.some(node => node.type === 'end'),
});

const createMockModalContext = () => ({
  modalData: null,
  setModalData: vi.fn(),
  showModal: false,
  setShowModal: vi.fn(),
});

const renderWorkflowEditor = (
  workflowContext = createMockWorkflowContext(),
  modalContext = createMockModalContext()
) => {
  return render(
    <Theme>
      <ModalContext.Provider value={modalContext as any}>
        <WorkflowEditorContext.Provider value={workflowContext as any}>
          <WorkflowEditor />
        </WorkflowEditorContext.Provider>
      </ModalContext.Provider>
    </Theme>
  );
};

describe('WorkflowEditor Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the main editor components', () => {
      renderWorkflowEditor();
      
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
      expect(screen.getByText('Save Workflow')).toBeInTheDocument();
      expect(screen.getByTestId('block-panel')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('renders drag and drop context with correct configuration', () => {
      renderWorkflowEditor();
      
      const dndContext = screen.getByTestId('dnd-context');
      expect(dndContext).toHaveAttribute('data-collision-detection', 'closestCorners');
    });

    it('renders drag overlay', () => {
      renderWorkflowEditor();
      
      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
    });

    it('passes correct props to WorkflowCanvas', () => {
      renderWorkflowEditor();
      
      const workflowCanvas = screen.getByTestId('workflow-canvas');
      expect(workflowCanvas).toHaveAttribute('data-has-on-connect', 'true');
      expect(workflowCanvas).toHaveAttribute('data-has-node-types', 'true');
    });
  });

  describe('Save Workflow Functionality', () => {
    it('renders save button', () => {
      renderWorkflowEditor();
      
      const saveButton = screen.getByText('Save Workflow');
      expect(saveButton).toBeInTheDocument();
    });

    it('does not show save dialog initially', () => {
      renderWorkflowEditor();
      
      expect(screen.queryByText('Workflow Saved')).not.toBeInTheDocument();
    });

    it('shows save dialog when triggered', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, true);
      renderWorkflowEditor(workflowContext);
      
      expect(screen.getByText('Workflow Saved')).toBeInTheDocument();
      expect(screen.getByText('Your workflow configuration has been saved to the browser console. Check the developer console for the complete configuration details.')).toBeInTheDocument();
    });

    it('renders close button in save dialog', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, true);
      renderWorkflowEditor(workflowContext);
      
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('calls setShowSaveDialog when close button is clicked', () => {
      const mockSetShowSaveDialog = vi.fn();
      const workflowContext = {
        ...createMockWorkflowContext(mockNodes, mockEdges, true),
        setShowSaveDialog: mockSetShowSaveDialog,
      };
      renderWorkflowEditor(workflowContext);
      
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      expect(mockSetShowSaveDialog).toHaveBeenCalledWith(false);
    });
  });

  describe('Drag and Drop Integration', () => {
    it('renders drag overlay with empty state when no active item', () => {
      renderWorkflowEditor();
      
      expect(screen.getByTestId('empty-overlay')).toBeInTheDocument();
    });

    it('renders drag overlay with active block when dragging', () => {
      const workflowContext = createMockWorkflowContext([], [], false, [], 'start');
      renderWorkflowEditor(workflowContext);
      
      expect(screen.getByText('Overlay: Start Block')).toBeInTheDocument();
    });

    it('shows drag overlay for different block types', () => {
      const workflowContext = createMockWorkflowContext([], [], false, [], 'form');
      renderWorkflowEditor(workflowContext);
      
      expect(screen.getByText('Overlay: Form Block')).toBeInTheDocument();
    });
  });

  describe('Context Integration', () => {
    it('integrates with WorkflowEditorContext correctly', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowEditor(workflowContext);
      
      // The component should render without crashing and show expected content
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-canvas')).toBeInTheDocument();
    });

    it('integrates with ModalContext correctly', () => {
      const modalContext = createMockModalContext();
      renderWorkflowEditor(undefined, modalContext);
      
      // The component should render without crashing
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
    });

    it('handles different workflow states', () => {
      // Test with empty workflow
      const emptyWorkflowContext = createMockWorkflowContext([], []);
      const { rerender } = renderWorkflowEditor(emptyWorkflowContext);
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();

      // Test with populated workflow
      const populatedWorkflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      rerender(
        <Theme>
          <ModalContext.Provider value={createMockModalContext() as any}>
            <WorkflowEditorContext.Provider value={populatedWorkflowContext as any}>
              <WorkflowEditor />
            </WorkflowEditorContext.Provider>
          </ModalContext.Provider>
        </Theme>
      );
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles workflow with errors gracefully', () => {
      const workflowContext = createMockWorkflowContext(
        mockNodes, 
        mockEdges, 
        false, 
        ['Missing required connection', 'Invalid node configuration']
      );
      renderWorkflowEditor(workflowContext);
      
      // Component should still render despite errors
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-canvas')).toBeInTheDocument();
    });

    it('handles missing context gracefully', () => {
      // This test ensures the component doesn't crash with incomplete context
      const incompleteContext = {
        nodes: [],
        edges: [],
        showSaveDialog: false,
        activeItem: null,
        // Missing some required properties
      };
      
      expect(() => {
        render(
          <Theme>
            <WorkflowEditorContext.Provider value={incompleteContext as any}>
              <WorkflowEditor />
            </WorkflowEditorContext.Provider>
          </Theme>
        );
      }).not.toThrow();
    });
  });

  describe('Component Integration', () => {
    it('integrates all child components correctly', () => {
      renderWorkflowEditor();
      
      // Verify all expected components are present
      expect(screen.getByTestId('block-panel')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('passes node types to workflow canvas', () => {
      renderWorkflowEditor();
      
      const workflowCanvas = screen.getByTestId('workflow-canvas');
      expect(workflowCanvas).toHaveAttribute('data-has-node-types', 'true');
    });

    it('provides drag and drop functionality', () => {
      renderWorkflowEditor();
      
      const dndContext = screen.getByTestId('dnd-context');
      expect(dndContext).toBeInTheDocument();
      expect(dndContext).toHaveAttribute('data-collision-detection', 'closestCorners');
    });
  });

  describe('Workflow State Management', () => {
    it('handles active item state changes', () => {
      const workflowContext = createMockWorkflowContext([], [], false, [], null);
      const { rerender } = renderWorkflowEditor(workflowContext);
      
      // Initially no active item
      expect(screen.getByTestId('empty-overlay')).toBeInTheDocument();
      
      // Change to active item
      const updatedContext = createMockWorkflowContext([], [], false, [], 'start');
      rerender(
        <Theme>
          <ModalContext.Provider value={createMockModalContext() as any}>
            <WorkflowEditorContext.Provider value={updatedContext as any}>
              <WorkflowEditor />
            </WorkflowEditorContext.Provider>
          </ModalContext.Provider>
        </Theme>
      );
      
      expect(screen.getByText('Overlay: Start Block')).toBeInTheDocument();
    });

    it('handles save dialog state changes', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, false);
      const { rerender } = renderWorkflowEditor(workflowContext);
      
      // Initially no dialog
      expect(screen.queryByText('Workflow Saved')).not.toBeInTheDocument();
      
      // Show dialog
      const updatedContext = createMockWorkflowContext(mockNodes, mockEdges, true);
      rerender(
        <Theme>
          <ModalContext.Provider value={createMockModalContext() as any}>
            <WorkflowEditorContext.Provider value={updatedContext as any}>
              <WorkflowEditor />
            </WorkflowEditorContext.Provider>
          </ModalContext.Provider>
        </Theme>
      );
      
      expect(screen.getByText('Workflow Saved')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible headings', () => {
      renderWorkflowEditor();
      
      const heading = screen.getByRole('heading', { name: 'Workflow Editor' });
      expect(heading).toBeInTheDocument();
    });

    it('provides accessible buttons', () => {
      renderWorkflowEditor();
      
      const saveButton = screen.getByRole('button', { name: /Save Workflow/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('provides accessible dialog when save dialog is shown', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, true);
      renderWorkflowEditor(workflowContext);
      
      expect(screen.getByText('Workflow Saved')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('renders efficiently with large workflows', () => {
      const largeNodes = Array.from({ length: 50 }, (_, i) => ({
        id: `node-${i}`,
        type: i % 5 === 0 ? 'start' : i % 5 === 4 ? 'end' : 'form',
        position: { x: i * 100, y: i * 50 },
        data: { label: `Node ${i}` },
        deletable: true,
      }));
      
      const largeEdges = Array.from({ length: 49 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));
      
      const workflowContext = createMockWorkflowContext(largeNodes, largeEdges);
      
      expect(() => {
        renderWorkflowEditor(workflowContext);
      }).not.toThrow();
      
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
    });

    it('handles rapid state changes gracefully', () => {
      const workflowContext = createMockWorkflowContext();
      const { rerender } = renderWorkflowEditor(workflowContext);
      
      // Simulate rapid state changes
      for (let i = 0; i < 10; i++) {
        const updatedContext = createMockWorkflowContext(
          [], 
          [], 
          i % 2 === 0, 
          [], 
          i % 3 === 0 ? 'start' : null
        );
        
        rerender(
          <Theme>
            <ModalContext.Provider value={createMockModalContext() as any}>
              <WorkflowEditorContext.Provider value={updatedContext as any}>
                <WorkflowEditor />
              </WorkflowEditorContext.Provider>
            </ModalContext.Provider>
          </Theme>
        );
      }
      
      expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
    });
  });
});
