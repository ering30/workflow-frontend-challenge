import { ModalContextProvider } from '@/contexts/ModalContext';
import { WorkflowEditorContextProvider } from '@/contexts/WorkflowEditorContext';

import WorkflowEditor from '@/components/WorkflowEditor';
import BaseModal from '@/components/modals/BaseModal';

const Index = () => (
  <WorkflowEditorContextProvider>
    <ModalContextProvider>
      <WorkflowEditor />

      <BaseModal />
    </ModalContextProvider>
  </WorkflowEditorContextProvider>
);

export default Index;
