import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Root HTML layout for Expo web.
 *
 * The <title> MUST contain a text node (not be empty) so that
 * badgin (dep of expo-notifications) doesn't crash when it does
 * document.querySelector('title').childNodes[0].nodeValue = ...
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Keep a non-empty text node inside <title> so badgin doesn't crash */}
        <title>Vua Thợ</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
