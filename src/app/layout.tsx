import "./globals.css";
import QueryProvider from "@/app/QueryProvider";

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
      </body>
    </html>
  );
}
