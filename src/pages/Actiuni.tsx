import React, { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import UserActivityFeed from "@/components/admin/UserActivityFeed";

const Actiuni: React.FC = () => {
  useEffect(() => {
    // SEO: title, meta description, canonical
    document.title = "Acțiuni utilizatori – activitate în timp real";

    const desc =
      "Flux în timp real cu toate acțiunile efectuate pe site de către toți utilizatorii.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      "href",
      `${window.location.origin}/account/actiuni`
    );
  }, []);

  return (
    <DashboardLayout>
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Acțiuni</h1>
        <p className="text-muted-foreground text-sm">
          Activitate în timp real pentru toți utilizatorii (vizualizare globală)
        </p>
      </header>

      <section aria-label="Flux activitate utilizatori">
        <UserActivityFeed />
      </section>
    </DashboardLayout>
  );
};

export default Actiuni;
