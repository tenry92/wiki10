function getStringIndent(string: string) {
  const match = string.match(/^\s+/);

  if (!match) {
    return 0;
  }

  return match[0].length;
}

interface ParseContext {
  level: number;
  item: Item;
}

export interface Item {
  name: string;
  type: 'folder' | 'file';
  expanded: boolean;
  children: Item[];
}

export function parse(input: string): Item[] {
  const rootItem: Item = {
    name: '/',
    type: 'folder',
    expanded: true,
    children: [],
  };

  const rootContext: ParseContext = {
    level: -1,
    item: rootItem,
  };

  const lines = input.split('\n').filter(line => line.trim() != '');
  let context = rootContext;
  const stack: ParseContext[] = [];
  let lastItem = rootItem;

  for (const line of lines) {
    const currentLineLevel = getStringIndent(line);
    const trimmedLine = line.trim();
    const expanded = trimmedLine[0] == '+';
    const lineText = trimmedLine.substring(1).trim();
    const isFolder = trimmedLine.endsWith('/');

    if (currentLineLevel > context.level) {
      stack.push(context);

      context = {
        level: currentLineLevel,
        item: lastItem,
      };
    }

    while (currentLineLevel < context.level && stack.length > 0) {
      context = stack.pop()!;
    }

    lastItem = {
      name: lineText,
      type: isFolder ? 'folder' : 'file',
      expanded,
      children: [],
    };

    context.item.children.push(lastItem);
  }

  return rootContext.item.children;
}
