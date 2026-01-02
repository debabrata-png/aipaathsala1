import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ children, content, block = false, errorColor = '#cc0000' }) => {
  const text = content || children;

  if (!text || typeof text !== 'string') {
    return <span>{text}</span>;
  }

  // Function to parse text and extract math segments
  const renderContent = () => {
    // Regex to find \(...\), \[...\], and $$...$$
    const parts = text.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);

    return parts.map((part, index) => {
      if (part.startsWith('\\[')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} errorColor={errorColor} />;
      } else if (part.startsWith('\\(')) {
        const math = part.slice(2, -2);
        return <InlineMath key={index} math={math} errorColor={errorColor} />;
      } else if (part.startsWith('$$')) {
        const math = part.replace(/\$\$/g, '');
        return <BlockMath key={index} math={math} errorColor={errorColor} />;
      }

      // If none of the above, check if the whole content is basic math and 'block' prop is true
      if (parts.length === 1 && block) {
        return <BlockMath key={index} math={part} errorColor={errorColor} />;
      }

      return <span key={index}>{part}</span>;
    });
  };

  try {
    return <>{renderContent()}</>;
  } catch (error) {
    console.error('Math rendering error:', error);
    return <span style={{ color: errorColor }}>{text}</span>;
  }
};

export default MathRenderer;
