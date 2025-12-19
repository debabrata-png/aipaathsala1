import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ children, block = false, errorColor = '#cc0000' }) => {
  if (!children || typeof children !== 'string') {
    return <span>{children}</span>;
  }

  // Clean and detect math patterns
  const text = children.trim();
  
  // Check for different math patterns
  const hasBlockMath = text.includes('$$');
  const hasInlineMath = text.includes('\\(') && text.includes('\\)');
  const hasBasicMath = /[\^_{}\\]|\\[a-zA-Z]+/.test(text);
  
  try {
    if (hasBlockMath) {
      // Extract content between $$...$$
      const mathContent = text.replace(/\$\$/g, '').trim();
      return <BlockMath math={mathContent} errorColor={errorColor} />;
    }
    
    if (hasInlineMath) {
      // Extract content between \(...\)
      const mathContent = text.replace(/\\\(|\\\)/g, '').trim();
      return <InlineMath math={mathContent} errorColor={errorColor} />;
    }
    
    if (hasBasicMath || block) {
      // Render as math directly
      if (block) {
        return <BlockMath math={text} errorColor={errorColor} />;
      } else {
        return <InlineMath math={text} errorColor={errorColor} />;
      }
    }
    
    // No math detected, return as plain text
    return <span>{children}</span>;
    
  } catch (error) {
    // Fallback to plain text if math rendering fails
    return <span style={{ color: errorColor }}>{children}</span>;
  }
};

export default MathRenderer;
