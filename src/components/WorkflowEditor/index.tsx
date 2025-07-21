import '@xyflow/react/dist/style.css';

import { closestCorners, DndContext, DragOverlay } from '@dnd-kit/core';

import { AlertDialog, Button, Card, Flex, Heading } from '@radix-ui/themes';
import { Save } from 'lucide-react';

import BlockPanel from '../BlockPanel';
import DraggableBlockOverlay from '../DraggableBlockOverlay';

import useDraggableBlocks from '../../hooks/useDraggableBlocks';
import WorkflowCanvas from './components/WorkflowCanvas';

import useWorkflowEditor from './hooks/useWorkflowEditor';

const WorkflowEditor = () => {
  const workflowEditorPayload = useWorkflowEditor();
  const {
    callbacks: { handleDragStart, handleDragEnd, handleSave },
    showSaveDialog,
    setShowSaveDialog,
    activeItem,
  } = workflowEditorPayload;

  const { blocks } = useDraggableBlocks();
  const activeBlock = blocks.find((block) => block.id === activeItem);

  return (
    <Flex minHeight="100vh" direction="column" style={{ width: '100%' }}>
      <Card m="4" mb="0">
        <Flex flexGrow="1" justify="between" align="center">
          <Heading as="h2">Workflow Editor</Heading>
          <Button onClick={handleSave}>
            <Save size={16} />
            Save Workflow
          </Button>
        </Flex>
      </Card>

      {/* Main Content with Panel and Canvas */}
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <Flex flexGrow="1" m="4" mt="2" gap="4">
          {/* Left Panel */}
          <BlockPanel />
          <DragOverlay>{activeItem && <DraggableBlockOverlay block={activeBlock} />}</DragOverlay>
          {/* Workflow Canvas */}
          <WorkflowCanvas workflowEditorPayload={workflowEditorPayload} />
        </Flex>
      </DndContext>

      <AlertDialog.Root open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Workflow Saved</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Your workflow configuration has been saved to the browser console. Check the developer
            console for the complete configuration details.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </AlertDialog.Cancel>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
};

export default WorkflowEditor;
