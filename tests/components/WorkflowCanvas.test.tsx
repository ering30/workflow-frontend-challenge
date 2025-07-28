import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Theme } from '@radix-ui/themes';
import { DndContext } from '@dnd-kit/core';
import WorkflowCanvas from '../../src/components/WorkflowEditor/components/WorkflowCanvas';
import { WorkflowEditorContext } from '../../src/contexts/WorkflowEditorContext';
import { ModalContext } from '../../src/contexts/ModalContext';
import nodeTypes from '../../src/components/nodes/NodeTypes';

// Mock ReactFlow and its components
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, onNodeClick, nodes, edges, fitView, nodeTypes, onConnect, onNodesChange, onEdgesChange, ...props }: any) => (
    <div 
      data-testid="react-flow" 
      data-fit-view={fitView}
      data-has-node-types={!!nodeTypes}
      data-has-on-connect={!!onConnect}
      data-has-nodes={!!nodes}
      data-has-edges={!!edges}
      data-has-on-nodes-change={!!onNodesChange}
      data-has-on-edges-change={!!onEdgesChange}
      {...props}
    >
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
}));

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
  }),
  DndContext: ({ children, onDragEnd }: any) => <div data-testid="dnd-context">{children}</div>,
}));

// Mock the modal hooks
const mockLaunchFormModal = vi.fn();
const mockLaunchApiModal = vi.fn();

