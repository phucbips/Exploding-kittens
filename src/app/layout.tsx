import type { Metadata } from "next";
import { Pacifico, Quicksand } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Mèo Nổ - Stitch Edition",
  description: "Game Mèo Nổ phiên bản Stitch siêu vui nhộn!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${pacifico.variable} ${quicksand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
