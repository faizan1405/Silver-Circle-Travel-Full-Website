import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, MapPin, Search, UsersRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { activeDestinationsQuery } from "@/lib/public-queries";
import { MagneticButton } from "./MagneticButton";
import { Reveal } from "./Reveal";

const field = "field-glow w-full border-0 bg-transparent py-2 text-base text-navy-deep outline-none";
const label = "block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export function SearchPanel() {
  const navigate = useNavigate();
  const { data: destinations = [] } = useQuery(activeDestinationsQuery);
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travellers, setTravellers] = useState("2");

  const search = () => {
    navigate({
      to: "/destinations",
      search: {
        destination: destination || undefined,
        dates: dates || undefined,
        travellers: travellers || undefined,
      },
    });
  };

  return (
    <section id="travel-search" className="relative z-10 bg-ivory px-5 py-8 lg:px-8">
      <Reveal variant="up" className="mx-auto max-w-6xl">
        <div className="search-panel rounded-2xl p-4 sm:p-5">
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            <div className="search-field flex items-center gap-3 px-4 py-2">
              <MapPin className="h-5 w-5 shrink-0 text-navy" />
              <div className="min-w-0 flex-1">
              <label className={label} htmlFor="s-dest">
                Destination
              </label>
              <select
                id="s-dest"
                className={field}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="">Anywhere</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.title}>
                    {d.title}
                  </option>
                ))}
              </select>
              </div>
            </div>
            <div className="search-field flex items-center gap-3 px-4 py-2">
              <CalendarDays className="h-5 w-5 shrink-0 text-navy" />
              <div className="min-w-0 flex-1">
              <label className={label} htmlFor="s-dates">
                Travel dates
              </label>
              <input
                id="s-dates"
                type="month"
                className={field}
                value={dates}
                onChange={(e) => setDates(e.target.value)}
              />
              </div>
            </div>
            <div className="search-field flex items-center gap-3 px-4 py-2">
              <UsersRound className="h-5 w-5 shrink-0 text-navy" />
              <div className="min-w-0 flex-1">
              <label className={label} htmlFor="s-travellers">
                Number of travellers
              </label>
              <select
                id="s-travellers"
                className={field}
                value={travellers}
                onChange={(e) => setTravellers(e.target.value)}
              >
                {["1", "2", "3", "4", "5", "6+"].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === "1" ? "traveller" : "travellers"}
                  </option>
                ))}
              </select>
              </div>
            </div>
            <MagneticButton tone="primary" onClick={search} className="h-full min-h-14 w-full !rounded-xl !px-6 md:w-auto">
              <Search className="h-5 w-5" /> Search
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
