import { useCallback, useContext, useEffect } from 'react';
import { addEdge, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';

import { WorkflowEditorContext } from '@/contexts/WorkflowEditorContext';

import nodeTypes from '@/components/nodes/NodeTypes';
import { FormNodeData } from '@/components/nodes/components/FormNode';

const handleDragStart = (event: DragStartEvent, setActiveItem: (id: UniqueIdentifier) => void) => {
  const { active } = event;
  setActiveItem(active.id);
};

const validateWorkflows = (paths: string[][]): [boolean, string[][]] => {
  const result = [];
  if (paths.length === 0) return [true, paths];
  for (const path of paths) {
    const hasStart = path.some((nodeId) => nodeId.startsWith('start'));
    const hasEnd = path.some((nodeId) => nodeId.startsWith('end'));
    const hasOtherNodes = path.some(
      (nodeId) => !nodeId.startsWith('start') && !nodeId.startsWith('end')
    );

    if (hasStart && hasEnd && hasOtherNodes) {
      result.push(true);
    } else {
      result.push(false);
    }
  }
  // if any path is valid, return false
  if (result.some((isValid) => isValid)) return [false, paths];

  return [true, paths]; // is deletable
};

const findAndValidateFlowPaths = (
  targetId: string | null | undefined,
  edges: Edge[],
  direction: 'forward' | 'backward'
): [boolean, string[][]] => {
  if (!targetId || !edges) return [true, []];

  const allPaths: string[][] = [];
  const visited = new Set<string>();
  const stack = [{ nodeId: targetId, path: [targetId] }];

  while (stack.length > 0) {
    const { nodeId, path } = stack.pop()!;

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const relevantEdges =
      direction === 'backward'
        ? edges.filter((edge) => edge.target === nodeId) // incoming edges
        : edges.filter((edge) => edge.source === nodeId); // outgoing edges

    // If no relevant edges, we found a terminal node - save this path
    if (relevantEdges.length === 0) {
      allPaths.push(path);
      continue;
    }

    // Add all source nodes to the stack with updated paths
    for (const edge of relevantEdges) {
      const connectedNodeId = direction === 'backward' ? edge.source : edge.target;
      if (!visited.has(connectedNodeId)) {
        const newPath =
          direction === 'backward'
            ? [connectedNodeId, ...path] // Build path from source to target
            : [...path, connectedNodeId]; // Build path from target to source

        stack.push({
          nodeId: connectedNodeId,
          path: newPath,
        });
      }
    }
  }

  return validateWorkflows(allPaths);
};

const checkDeletable = (nodeId: string, type: string, edges: Edge[]): [boolean, string[][]] => {
  const isStartNode = type === 'start';
  const isEndNode = type === 'end';

  if (!isStartNode && !isEndNode) {
    return [true, []]; // Non-start/end nodes can always be deleted
  } else if (isStartNode) {
    // traverse forwards and check if there is a valid workflow
    return findAndValidateFlowPaths(nodeId, edges, 'forward');
  } else if (isEndNode) {
    // traverse backwards and check if there is a valid workflow
    return findAndValidateFlowPaths(nodeId, edges, 'backward');
  } else return [true, []]; // If it is neither start nor end, it can be deleted
};

interface HandleDragEndParams {
  event: DragEndEvent;
  edges: Edge[];
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
    edges,
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
      label: label(),
      type: active.id,
    },
    deletable: true,
  };

  setNodes((nodes: Node[]) => [...nodes, newNode]);
  setActiveItem(null);
};

