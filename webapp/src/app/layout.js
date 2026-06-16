import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "StickyDesk — Smart Notes for Every Page",
  description: "Pin notes to any webpage. Never lose context again.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
