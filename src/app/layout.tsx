import "./globals.css";
import QueryProvider from "@/app/QueryProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Gallera Betting App",
  description: "Digital Betting App for Local Gallera Events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
