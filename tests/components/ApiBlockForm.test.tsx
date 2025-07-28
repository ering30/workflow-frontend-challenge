import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Theme } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import ApiBlockForm from '../../src/components/modals/BaseModal/ApiBlockForm';
import { ModalContext } from '../../src/contexts/ModalContext';
import { WorkflowEditorContext } from '../../src/contexts/WorkflowEditorContext';
import type { ApiModalDataType, FormField } from '../../src/hooks/useModals';

// Mock the validation functions
vi.mock('validator', () => ({
  isURL: (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  },
}));

// Mock useForms hook
const mockHandleUrlInputChange = vi.fn();
const mockHandleSelectRequestBodyField = vi.fn();

vi.mock('../../src/components/modals/hooks/useForms', () => ({
  default: () => ({
    callbacks: {
      handleUrlInputChange: mockHandleUrlInputChange,
      handleSelectRequestBodyField: mockHandleSelectRequestBodyField,
    },
  }),
}));

// Mock RequestBodyItem component to simplify testing
vi.mock('../../src/components/modals/BaseModal/ApiBlockForm/components/RequestBodyItem', () => ({
  default: ({ formField, modalData }: { formField: FormField; modalData: ApiModalDataType }) => (
    <div data-testid={`request-body-item-${formField.name}`}>
      <span>{formField.name}</span>
      <span>{formField.type}</span>
      <input
        type="checkbox"
        data-testid={`checkbox-${formField.name}`}
        onChange={() => mockHandleSelectRequestBodyField(formField.name, modalData, vi.fn())}
      />
    </div>
  ),
}));

const createMockApiModalData = (overrides: Partial<ApiModalDataType> = {}): ApiModalDataType => ({
  id: 'api-1',
  type: 'api',
  label: 'API Node',
  customName: '',
  errors: [],
  httpMethod: 'POST',
  url: '',
  requestBody: {},
  ...overrides,
});

const createMockWorkflowContext = (
  nodes: any[] = [],
  edges: any[] = []
) => ({
  nodes,
  edges,
  setNodes: vi.fn(),
  onNodesChange: vi.fn(),
  setEdges: vi.fn(),
  onEdgesChange: vi.fn(),
  showSaveDialog: false,
  setShowSaveDialog: vi.fn(),
  workflowErrors: [],
  setWorkflowErrors: vi.fn(),
  activeItem: null,
  setActiveItem: vi.fn(),
  hasNodes: nodes.length > 0,
  hasStartNode: nodes.some(node => node.type === 'start'),
  hasEndNode: nodes.some(node => node.type === 'end'),
});

const renderApiBlockForm = (
  modalData: ApiModalDataType = createMockApiModalData(),
  workflowContext = createMockWorkflowContext()
) => {
  const mockModalContext = {
    modalData,
    setModalData: vi.fn(),
    showModal: true,
    setShowModal: vi.fn(),
  };

  return render(
    <Theme>
      <ModalContext.Provider value={mockModalContext as any}>
        <WorkflowEditorContext.Provider value={workflowContext as any}>
          <Form.Root>
            <ApiBlockForm />
          </Form.Root>
        </WorkflowEditorContext.Provider>
      </ModalContext.Provider>
    </Theme>
  );
};