vi.mock('../../src/hooks/useModals', () => ({
  default: () => ({
    callbacks: {
      launchFormModal: mockLaunchFormModal,
      launchApiModal: mockLaunchApiModal,
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
  },
  {
    id: 'form-1',
    type: 'form',
    position: { x: 300, y: 100 },
    data: { label: 'Form Node', customName: 'User Form' },
  },
  {
    id: 'api-1',
    type: 'api',
    position: { x: 500, y: 100 },
    data: { label: 'API Node', customName: 'Submit Data' },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 700, y: 100 },
    data: { label: 'End Node' },
  },
];

const mockEdges = [
  { id: 'e1-2', source: 'start-1', target: 'form-1' },
  { id: 'e2-3', source: 'form-1', target: 'api-1' },
  { id: 'e3-4', source: 'api-1', target: 'end-1' },
];

const createMockWorkflowContext = (
  nodes: any[] = [],
  edges: any[] = [],
  workflowErrors: string[] = []
) => ({
  nodes,
  edges,
  setNodes: vi.fn(),
  onNodesChange: vi.fn(),
  setEdges: vi.fn(),
  onEdgesChange: vi.fn(),
  showSaveDialog: false,
  setShowSaveDialog: vi.fn(),
  workflowErrors,
  setWorkflowErrors: vi.fn(),
  activeItem: null,
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

const renderWorkflowCanvas = (
  workflowContext = createMockWorkflowContext(),
  modalContext = createMockModalContext(),
  props = {}
) => {
  const defaultProps = {
    nodeTypes,
    onConnect: vi.fn(),
    ...props,
  };

  return render(
    <Theme>
      <ModalContext.Provider value={modalContext as any}>
        <WorkflowEditorContext.Provider value={workflowContext as any}>
          <DndContext onDragEnd={() => {}}>
            <WorkflowCanvas {...defaultProps} />
          </DndContext>
        </WorkflowEditorContext.Provider>
      </ModalContext.Provider>
    </Theme>
  );
};

describe('WorkflowCanvas Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the workflow canvas container', () => {
      renderWorkflowCanvas();
      
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(document.getElementById('workflow-canvas')).toBeInTheDocument();
    });

    it('renders ReactFlow with correct components', () => {
      renderWorkflowCanvas();
      
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('minimap')).toBeInTheDocument();
      expect(screen.getByTestId('controls')).toBeInTheDocument();
      expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('sets up droppable area with correct id', () => {
      renderWorkflowCanvas();
      
      // The canvas should have the correct id for drag and drop
      expect(document.getElementById('workflow-canvas')).toBeInTheDocument();
    });
  });

  describe('Node Rendering', () => {
    it('renders nodes from workflow context', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('node-start-1')).toBeInTheDocument();
      expect(screen.getByTestId('node-form-1')).toBeInTheDocument();
      expect(screen.getByTestId('node-api-1')).toBeInTheDocument();
      expect(screen.getByTestId('node-end-1')).toBeInTheDocument();
    });

    it('renders different node types correctly', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('node-start-1')).toHaveAttribute('data-node-type', 'start');
      expect(screen.getByTestId('node-form-1')).toHaveAttribute('data-node-type', 'form');
      expect(screen.getByTestId('node-api-1')).toHaveAttribute('data-node-type', 'api');
      expect(screen.getByTestId('node-end-1')).toHaveAttribute('data-node-type', 'end');
    });

    it('renders empty canvas when no nodes exist', () => {
      const workflowContext = createMockWorkflowContext([], []);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('nodes-container')).toBeEmptyDOMElement();
    });
  });

  describe('Edge Rendering', () => {
    it('renders edges from workflow context', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('edge-start-1-form-1')).toBeInTheDocument();
      expect(screen.getByTestId('edge-form-1-api-1')).toBeInTheDocument();
      expect(screen.getByTestId('edge-api-1-end-1')).toBeInTheDocument();
    });

    it('renders empty edges container when no edges exist', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, []);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('edges-container')).toBeEmptyDOMElement();
    });
  });

  describe('Node Interaction', () => {
    it('launches form modal when form node is clicked', async () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      const formNode = screen.getByTestId('node-form-1');
      fireEvent.click(formNode);
      
      await waitFor(() => {
        expect(mockLaunchFormModal).toHaveBeenCalledWith({
          data: expect.objectContaining({
            id: 'form-1',
            type: 'form',
          }),
        });
      });
    });

    it('launches API modal when API node is clicked', async () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      const apiNode = screen.getByTestId('node-api-1');
      fireEvent.click(apiNode);
      
      await waitFor(() => {
        expect(mockLaunchApiModal).toHaveBeenCalledWith({
          data: expect.objectContaining({
            id: 'api-1',
            type: 'api',
          }),
        });
      });
    });

    it('does not launch modals for start nodes', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      const startNode = screen.getByTestId('node-start-1');
      fireEvent.click(startNode);
      
      expect(mockLaunchFormModal).not.toHaveBeenCalled();
      expect(mockLaunchApiModal).not.toHaveBeenCalled();
    });

    it('does not launch modals for end nodes', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      const endNode = screen.getByTestId('node-end-1');
      fireEvent.click(endNode);
      
      expect(mockLaunchFormModal).not.toHaveBeenCalled();
      expect(mockLaunchApiModal).not.toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('displays workflow errors when they exist', () => {
      const workflowErrors = ['Missing start node', 'Invalid connection'];
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, workflowErrors);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByText('Workflow Errors: Missing start node, Invalid connection')).toBeInTheDocument();
    });

    it('applies correct error styling', () => {
      const workflowErrors = ['Test error'];
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, workflowErrors);
      renderWorkflowCanvas(workflowContext);
      
      const errorContainer = screen.getByText('Workflow Errors: Test error').closest('div');
      expect(errorContainer).toHaveStyle({
        backgroundColor: '#fef2f2',
        borderBottom: '1px solid #fecaca',
      });
    });

    it('does not display error section when no errors exist', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, []);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.queryByText(/Workflow Errors/)).not.toBeInTheDocument();
    });

    it('displays multiple errors correctly', () => {
      const workflowErrors = ['Error 1', 'Error 2', 'Error 3'];
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, workflowErrors);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByText('Workflow Errors: Error 1, Error 2, Error 3')).toBeInTheDocument();
    });
  });

  describe('Props Integration', () => {
    it('passes nodeTypes prop to ReactFlow', () => {
      const customNodeTypes = { custom: () => <div>Custom Node</div> };
      renderWorkflowCanvas(undefined, undefined, { nodeTypes: customNodeTypes });
      
      const reactFlow = screen.getByTestId('react-flow');
      expect(reactFlow).toHaveAttribute('data-has-node-types', 'true');
    });

    it('passes onConnect prop to ReactFlow', () => {
      const mockOnConnect = vi.fn();
      renderWorkflowCanvas(undefined, undefined, { onConnect: mockOnConnect });
      
      const reactFlow = screen.getByTestId('react-flow');
      expect(reactFlow).toHaveAttribute('data-has-on-connect', 'true');
    });

    it('uses context data for nodes and edges', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      const reactFlow = screen.getByTestId('react-flow');
      expect(reactFlow).toHaveAttribute('data-has-nodes', 'true');
      expect(reactFlow).toHaveAttribute('data-has-edges', 'true');
    });

    it('passes context callbacks to ReactFlow', () => {
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      const reactFlow = screen.getByTestId('react-flow');
      expect(reactFlow).toHaveAttribute('data-has-on-nodes-change', 'true');
      expect(reactFlow).toHaveAttribute('data-has-on-edges-change', 'true');
    });
  });

  describe('Complex Workflow Scenarios', () => {
    it('handles workflow with conditional nodes', () => {
      const nodesWithConditional = [
        ...mockNodes,
        {
          id: 'conditional-1',
          type: 'conditional',
          position: { x: 400, y: 200 },
          data: { label: 'Conditional Node' },
        },
      ];
      const workflowContext = createMockWorkflowContext(nodesWithConditional, mockEdges);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('node-conditional-1')).toBeInTheDocument();
      expect(screen.getByTestId('node-conditional-1')).toHaveAttribute('data-node-type', 'conditional');
    });

    it('handles empty workflow state', () => {
      const workflowContext = createMockWorkflowContext([], []);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('nodes-container')).toBeEmptyDOMElement();
      expect(screen.getByTestId('edges-container')).toBeEmptyDOMElement();
    });

    it('handles workflow with disconnected nodes', () => {
      const disconnectedNodes = [
        {
          id: 'isolated-1',
          type: 'form',
          position: { x: 100, y: 300 },
          data: { label: 'Isolated Node' },
        },
        {
          id: 'isolated-2',
          type: 'api',
          position: { x: 300, y: 300 },
          data: { label: 'Another Isolated Node' },
        },
      ];
      const workflowContext = createMockWorkflowContext(disconnectedNodes, []);
      renderWorkflowCanvas(workflowContext);
      
      expect(screen.getByTestId('node-isolated-1')).toBeInTheDocument();
      expect(screen.getByTestId('node-isolated-2')).toBeInTheDocument();
      expect(screen.getByTestId('edges-container')).toBeEmptyDOMElement();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible structure with proper elements', () => {
      renderWorkflowCanvas();
      
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(document.getElementById('workflow-canvas')).toBeInTheDocument();
    });

    it('includes accessible error messages', () => {
      const workflowErrors = ['Accessibility test error'];
      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges, workflowErrors);
      renderWorkflowCanvas(workflowContext);
      
      const errorText = screen.getByText('Workflow Errors: Accessibility test error');
      expect(errorText).toBeInTheDocument();
      expect(errorText.closest('[class*="rt-Text"]')).toBeInTheDocument();
    });
  });
});