// Motion Primitives "Text Effect" (https://motion-primitives.com/docs/text-effect),
// ported to JSX (trimmed to the presets we use). Splits text into words, then
// characters, and animates each in with a staggered preset. Keyed on the text
// so changing it plays an exit + enter transition -- used for the page title.
import { AnimatePresence, motion } from 'motion/react';

const STAGGER = { char: 0.022, word: 0.05 };

const PRESETS = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'fade-in-blur': {
    hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -8, filter: 'blur(8px)' },
  },
  slide: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
};

const inline = { display: 'inline-block', whiteSpace: 'pre' };

export default function TextEffect({
  children,
  as = 'span',
  per = 'char',
  preset = 'fade-in-blur',
  className,
  style,
  duration = 0.3,
  speedReveal = 1,
}) {
  const MotionTag = motion[as] || motion.span;
  const text = String(children ?? '');
  const words = text.split(/(\s+)/); // keep whitespace tokens as break opportunities

  const p = PRESETS[preset] || PRESETS.fade;
  const item = {
    hidden: p.hidden,
    visible: { ...p.visible, transition: { duration } },
    exit: { ...p.exit, transition: { duration: duration * 0.6 } },
  };
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: STAGGER[per] * speedReveal } },
    exit: { transition: { staggerChildren: STAGGER[per] * 0.5, staggerDirection: -1 } },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionTag
        key={text}
        className={className}
        aria-label={text}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={container}
        style={{ display: 'inline-block', ...style }}
      >
        {words.map((word, wi) =>
          /^\s+$/.test(word) ? (
            word
          ) : per === 'word' ? (
            <motion.span key={wi} aria-hidden="true" style={inline} variants={item}>{word}</motion.span>
          ) : (
            <span key={wi} style={inline}>
              {word.split('').map((char, ci) => (
                <motion.span key={ci} aria-hidden="true" style={inline} variants={item}>{char}</motion.span>
              ))}
            </span>
          )
        )}
      </MotionTag>
    </AnimatePresence>
  );
}
