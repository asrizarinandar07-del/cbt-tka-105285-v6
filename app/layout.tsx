import "./globals.css";

export const metadata = {
 title: "CBT TKA 105285 V6 - UPT SPF SD INPRES 105285",
  description: "Sistem Ujian CBT Kelas 6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
