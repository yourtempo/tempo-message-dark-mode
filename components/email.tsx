import React, { useEffect, useRef } from "react";
import { generateDarkModeStyles } from "../src/old-styles";
import { darkTheme } from "../theme/namedColors";

interface Props {
  body: string;
}

const colors = {
  bg: darkTheme.card.background,
  text: darkTheme.text.primary,
  link: darkTheme.accent.primary,
};

export const Email: React.FC<Props> = ({ body }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!doc || !win) return;

    doc.open();
    doc.write(body);
    doc.close();

    const start = Date.now();
    generateDarkModeStyles(colors, doc);
    console.log("Processing took", Date.now() - start, "ms");
  }, [body, iframeRef]);

  return (
    <div className="email">
      <iframe
        ref={iframeRef}
        seamless
        sandbox="allow-same-origin allow-popups"
      />

      <style jsx>{`
        .email {
          background-color: ${darkTheme.card.background};
          box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          overflow: hidden;
          width: 780px;
          height: 100%;
          flex-shrink: 0;
        }

        iframe {
          border-radius: 8px;
          display: block;
          border: none;
          height: 100%;
          width: 100%;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};
