export type ApiNodeData = {
  label: string;
  customName?: string;
  httpMethod?: 'PUT' | 'POST';
  url?: string;
  requestBody?: Record<string, string>;
};

export type ModalDataType = {
  id: string | null;
  type: string | null;
  label: string;
  customName: string;
  errors: { field: string; message: string }[];
};

export type FormModalDataType = ModalDataType & {
  fields: FormField[];
};

export type ApiModalDataType = ModalDataType & ApiNodeData;

export type FormField = {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number';
  required: boolean;
};

export type FormNodeData = {
  id: string;
  type: 'form';
  label?: string;
  customName?: string;
  fields?: FormField[];
};
