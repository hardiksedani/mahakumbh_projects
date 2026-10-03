export type SiteId = "nashik" | "trimbakeshwar";
export type PlaceKind = "landmark" | "facility" | "operations";

export interface SimulationPlace {
  id: string;
  site: SiteId;
  name: string;
  area: string;
  kind: PlaceKind;
  position: [number, number, number];
  description: string;
  portalName: string;
  portalHref: string;
  portalPurpose: string;
  mapUrl?: string;
  example: boolean;
}

// Scene positions are explanatory rather than surveyed coordinates. Public landmarks
// are located by name; planned facilities and device pins are illustrative only.
export const SIMULATION_PLACES: SimulationPlace[] = [
  {
    id: "ramkund",
    site: "nashik",
    name: "Ramkund ghat",
    area: "Panchavati · Godavari riverfront",
    kind: "landmark",
    position: [-10, 3, 4],
    description: "The well-known bathing ghat on the Godavari. The stepped river edge is the main landmark in this Nashik scene.",
    portalName: "Crowd forecast",
    portalHref: "/crowd",
    portalPurpose: "See how crowd pressure and forecast signals are presented for a bathing area.",
    mapUrl: "https://www.openstreetmap.org/?mlat=20.00803&mlon=73.79237#map=17/20.00803/73.79237",
    example: false,
  },
  {
    id: "ramkund-camera",
    site: "nashik",
    name: "Camera coverage example",
    area: "Ramkund approach · illustrative pin",
    kind: "operations",
    position: [-28, 8, 16],
    description: "Shows where a camera signal could be inspected near the ghat. This marker does not claim an installed CCTV camera at this spot.",
    portalName: "CCTV vision",
    portalHref: "/cameras",
    portalPurpose: "Inspect camera and detection examples.",
    example: true,
  },
  {
    id: "godavari-crossing",
    site: "nashik",
    name: "River crossing concept",
    area: "Godavari · schematic crossing",
    kind: "facility",
    position: [15, 7, -7],
    description: "A bridge and pedestrian flow illustration. It is not an official 2027 gate, crossing, closure, or evacuation route.",
    portalName: "GIS map",
    portalHref: "/map",
    portalPurpose: "Compare the scene with the project's spatial overview.",
    example: true,
  },
  {
    id: "panchavati",
    site: "nashik",
    name: "Panchavati precinct",
    area: "Old Nashik · north of the river",
    kind: "landmark",
    position: [-48, 5, -30],
    description: "The historic precinct around Ramkund and its nearby temples. The buildings in this scene are stylised, not a surveyed reconstruction.",
    portalName: "Incident centre",
    portalHref: "/incidents",
    portalPurpose: "See how an incident near a busy precinct is triaged.",
    example: false,
  },
  {
    id: "tapovan",
    site: "nashik",
    name: "Tapovan area",
    area: "Nashik · downstream area",
    kind: "landmark",
    position: [57, 5, 26],
    description: "Tapovan is an area of Nashik. The nearby shelter symbol is a concept, not a confirmed shelter building or capacity.",
    portalName: "Shelters",
    portalHref: "/shelters",
    portalPurpose: "Explore shelter and holding-area information in the project.",
    example: false,
  },
  {
    id: "helpdesk",
    site: "nashik",
    name: "Pilgrim help point example",
    area: "Panchavati approach · illustrative pin",
    kind: "facility",
    position: [-45, 5, 10],
    description: "A suggested place for a volunteer or information desk in the walkthrough. Exact 2027 helpdesk locations need official confirmation.",
    portalName: "Resource dispatch",
    portalHref: "/resources",
    portalPurpose: "Understand how teams and resources are assigned.",
    example: true,
  },
  {
    id: "public-reports",
    site: "nashik",
    name: "Public report signal",
    area: "Nashik sector · illustrative pin",
    kind: "operations",
    position: [44, 6, -32],
    description: "An example geotagged public report. The dot does not identify a real person or a live report.",
    portalName: "Social feed",
    portalHref: "/social",
    portalPurpose: "See how public signals enter the review queue.",
    example: true,
  },
  {
    id: "rumour-review",
    site: "nashik",
    name: "Claim verification desk",
    area: "Nashik operations · illustrative pin",
    kind: "operations",
    position: [37, 6, -7],
    description: "A virtual review station for claims about a location. It is not a physical cyber office in the model.",
    portalName: "Rumour scanner",
    portalHref: "/verify",
    portalPurpose: "Inspect evidence and verification status before acting on a claim.",
    example: true,
  },
  {
    id: "nashik-brief",
    site: "nashik",
    name: "Nashik operations overview",
    area: "Citywide view · virtual layer",
    kind: "operations",
    position: [-1, 13, -49],
    description: "A virtual command-layer anchor. It is not a mapped control-room building.",
    portalName: "Dashboard",
    portalHref: "/",
    portalPurpose: "Open the overall command dashboard and its simulated indicators.",
    example: true,
  },
  {
    id: "trimbak-temple",
    site: "trimbakeshwar",
    name: "Trimbakeshwar temple",
    area: "Trimbak town · Brahmagiri foothills",
    kind: "landmark",
    position: [-11, 8, -4],
    description: "The Jyotirlinga temple is a key Trimbakeshwar landmark. Its 3D form here is a simplified visual cue.",
    portalName: "Sentiment pulse",
    portalHref: "/sentiment",
    portalPurpose: "Explore how public concerns from this area could be grouped for review.",
    mapUrl: "https://www.openstreetmap.org/search?query=Trimbakeshwar%20Temple%20Maharashtra",
    example: false,
  },
  {
    id: "kushavarta",
    site: "trimbakeshwar",
    name: "Kushavart Tirtha",
    area: "Trimbak town · near the temple",
    kind: "landmark",
    position: [29, 4, 10],
    description: "The sacred kund is about 400 metres from the Trimbakeshwar temple according to Nashik district. Their modelled spacing is illustrative.",
    portalName: "Broadcast studio",
    portalHref: "/broadcast",
    portalPurpose: "See how a reviewed location-specific message could be drafted.",
    mapUrl: "https://www.openstreetmap.org/search?query=Kushavart%20Tirtha%20Trimbakeshwar",
    example: false,
  },
  {
    id: "trimbak-resources",
    site: "trimbakeshwar",
    name: "Response staging example",
    area: "Trimbak approach · illustrative pin",
    kind: "facility",
    position: [-49, 5, 31],
    description: "A hypothetical staging point to explain field coordination. This is not a designated response depot.",
    portalName: "AI models",
    portalHref: "/models",
    portalPurpose: "See which model outputs inform an operator's decision.",
    example: true,
  },
  {
    id: "trimbak-summary",
    site: "trimbakeshwar",
    name: "Trimbakeshwar overview",
    area: "Townwide view · virtual layer",
    kind: "operations",
    position: [3, 14, -43],
    description: "A virtual planning anchor covering the temple, kund, and town approach.",
    portalName: "Executive brief",
    portalHref: "/executive",
    portalPurpose: "Review the project-wide summary and decisions.",
    example: true,
  },
];

export function simulationPortalHref(place: SimulationPlace): string {
  const separator = place.portalHref.includes("?") ? "&" : "?";
  return `${place.portalHref}${separator}from=simulation&place=${encodeURIComponent(place.id)}`;
}
