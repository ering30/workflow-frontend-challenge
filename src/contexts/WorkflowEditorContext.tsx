import { createContext, ReactNode, useState } from 'react';
import { useNodesState, useEdgesState, Edge, Node } from '@xyflow/react';

export const WorkflowEditorContext = createContext(undefined);

type WorkflowEditorContextProviderProps = {
  children: ReactNode;
};
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const WorkflowEditorContextProvider = (props: WorkflowEditorContextProviderProps) => {
  const { children } = props;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowErrors, setWorkflowErrors] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState(null);

  const value = {
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
    hasNodes: nodes.length > 0,
    hasStartNode: nodes.some((node) => node.id.startsWith('start')),
    hasEndNode: nodes.some((node) => node.id.startsWith('end')),
  };

  return <WorkflowEditorContext.Provider value={value}>{children}</WorkflowEditorContext.Provider>;
};
