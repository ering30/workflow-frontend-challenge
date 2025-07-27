import { useContext } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import { WorkflowEditorContext } from '@/contexts/WorkflowEditorContext';
import type { Node } from '@xyflow/react';

export default function useApiForm() {
  const { modalData, setModalData } = useContext(ModalContext) || {};
  const { edges, nodes } = useContext(WorkflowEditorContext) || {};

  const currentApiEntryEdges = edges.filter((edge) => edge.target === modalData?.id);

  const hasEntryEdge = currentApiEntryEdges !== undefined && currentApiEntryEdges.length > 0;

  const findFlowPaths = (targetId: string | null | undefined): string[][] => {
    if (!targetId || !edges) return [];

    const allPaths: string[][] = [];
    const visited = new Set<string>();
    const stack = [{ nodeId: targetId, path: [targetId] }];

    while (stack.length > 0) {
      const { nodeId, path } = stack.pop()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      // Find all edges that target the current node
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);

      // If no incoming edges, we found a root node - save this path
      if (incomingEdges.length === 0) {
        allPaths.push(path); // ← Save path instead of returning
        continue;
      }

      // Add all source nodes to the stack with updated paths
      for (const edge of incomingEdges) {
        const sourceId = edge.source;
        if (!visited.has(sourceId)) {
          stack.push({
            nodeId: sourceId,
            path: [sourceId, ...path], // Build path from source to target
          });
        }
      }
    }

    return allPaths;
  };

  // use the flowPaths to find the previous form fields
  const flowPaths = hasEntryEdge ? findFlowPaths(modalData?.id) : [];
  const previousFormNodes = flowPaths.flat().filter((nodeId) => nodeId.startsWith('form'));

  const availableFormFields = nodes.reduce((allFields, node: Node) => {
    if (node.type === 'form' && previousFormNodes.includes(node.id)) {
      return [...allFields, ...(node?.data?.fields || [])];
    }
    return allFields;
  }, []);
  const hasAvailableFormFields = availableFormFields.length > 0;

  return {
    availableFormFields,
    currentApiEntryEdges,
    hasEntryEdge,
    hasAvailableFormFields,
    findFlowPaths,
    flowPaths,
  };
}
