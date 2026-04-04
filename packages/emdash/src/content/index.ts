export interface PortableTextBlock {
  _type: 'block';
  children: Array<{
    _type: 'span';
    text: string;
    marks?: string[];
  }>;
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
}

export const parsePortableText = (blocks: PortableTextBlock[]) => {
  return blocks.map(block => {
    if (block._type === 'block') {
      return `<p>${block.children.map(c => c.text).join('')}</p>`;
    }
    return '';
  }).join('');
};
