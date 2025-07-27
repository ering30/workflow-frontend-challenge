import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Theme } from '@radix-ui/themes';
import BaseModal from '../../src/components/modals/BaseModal';
import { ModalContext } from '../../src/contexts/ModalContext';
import useModals from '../../src/hooks/useModals';
import useForms from '../../src/components/modals/hooks/useForms';

// Create mock functions
const mockCloseModal = vi.fn();
const mockHandleSaveChanges = vi.fn();

// Mock the hooks
vi.mock('../../src/hooks/useModals', () => ({
  default: () => ({
    showModal: true,
    callbacks: {
      closeModal: mockCloseModal,
    },
  }),
}));

vi.mock('../../src/components/modals/hooks/useForms', () => ({
  default: () => ({
    callbacks: {
      handleSaveChanges: mockHandleSaveChanges,
    },
  }),
}));

vi.mock('../../src/lib/utilityFunctions', () => ({
  toTitleCase: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

// Mock FormBlockForm component
vi.mock('../../src/components/modals/BaseModal/FormBlockForm', () => ({
  default: () => <div>Form Block Form</div>,
}));

const mockModalContext = {
  modalData: {
    type: 'form' as const,
    customName: 'Test Block',
    errors: [] as Array<{ field: string; message: string }>,
  },
  setModalData: vi.fn(),
};

const renderBaseModal = (contextValue: any = mockModalContext) => {
  return render(
    <Theme>
      <ModalContext.Provider value={contextValue}>
        <BaseModal />
      </ModalContext.Provider>
    </Theme>
  );
};

describe('BaseModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with correct title and description', () => {
    renderBaseModal();
    
    expect(screen.getByText('Configure Form Block')).toBeInTheDocument();
    expect(screen.getByText('Modify the details of the selected block.')).toBeInTheDocument();
  });

  it('displays block name input with current value', () => {
    renderBaseModal();
    
    const nameInput = screen.getByDisplayValue('Test Block');
    expect(nameInput).toBeInTheDocument();
    expect(screen.getByTestId('blockName-input')).toBeInTheDocument();
  });

  it('updates block name when input changes', () => {
    renderBaseModal();
    
    const nameInput = screen.getByDisplayValue('Test Block');
    fireEvent.change(nameInput, { target: { value: 'Updated Block Name' } });
    
    expect(mockModalContext.setModalData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('renders form content when type is form', () => {
    renderBaseModal();
    
    // FormBlockForm component should be rendered
    expect(screen.getByText('Configure Form Block')).toBeInTheDocument();
  });

  it('renders API content when type is api', () => {
    const apiModalContext = {
      ...mockModalContext,
      modalData: {
        ...mockModalContext.modalData,
        type: 'api' as const,
      },
    };
    
    renderBaseModal(apiModalContext);
    
    expect(screen.getByText('Configure Api Block')).toBeInTheDocument();
    expect(screen.getByTestId('api-block-content')).toBeInTheDocument();
  });

  it('displays error message when errors exist', () => {
    const errorModalContext = {
      ...mockModalContext,
      modalData: {
        ...mockModalContext.modalData,
        errors: [{ field: 'none', message: 'Something went wrong' }],
      },
    };
    
    renderBaseModal(errorModalContext);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders Cancel and Save Changes buttons', () => {
    renderBaseModal();
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('handles modal close button click', () => {
    renderBaseModal();
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('handles cancel button click', () => {
    renderBaseModal();
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('handles save changes button click', () => {
    renderBaseModal();
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    expect(mockHandleSaveChanges).toHaveBeenCalledWith(mockModalContext.modalData, mockCloseModal);
  });
});