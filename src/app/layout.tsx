import "./globals.css";
export const metadata = {
  title: "Cockfight Betting",
  description: "Sequential cockfight betting app",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
