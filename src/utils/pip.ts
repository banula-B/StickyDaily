/**
 * Helper for Document Picture-in-Picture API (Chrome/Edge/Chromium).
 * Allows popping out a sticky note into a true OS-level floating window
 * that stays pinned on top of the laptop screen over all other windows!
 */

// Typing for Document Picture-in-Picture API
interface DocumentPictureInPicture {
  requestWindow(options?: {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
  }): Promise<Window>;
  window: Window | null;
  onenter: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export const isDocumentPipSupported = (): boolean => {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
};

export const copyStylesToWindow = (targetDoc: Document) => {
  // Copy fonts links
  const fontLinks = document.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]');
  fontLinks.forEach((node) => {
    targetDoc.head.appendChild(node.cloneNode(true));
  });

  // Copy style tags and stylesheets
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      if (sheet.cssRules) {
        const style = targetDoc.createElement('style');
        const rules = Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
        style.textContent = rules;
        targetDoc.head.appendChild(style);
      }
    } catch {
      // If stylesheet is cross-origin or inaccessible, clone link
      if (sheet.href) {
        const link = targetDoc.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        targetDoc.head.appendChild(link);
      }
    }
  });

  // Add custom body styling to match
  targetDoc.body.style.margin = '0';
  targetDoc.body.style.padding = '0';
  targetDoc.body.style.overflow = 'hidden';
  targetDoc.body.style.fontFamily = "'Plus Jakarta Sans', system-ui, sans-serif";
};
