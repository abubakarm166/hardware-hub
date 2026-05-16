import type { ComponentType, SVGProps } from "react";
import {
  IconBusinesses,
  IconDistributors,
  IconInsurer,
  IconMvno,
  IconOem,
  IconOperator,
} from "@/components/icons/BusinessServiceIcons";

export type BusinessSegment = {
  title: string;
  body: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const businessServiceSegments: BusinessSegment[] = [
  {
    title: "OEM",
    body: "Authorised repair partner delivering compliant in- and out-of-warranty services at scale. Real-time API integration, L1–L3 certified technicians, fast TAT, NPS excellence",
    Icon: IconOem,
  },
  {
    title: "Operator",
    body: "Strategic repair and insurance partner for MNOs. High-volume authorised repairs, seamless insurance conversion, real-time reporting and exceptional subscriber experience.",
    Icon: IconOperator,
  },
  {
    title: "MVNO Launchpad",
    body: "End-to-end support to launch and scale your MVNO with full device service infrastructure. Authorised repairs, in and out of warranty service, proven processes and nationwide logistics from day one.",
    Icon: IconMvno,
  },
  {
    title: "Insurer",
    body: "Efficient claims processing and repair fulfilment for device insurers. Streamlined workflows, audit-ready quality control, fast TAT and high customer satisfaction at scale.",
    Icon: IconInsurer,
  },
  {
    title: "Distributors",
    body: "End-to-end after-sales support for distributors and retail partners, fully compliant with OEM and MNO standards. Authorised repairs, warranty management that safeguards margins and brand reputation",
    Icon: IconDistributors,
  },
  {
    title: "Businesses",
    body: "Minimise costly device downtime for your team and keep your business moving. Register as a partner and experience Precision | Perfection | Premium.",
    Icon: IconBusinesses,
  },
];
