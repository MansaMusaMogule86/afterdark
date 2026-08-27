"use client";

import { DoorOpen, Building2, Car, Navigation, MapPin, ArrowUpRight } from "lucide-react";
import { locationRecords, venues } from "@/lib/venue-data";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { InteractiveLocationMap } from "@/components/interactive-location-map";
import { Button } from "@/components/ui/button";

export function LocationsSection() {
  return (
    <section id="locations" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">Two Locations</span>
            <h2 className="heading-editorial mt-3 max-w-3xl text-4xl text-foreground md:text-6xl">
              Two skyline addresses. One night.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              Avenue sits above Sheikh Zayed Road. Ora and Black Tape share level forty four of Hilton Dubai
              Al Habtoor City. Both hotels have valet, dedicated nightclub entrances, and dedicated elevator
              banks.
            </p>
          </div>
        </div>

        {/* Wide skyline image */}
        <div className="mt-12 overflow-hidden rounded-sm border border-border/40">
          <AssetImage
            src="/placeholders/home_locations_wide.webp"
            file="home_locations_wide.webp"
            purpose="Dubai skyline connecting the two hotel destinations."
            dimensions="2000 × 1125"
            crop="wide"
            venue="global"
            alt="Dubai skyline — Sheikh Zayed Road and Business Bay"
            className="aspect-[16/7] w-full md:aspect-[16/5]"
          />
        </div>

        {/* Interactive map */}
        <InteractiveLocationMap />

        {/* Location blocks */}
        <div className="mt-12 space-y-6">
          {locationRecords.map((loc, idx) => {
            const locVenues = loc.venues
              .map((slug) => venues.find((v) => v.slug === slug))
              .filter((v): v is NonNullable<typeof v> => Boolean(v));

            const arrivalFile =
              idx === 0 ? "shangri_la_arrival.webp" : "hilton_habtoor_arrival.webp";
            const arrivalSrc =
              idx === 0
                ? "/placeholders/shangri_la_arrival.webp"
                : "/placeholders/hilton_habtoor_arrival.webp";
            const arrivalPurpose =
              idx === 0
                ? "Exact hotel arrival and entrance used for Avenue guests."
                : "Exact hotel arrival and entrance used for Ora and Black Tape guests.";

            const firstVenue = locVenues[0];

            return (
              <article
                key={loc.slug}
                className="grid gap-0 overflow-hidden rounded-sm border border-border/40 bg-card md:grid-cols-2"
              >
                {/* Left: arrival image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[520px]">
                  <AssetImage
                    src={arrivalSrc}
                    file={arrivalFile}
                    purpose={arrivalPurpose}
                    dimensions="2000 × 1125"
                    crop="wide"
                    venue="global"
                    alt={`${loc.hotelName} arrival`}
                    className="h-full w-full"
                  />
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-sm border border-foreground/20 bg-background/70 px-3 py-1.5 backdrop-blur-sm">
                    <MapPin className="h-3 w-3 text-accent" />
                    <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-foreground">
                      {loc.area}
                    </span>
                  </div>
                </div>

                {/* Right: instructions */}
                <div className="flex flex-col p-6 md:p-10">
                  <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-accent">
                    Location {String(idx + 1).padStart(2, "0")} / 02
                  </span>
                  <h3 className="heading-editorial mt-3 text-3xl text-foreground md:text-4xl">
                    {loc.hotelName}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                    {loc.description}
                  </p>

                  {/* Venues at this location */}
                  <div className="mt-6 border-t border-border/40 pt-5">
                    <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">
                      Venues at this location
                    </p>
                    <ul className="mt-3 space-y-2">
                      {locVenues.map((v) => (
                        <li
                          key={v.slug}
                          className="flex items-baseline justify-between gap-3"
                        >
                          <span className="font-serif-display text-base text-foreground">
                            {v.shortName}
                          </span>
                          <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
                            {v.location.floor}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arrival instructions */}
                  <div className="mt-6 border-t border-border/40 pt-5">
                    <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">
                      Arrival
                    </p>
                    <dl className="mt-3 space-y-4">
                      <DefRow
                        icon={<DoorOpen className="h-4 w-4" />}
                        label="Entrance"
                        value={firstVenue?.location.entranceInstructions ?? ""}
                      />
                      <DefRow
                        icon={<Building2 className="h-4 w-4" />}
                        label="Floor"
                        value={locVenues
                          .map((v) => `${v.shortName}: ${v.location.floor}`)
                          .join(" · ")}
                      />
                      <DefRow
                        icon={<Car className="h-4 w-4" />}
                        label="Valet / Parking"
                        value={firstVenue?.location.valetParking ?? ""}
                      />
                      <DefRow
                        icon={<Navigation className="h-4 w-4" />}
                        label="Taxi"
                        value={firstVenue?.location.taxiInstructions ?? ""}
                      />
                    </dl>
                  </div>

                  {/* Open map */}
                  <div className="mt-7">
                    <Button
                      onClick={() => {
                        track("click_map", { location: loc.slug });
                        window.open(
                          `https://www.google.com/maps?q=${loc.coordinates.lat},${loc.coordinates.lng}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                      variant="outline"
                      className="rounded-none border-foreground/30 bg-transparent px-6 py-3 font-mono-tight text-[0.6875rem] uppercase tracking-[0.18em] text-foreground hover:bg-foreground/10"
                    >
                      <MapPin className="mr-2 h-3.5 w-3.5" />
                      Open Map
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Metro note */}
        <p className="mt-8 font-mono-tight text-[0.6875rem] text-muted-foreground">
          Metro walking times are not published until verified. Use taxi or hotel transfer for the most
          reliable arrival.
        </p>
      </div>
    </section>
  );
}

function DefRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-accent">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm leading-relaxed text-foreground">{value}</dd>
      </div>
    </div>
  );
}
