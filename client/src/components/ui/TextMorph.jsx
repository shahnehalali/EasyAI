// Motion Primitives "Text Morph" (https://motion-primitives.com/docs/text-morph),
// ported to JSX and made word-safe so it also works for wrapping paragraphs:
// each character animates (fade/scale in + shared-layout morph), but characters
// are grouped into non-breaking words so text only wraps at spaces.
import { useId, useMemo } from 'react';
import { motion } from 'motion/react';

export default function TextMorph({
  children,
  as: Component = 'span',
  className,
  style,
  variants,
  transition,
}) {
  const uniqueId = useId();

  const words = useMemo(() => {
    const text = String(children);
    const counts = {};
    const charId = (ch) => {
      const k = ch.toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
      return `${uniqueId}-${k}${counts[k]}`;
    };
    return text.split(' ').map((word, wi) => ({
      key: `${uniqueId}-w${wi}`,
      chars: word.split('').map((ch) => ({ id: charId(ch), label: ch })),
    }));
  }, [children, uniqueId]);

  const defaultVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  };
  const defaultTransition = { type: 'spring', stiffness: 280, damping: 18, mass: 0.3 };

  return (
    <Component className={className} aria-label={String(children)} style={style}>
      {words.map((word, wi) => (
        // A real space text node between words is the only wrap opportunity;
        // each word is an inline-block that never breaks internally.
        <span key={word.key}>
          {wi > 0 ? ' ' : null}
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {word.chars.map((character) => (
              <motion.span
                key={character.id}
                layoutId={character.id}
                style={{ display: 'inline-block' }}
                aria-hidden="true"
                initial="initial"
                animate="animate"
                variants={variants || defaultVariants}
                transition={transition || defaultTransition}
              >
                {character.label}
              </motion.span>
            ))}
          </span>
        </span>
      ))}
    </Component>
  );
}
