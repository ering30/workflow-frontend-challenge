import { useCallback, useContext } from 'react';
import { addEdge, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';

import { WorkflowEditorContext } from '@/contexts/WorkflowEditorContext';

import nodeTypes from '@/components/nodes/NodeTypes';

const handleDragStart = (event: DragStartEvent, setActiveItem: (id: UniqueIdentifier) => void) => {
  const { active } = event;
  setActiveItem(active.id);
};

interface HandleDragEndParams {
  event: DragEndEvent;
  hasNodes: boolean;
  hasStartNode: boolean;
  hasEndNode: boolean;
  nodes: Node[];
  setActiveItem: (id: UniqueIdentifier) => void;
  setNodes: (nodes: Node[]) => void;
  setWorkflowErrors: (errors: string[]) => void;
  workflowErrors: string[];
}

const handleDragEnd = (params: HandleDragEndParams) => {
  const {
    event,
    hasEndNode,
    hasNodes,
    hasStartNode,
    nodes,
    setActiveItem,
    setNodes,
    setWorkflowErrors,
    workflowErrors,
  } = params;

  const { active } = event;
  const nodeId = active.id as string;
  const isStartBlock = nodeId.startsWith('start');
  const isEndBlock = nodeId.startsWith('end');
  const newNodeId = hasNodes ? `${nodeId}_${nodes.length + 1}` : nodeId;
  const label = () => {
    if (isStartBlock) return 'Start';
    if (isEndBlock) return 'End';
    return 'New Node';
  };

  if (hasStartNode && isStartBlock) {
    if (workflowErrors.includes('Only one Start Block is allowed')) return;
    setWorkflowErrors([...workflowErrors, 'Only one Start Block is allowed']);
    return;
  }
  if (hasEndNode && isEndBlock) {
    if (workflowErrors.includes('Only one End Block is allowed')) return;
    setWorkflowErrors([...workflowErrors, 'Only one End Block is allowed']);
    return;
  }

  const dropTarget = document.getElementsByClassName(
    'react-flow__pane draggable'
  )[0] as HTMLElement;
  if (!dropTarget) return;

  const rect = dropTarget.getBoundingClientRect();
  const offset = {
    x: event.delta.x - rect.left,
    y: event.delta.y - rect.top,
  };

  const newNode = {
    id: newNodeId,
    type: active.id,
    position: {
      x: offset.x,
      y: offset.y,
    },
    data: {
      fields: [],
      label: label(),
      type: active.id,
    },
  };

  setNodes((nodes: Node[]) => [...nodes, newNode]);
  setActiveItem(null);
};

const handleSave = (nodes: Node[], edges: Edge[], setShowSaveDialog: (value: boolean) => void) => {
  const workflowConfig = {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    })),
    metadata: {
      name: 'Sample Workflow',
      version: '1.0.0',
      created: new Date().toISOString(),
    },
  };

  console.log('Workflow Configuration:', JSON.stringify(workflowConfig, null, 2));

  setShowSaveDialog(true);
};

export default function useWorkflowEditor() {
  const workflowContext = useContext(WorkflowEditorContext);
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    showSaveDialog,
    setShowSaveDialog,
    workflowErrors,
    setWorkflowErrors,
    activeItem,
    setActiveItem,
    hasNodes,
    hasStartNode,
    hasEndNode,
  } = workflowContext;

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return {
    callbacks: {
      handleDragStart: (event: DragStartEvent) => handleDragStart(event, setActiveItem),
      handleSave: () => handleSave(nodes, edges, setShowSaveDialog),
      handleDragEnd: (event: DragEndEvent) =>
        handleDragEnd({
          event,
          hasNodes,
          hasStartNode,
          hasEndNode,
          nodes,
          setActiveItem,
          setNodes,
          setWorkflowErrors,
          workflowErrors,
        }),
    },
    nodeTypes,
    onConnect,
  };
}

export type UseWorkflowEditorPayload = ReturnType<typeof useWorkflowEditor>;