const handleValidateAndSaveWorkflow = (
  nodes: Node[],
  edges: Edge[],
  setWorkflowErrors: (errors: string[]) => void,
  setShowSaveDialog: (value: boolean) => void
) => {
  const startNode = nodes.find((node) => node.type === 'start');

  if (!startNode || !nodes.some((node) => node.type === 'end')) {
    setWorkflowErrors(['Save failed: incomplete workflow.']);
    return;
  }

  const validatedWorkflows = findAndValidateFlowPaths(startNode?.id, edges, 'forward');

  if (validatedWorkflows[0] === true) {
    // workflow is not valid
    setWorkflowErrors([
      'Save failed: workflow is not valid. Please ensure there is a valid path from Start to End.',
    ]);
    return;
  } else if (validatedWorkflows[0] === false) {
    // workflow is valid - check all nodes have been setup
    const paths = validatedWorkflows[1];

    // in case of multiple workflows, ensure all nodes are setup on the valid workflows
    const validPaths = paths.filter((path) => {
      // include path if it has is valid
      const hasStart = path.some((nodeId) => nodeId.startsWith('start'));
      const hasEnd = path.some((nodeId) => nodeId.startsWith('end'));
      const hasOtherNodes = path.some(
        (nodeId) => !nodeId.startsWith('start') && !nodeId.startsWith('end')
      );

      return hasStart && hasEnd && hasOtherNodes;
    });

    const allValidFormNodesSetup = (nodes: Node[]) => {
      const nodeIds = validPaths.flat().filter((nodeId) => nodeId.startsWith('form'));
      if (nodeIds.length === 0) return true; // no form nodes to validate
      for (const node of nodeIds) {
        const formNode = nodes.find((n) => n.id === node);
        const formNodeData = formNode?.data as FormNodeData;
        if (!formNode || !formNodeData.fields || formNodeData.fields.length === 0) {
          setWorkflowErrors(['Save failed: all Form Nodes must have at least one field defined.']);
          return false;
        }
        if (formNodeData.fields.some((field) => !field.name || !field.type)) {
          setWorkflowErrors([
            'Save failed: all Form Node fields must have a name and type defined.',
          ]);
          return false;
        }
      }
      return true;
    };
    const allValidApiNodesSetup = (nodes: Node[]) => {
      const nodeIds = validPaths.flat().filter((nodeId) => nodeId.startsWith('api'));
      if (nodeIds.length === 0) return true; // no api nodes to validate
      for (const node of nodeIds) {
        const apiNode = nodes.find((n) => n.id === node);
        if (
          !apiNode ||
          apiNode.data.endpoint === '' ||
          Object.keys(apiNode.data.requestBody).length === 0
        ) {
          setWorkflowErrors([
            'Save failed: all API Nodes must have an endpoint, request body defined.',
          ]);
          return false;
        }
      }
      return true;
    };
    if (!allValidFormNodesSetup(nodes) || !allValidApiNodesSetup(nodes)) {
      return;
    }

    setWorkflowErrors([]);
    handleSave(nodes, edges);
    setShowSaveDialog(true);
  }
};

const handleSave = (nodes: Node[], edges: Edge[]) => {
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

  localStorage.setItem('Workflow Configuration', JSON.stringify(workflowConfig, null, 2));
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

  useEffect(() => {
    if (edges.length === 0) return;

    // check if workflow is valid, if so then start and end nodes can't be deleted
    const updatedNodes = nodes.map((node) => ({
      ...node,
      deletable: checkDeletable(node.id, node.type, edges)[0],
    }));

    // Only update if there are actual changes to avoid infinite loops
    const hasChanges = updatedNodes.some(
      (node, index) => node.deletable !== nodes[index]?.deletable
    );

    if (hasChanges) {
      setNodes(updatedNodes);
    }
  }, [nodes.length, edges.length, edges, setNodes]);

  return {
    callbacks: {
      handleDragEnd: (event: DragEndEvent) =>
        handleDragEnd({
          edges,
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
      handleDragStart: (event: DragStartEvent) => handleDragStart(event, setActiveItem),
      handleValidateAndSaveWorkflow: () =>
        handleValidateAndSaveWorkflow(nodes, edges, setWorkflowErrors, setShowSaveDialog),
    },
    nodeTypes,
    onConnect,
  };
}

export type UseWorkflowEditorPayload = ReturnType<typeof useWorkflowEditor>;
