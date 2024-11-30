import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function TypewriterText({ text, speed = 150, className = '' }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
      }, 2000); // Pause for 2 seconds at full text
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        return;
      }

      timeout = setTimeout(() => {
        setDisplayText(text.substring(0, displayText.length - 1));
      }, speed / 2);
    } else {
      if (displayText === text) {
        setIsPaused(true);
        setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
        return;
      }

      timeout = setTimeout(() => {
        setDisplayText(text.substring(0, displayText.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, isPaused, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  );
}
