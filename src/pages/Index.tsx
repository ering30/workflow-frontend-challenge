import { ModalContextProvider } from '@/contexts/ModalContext';
import WorkflowEditor from '@/components/WorkflowEditor';
import BaseModal from '@/components/modals/BaseModal';

const Index = () => {
  return (
    <ModalContextProvider>
      <WorkflowEditor />

      <BaseModal />
    </ModalContextProvider>
  );
};

export default Index;
