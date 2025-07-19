import { Flex, Text } from '@radix-ui/themes';
import { LucideIcon } from 'lucide-react';

interface DraggableBlockOverlayProps {
  block: {
    id: string,
    name: string,
    icon: LucideIcon,
    description?: string,
    color: string,
    darkColor?: string,
    callbacks?: {
      draggable: (id: string) => any;
    }
  }
}

const DraggableBlockOverlay = (props: DraggableBlockOverlayProps) => {
  const { block: { name, icon: IconComponent, color } } = props;

  return (
    <Flex
      align="center"
      gap="3"
      p="3"
      style={{
        borderRadius: 'var(--radius-4)',
        cursor: 'pointer',
        backgroundColor: color,
        color: 'white',
        transition: 'all 0.2s ease',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'var(--shadow-2)',
        touchAction: 'manipulation',
      }}
      tabIndex={0}
      role="button"
      aria-label={`Draggable block: ${name}`}
    >
      <IconComponent size={16} />
      <Text size="2" weight="medium">
        {name}
      </Text>
    </Flex>
  );
}

export default DraggableBlockOverlay;