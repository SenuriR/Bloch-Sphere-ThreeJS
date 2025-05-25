// src/components/LatexBlock.jsx
import React from 'react';
import katex from 'katex';
// No local font/CSS import to avoid Vite asset errors

export default function LatexBlock({ latex }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: true
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
