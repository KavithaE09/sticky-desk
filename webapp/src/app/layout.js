import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "StickyDesk",
  description: "",
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
