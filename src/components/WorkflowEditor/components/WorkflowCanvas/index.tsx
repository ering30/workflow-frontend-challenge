import { useDroppable } from '@dnd-kit/core';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Box, Card, Text } from '@radix-ui/themes';

import type { UseWorkflowEditorPayload } from '../../hooks/useWorkflowEditor';

interface WorkflowCanvasProps {
  workflowEditorPayload: UseWorkflowEditorPayload,
}

const WorkflowCanvas = (props: WorkflowCanvasProps) => {
  const {
    workflowEditorPayload: {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      nodeTypes,
      onConnect,
      workflowErrors,
    }
  } = props

  const { setNodeRef } = useDroppable({ id: 'workflow-canvas' });
  
  return (
    <Box flexGrow="1" style={{ minHeight: '600px' }}>
      <Card id="workflow-canvas" ref={setNodeRef} style={{ overflow: 'hidden', height: '100%' }}>
        {workflowErrors.length > 0 && (
          <Box p="2" style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
            <Text size="2" color="red">
              Workflow Errors: {workflowErrors.join(', ')}
            </Text>
          </Box>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius)',
          }}
        >

          <Controls
            style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <MiniMap
            style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            nodeColor={(node) => {
              switch (node.type) {
                case 'start':
                  return '#10b981';
                case 'form':
                  return '#3b82f6';
                case 'conditional':
                  return '#f59e0b';
                case 'api':
                  return '#a855f7';
                case 'end':
                  return '#ef4444';
                default:
                  return '#6b7280';
              }
            }}
          />
          <Background color="#e2e8f0" gap={20} />
        </ReactFlow>
      </Card>
    </Box>
  )
}

export default WorkflowCanvas;