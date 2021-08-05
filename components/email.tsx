import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { generateDarkModeStyles } from "../src/dark-mode";
import { darkTheme } from "../theme/namedColors";
import prepareMessage from "tempo-message-splitter";
import iframeContentStyles from "../theme/iframeContentStyles";

interface Props {
  name: string;
  body: string;
}

const colors = {
  bg: darkTheme.card.background,
  text: darkTheme.text.primary,
  link: darkTheme.accent.primary,
};

export const Email: React.FC<Props> = ({ name, body }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!doc || !win) return;

    const { completeHtml } = prepareMessage(body, {
      includeStyle: iframeContentStyles,
    });

    doc.open();
    doc.write(completeHtml);
    doc.close();

    if (darkMode) {
      const start = Date.now();
      generateDarkModeStyles(colors, doc);
      console.log("Processing took", Date.now() - start, "ms");
    }
  }, [body, darkMode, iframeRef]);

  return (
    <div className="email">
      <header>
        <Link href={`/${name}`}>
          <a>{name}</a>
        </Link>

        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Make Light" : "Make Dark"}
        </button>
      </header>

      <iframe
        ref={iframeRef}
        seamless
        sandbox="allow-same-origin allow-popups"
      />

      <style jsx>{`
        .email {
          display: flex;
          flex-direction: column;
          width: 780px;
          height: 100%;
          flex-shrink: 0;
        }

        header {
          flex: 0;
          height: 2rem;
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        header a {
          margin: 0;
          margin-right: auto;
          font-size: 1.5rem;
          display: block;
          color: inherit;
          text-decoration: none;
        }

        header button {
          border: none;
          background: none;
          color: ${darkTheme.text.mindful};
          cursor: pointer;
          font-size: 1rem;
        }

        iframe {
          flex-grow: 1;
          display: block;
          border-radius: 8px;

          height: 100%;
          border: none;
          overflow: auto;
          background-color: ${darkMode ? darkTheme.card.background : "white"};
          box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};