describe('ApiBlockForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the API configuration form', () => {
      renderApiBlockForm();

      expect(screen.getByTestId('api-block-content')).toBeInTheDocument();
      expect(screen.getByText('API Configuration')).toBeInTheDocument();
      expect(screen.getByText('HTTP Request Method')).toBeInTheDocument();
      expect(screen.getByText('Request URL')).toBeInTheDocument();
      expect(screen.getByText('Request Body')).toBeInTheDocument();
    });

    it('renders HTTP method radio buttons', () => {
      renderApiBlockForm();

      expect(screen.getByRole('radio', { name: 'PUT' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'POST' })).toBeInTheDocument();
    });

    it('renders URL input field', () => {
      renderApiBlockForm();

      expect(screen.getByTestId('field-url-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Request URL')).toBeInTheDocument();
    });
  });

  describe('HTTP Method Selection', () => {
    it('displays the correct selected HTTP method', () => {
      const modalData = createMockApiModalData({ httpMethod: 'PUT' });
      renderApiBlockForm(modalData);

      const putRadio = screen.getByRole('radio', { name: 'PUT' });
      const postRadio = screen.getByRole('radio', { name: 'POST' });

      expect(putRadio).toBeChecked();
      expect(postRadio).not.toBeChecked();
    });

    it('updates HTTP method when user selects different option', () => {
      const modalData = createMockApiModalData({ httpMethod: 'POST' });
      const mockSetModalData = vi.fn();
      
      const mockModalContext = {
        modalData,
        setModalData: mockSetModalData,
        showModal: true,
        setShowModal: vi.fn(),
      };

      render(
        <Theme>
          <ModalContext.Provider value={mockModalContext as any}>
            <WorkflowEditorContext.Provider value={createMockWorkflowContext() as any}>
              <Form.Root>
                <ApiBlockForm />
              </Form.Root>
            </WorkflowEditorContext.Provider>
          </ModalContext.Provider>
        </Theme>
      );

      const putRadio = screen.getByRole('radio', { name: 'PUT' });
      fireEvent.click(putRadio);

      expect(mockSetModalData).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('URL Input Validation', () => {
    it('displays URL input with current value', () => {
      const modalData = createMockApiModalData({ url: 'https://api.example.com' });
      renderApiBlockForm(modalData);

      const urlInput = screen.getByTestId('field-url-input') as HTMLInputElement;
      expect(urlInput.value).toBe('https://api.example.com');
    });

    it('calls handleUrlInputChange when URL input changes', () => {
      renderApiBlockForm();

      const urlInput = screen.getByTestId('field-url-input');
      fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

      expect(mockHandleUrlInputChange).toHaveBeenCalledWith(
        expect.any(Object), // Accept any event object  
        'url'
      );
    });

    it('displays URL validation errors', () => {
      const modalData = createMockApiModalData({
        errors: [{ field: 'url', message: 'Please enter a valid URL.' }]
      });
      renderApiBlockForm(modalData);

      expect(screen.getByTestId('field-url-error')).toHaveTextContent('Please enter a valid URL.');
    });

    it('does not display error when URL field has no errors', () => {
      const modalData = createMockApiModalData({ errors: [] });
      renderApiBlockForm(modalData);

      expect(screen.getByTestId('field-url-error')).toHaveTextContent('');
    });
  });

  describe('Request Body Section', () => {
    it('shows message when no form fields are available', () => {
      renderApiBlockForm();

      expect(screen.getByText(
        'No available form fields to include in the request body. Please set up form fields in the Form Block and connect them to this API Block.'
      )).toBeInTheDocument();
    });

    it('displays available form fields when connected to form nodes', () => {
      const mockFormFields = [
        { id: '1', name: 'firstName', type: 'text', required: true },
        { id: '2', name: 'email', type: 'email', required: false },
      ];

      const mockNodes = [
        {
          id: 'form-1',
          type: 'form',
          data: { fields: mockFormFields }
        }
      ];

      const mockEdges = [
        { source: 'form-1', target: 'api-1' }
      ];

      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderApiBlockForm(createMockApiModalData(), workflowContext);

      expect(screen.getByText(
        'Please select from available fields to add to request body:'
      )).toBeInTheDocument();
      
      expect(screen.getByTestId('request-body-item-firstName')).toBeInTheDocument();
      expect(screen.getByTestId('request-body-item-email')).toBeInTheDocument();
    });

    it('displays request body validation errors', () => {
      const modalData = createMockApiModalData({
        errors: [{ field: 'requestBody', message: 'Request body is required.' }]
      });
      renderApiBlockForm(modalData);

      expect(screen.getByTestId('field-request_body-error')).toHaveTextContent('Request body is required.');
    });

    it('handles multiple request body errors', () => {
      const modalData = createMockApiModalData({
        errors: [
          { field: 'requestBody', message: 'Request body is required.' },
          { field: 'requestBody', message: 'Invalid request body format.' }
        ]
      });
      renderApiBlockForm(modalData);

      expect(screen.getByTestId('field-request_body-error')).toHaveTextContent(
        'Request body is required., Invalid request body format.'
      );
    });
  });

  describe('Form Integration with Connected Nodes', () => {
    it('shows form fields from connected form nodes in workflow path', () => {
      const mockFormFields = [
        { id: '1', name: 'username', type: 'text', required: true },
        { id: '2', name: 'password', type: 'password', required: true },
      ];

      const mockNodes = [
        {
          id: 'start-1',
          type: 'start',
          data: {}
        },
        {
          id: 'form-1',
          type: 'form',
          data: { fields: mockFormFields }
        },
        {
          id: 'api-1',
          type: 'api',
          data: {}
        }
      ];

      const mockEdges = [
        { source: 'start-1', target: 'form-1' },
        { source: 'form-1', target: 'api-1' }
      ];

      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      const modalData = createMockApiModalData({ id: 'api-1' });
      
      renderApiBlockForm(modalData, workflowContext);

      expect(screen.getByTestId('request-body-item-username')).toBeInTheDocument();
      expect(screen.getByTestId('request-body-item-password')).toBeInTheDocument();
    });

    it('does not show form fields from unconnected form nodes', () => {
      const mockFormFields = [
        { id: '1', name: 'disconnectedField', type: 'text', required: false },
      ];

      const mockNodes = [
        {
          id: 'form-1',
          type: 'form',
          data: { fields: mockFormFields }
        },
        {
          id: 'api-1',
          type: 'api',
          data: {}
        }
      ];

      // No edges connecting form to api
      const mockEdges: any[] = [];

      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      const modalData = createMockApiModalData({ id: 'api-1' });
      
      renderApiBlockForm(modalData, workflowContext);

      expect(screen.queryByTestId('request-body-item-disconnectedField')).not.toBeInTheDocument();
      expect(screen.getByText(
        'No available form fields to include in the request body. Please set up form fields in the Form Block and connect them to this API Block.'
      )).toBeInTheDocument();
    });
  });

  describe('User Interaction Workflows', () => {
    it('handles complete form configuration workflow', async () => {
      const mockFormFields = [
        { id: '1', name: 'email', type: 'email', required: true },
      ];

      const mockNodes = [
        {
          id: 'form-1',
          type: 'form',
          data: { fields: mockFormFields }
        }
      ];

      const mockEdges = [
        { source: 'form-1', target: 'api-1' }
      ];

      const mockSetModalData = vi.fn();
      const modalData = createMockApiModalData({ id: 'api-1' });
      
      const mockModalContext = {
        modalData,
        setModalData: mockSetModalData,
        showModal: true,
        setShowModal: vi.fn(),
      };

      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);

      render(
        <Theme>
          <ModalContext.Provider value={mockModalContext as any}>
            <WorkflowEditorContext.Provider value={workflowContext as any}>
              <Form.Root>
                <ApiBlockForm />
              </Form.Root>
            </WorkflowEditorContext.Provider>
          </ModalContext.Provider>
        </Theme>
      );

      // 1. Select HTTP method
      const putRadio = screen.getByRole('radio', { name: 'PUT' });
      fireEvent.click(putRadio);
      expect(mockSetModalData).toHaveBeenCalled();

      // 2. Enter URL
      const urlInput = screen.getByTestId('field-url-input');
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/users' } });
      expect(mockHandleUrlInputChange).toHaveBeenCalledWith(
        expect.any(Object), // Accept any event object
        'url'
      );

      // 3. Select request body field
      const emailCheckbox = screen.getByTestId('checkbox-email');
      fireEvent.click(emailCheckbox);
      expect(mockHandleSelectRequestBodyField).toHaveBeenCalledWith(
        'email',
        modalData,
        expect.any(Function)
      );
    });

    it('validates required fields during form interaction', () => {
      const modalData = createMockApiModalData({
        url: '',
        errors: [{ field: 'url', message: 'Please enter a valid URL.' }]
      });
      
      renderApiBlockForm(modalData);

      // URL input shows as required
      const urlInput = screen.getByTestId('field-url-input');
      expect(urlInput).toHaveAttribute('required');

      // Error message is displayed
      expect(screen.getByTestId('field-url-error')).toHaveTextContent('Please enter a valid URL.');
    });
  });

  describe('Error State Management', () => {
    it('displays multiple validation errors simultaneously', () => {
      const modalData = createMockApiModalData({
        errors: [
          { field: 'url', message: 'Please enter a valid URL.' },
          { field: 'requestBody', message: 'Request body is required.' },
          { field: 'requestBody', message: 'At least one field must be selected.' }
        ]
      });
      
      renderApiBlockForm(modalData);

      expect(screen.getByTestId('field-url-error')).toHaveTextContent('Please enter a valid URL.');
      expect(screen.getByTestId('field-request_body-error')).toHaveTextContent(
        'Request body is required., At least one field must be selected.'
      );
    });

    it('clears errors when not present', () => {
      const modalData = createMockApiModalData({ errors: [] });
      renderApiBlockForm(modalData);

      expect(screen.getByTestId('field-url-error')).toHaveTextContent('');
      expect(screen.getByTestId('field-request_body-error')).toHaveTextContent('');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing modal context gracefully', () => {
      render(
        <Theme>
          <WorkflowEditorContext.Provider value={createMockWorkflowContext() as any}>
            <Form.Root>
              <ApiBlockForm />
            </Form.Root>
          </WorkflowEditorContext.Provider>
        </Theme>
      );

      // Should not crash and still render basic structure
      expect(screen.getByTestId('api-block-content')).toBeInTheDocument();
    });

    it('handles missing workflow context gracefully', () => {
      const mockModalContext = {
        modalData: createMockApiModalData(),
        setModalData: vi.fn(),
        showModal: true,
        setShowModal: vi.fn(),
      };

      render(
        <Theme>
          <ModalContext.Provider value={mockModalContext as any}>
            <Form.Root>
              <ApiBlockForm />
            </Form.Root>
          </ModalContext.Provider>
        </Theme>
      );

      // Should not crash and show no available fields message
      expect(screen.getByText(
        'No available form fields to include in the request body. Please set up form fields in the Form Block and connect them to this API Block.'
      )).toBeInTheDocument();
    });

    it('handles empty form fields arrays', () => {
      const mockNodes = [
        {
          id: 'form-1',
          type: 'form',
          data: { fields: [] } // Empty fields array
        }
      ];

      const mockEdges = [
        { source: 'form-1', target: 'api-1' }
      ];

      const workflowContext = createMockWorkflowContext(mockNodes, mockEdges);
      renderApiBlockForm(createMockApiModalData(), workflowContext);

      expect(screen.getByText(
        'No available form fields to include in the request body. Please set up form fields in the Form Block and connect them to this API Block.'
      )).toBeInTheDocument();
    });
  });
});
