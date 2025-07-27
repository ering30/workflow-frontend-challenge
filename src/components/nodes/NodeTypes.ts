import StartNode from '@/components/nodes/components/StartNode';
import FormNode from '@/components/nodes/components/FormNode';
import ConditionalNode from '@/components/nodes/components/ConditionalNode';
import ApiNode from '@/components/nodes/components/ApiNode';
import EndNode from '@/components/nodes/components/EndNode';

const nodeTypes = {
  start: StartNode,
  form: FormNode,
  conditional: ConditionalNode,
  api: ApiNode,
  end: EndNode,
};

export default nodeTypes;
