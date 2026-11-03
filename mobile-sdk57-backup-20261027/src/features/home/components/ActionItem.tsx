import { Pressable, Text, View, Image } from 'react-native';

import { styles } from '../styles';

interface ActionItemProps {
  icon: any;
  title: string;
  description: string;
  onPress: () => void;
  highlighted?: boolean;
}

export default function ActionItem({
  icon,
  title,
  description,
  onPress,
  highlighted = false,
}: ActionItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionItem,
        highlighted
          ? styles.actionItemHighlighted
          : styles.actionItemSecondary,
      ]}
    >
      {/* ÍCONE */}
      <View
        style={[
          styles.actionIconContainer,
          highlighted && styles.actionIconContainerHighlighted,
        ]}
      >
        <Image
          source={icon}
          style={[
            styles.actionIcon,
            highlighted && styles.actionIconHighlighted,
          ]}
          resizeMode="contain"
        />
      </View>

      {/* TEXTO */}
      <View style={styles.actionTextContainer}>
        <Text
          style={[
            styles.actionTitle,
            !highlighted && styles.actionTitleSecondary,
          ]}
        >
          {title}
        </Text>

        {description !== '' && (
          <Text
            style={[
              styles.actionDescription,
              !highlighted && styles.actionDescriptionSecondary,
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {/* SETA */}
      <View style={styles.actionArrow}>
        <Text style={styles.actionArrowText}>›</Text>
      </View>
    </Pressable>
  );
}