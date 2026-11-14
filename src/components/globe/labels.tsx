import { CITIES } from "@/lib/data";
import { useFutures } from "@/store/futures";

/** DOM nodes for city labels, positioned every frame by the 3D scene. */
export const cityLabelEls = new Map<string, HTMLButtonElement>();

export function CityLabels() {
  const cityId = useFutures((s) => s.cityId);
  const selectCity = useFutures((s) => s.selectCity);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {CITIES.map((c) => (
        <button
          key={c.id}
          tabIndex={-1}
          ref={(el) => {
            if (el) cityLabelEls.set(c.id, el);
            else cityLabelEls.delete(c.id);
          }}
          className="globe-label absolute left-0 top-0"
          style={{ opacity: 0 }}
          data-active={c.id === cityId}
          onClick={() => selectCity(c.id, c.lat, c.lon)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}