import { Card, Heading, Text, Box, Flex } from '@radix-ui/themes';
import useDraggableBlocks from '../../hooks/useDraggableBlocks';

const BlockPanel = () => {
  const { blocks } = useDraggableBlocks()
  
  return (
    <Card style={{ width: '256px', height: '100%' }}>
      <Box p="4" pb="3">
        <Heading size="3">Blocks</Heading>
      </Box>
      <Flex p="4" pt="0" direction="column" gap="3">
        {blocks.map((block) => {
          const IconComponent = block.icon;
          const { callbacks: { draggable } } = block;
          const { attributes, listeners, setNodeRef } = draggable(block.id);

          return (
            <Flex key={block.id} direction="column" gap="1">
              <Text size="1" color="gray">
                {block.description}
              </Text>
              <Flex
                align="center"
                gap="3"
                p="3"
                ref={setNodeRef || null}
                {...listeners}
                {...attributes}
                style={{
                  borderRadius: 'var(--radius-4)',
                  cursor: 'pointer',
                  backgroundColor: block.color,
                  color: 'white',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'var(--shadow-2)',
                }}
              >
                <IconComponent size={16} />
                <Text size="2" weight="medium">
                  {block.name}
                </Text>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Card>
  );
};

export default BlockPanel;
