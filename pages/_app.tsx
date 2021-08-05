import { AppProps } from "next/app";
import { darkTheme } from "../theme/namedColors";
import * as DarkMode from "../src/index";

if (typeof window !== "undefined") {
  (window as any).DarkMode = DarkMode;
}

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div id="wrapper">
      <Component {...pageProps} />

      <style jsx global>{`
        html,
        body {
          margin: 0;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji",
            "Segoe UI Emoji", "Segoe UI Symbol";
          background: ${darkTheme.base.background};
          color: ${darkTheme.text.primary};
        }

        #wrapper {
          height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default MyApp;
