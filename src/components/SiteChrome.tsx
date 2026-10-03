import { ReactNode } from "react";
import { Footer } from "./Footer";
import { Loader } from "./Loader";
import { Navbar } from "./Navbar";
import { WhatsAppFab } from "./WhatsAppFab";

export function SiteChrome({ children, loading = false }: { children: ReactNode; loading?: boolean }) {
  return (
    <>
      {loading ? <Loader /> : null}
      <Navbar />
      <main>{children}</main>
      <WhatsAppFab />
      <Footer />
    </>
  );
}