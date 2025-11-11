import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  FlagIcon,
  MapIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import heroImage from '../images/header-background.webp';
import profilepic from '../images/profilepic.jpg';
import testimonialImage from '../images/testimonial.webp';
import {
  About,
  ContactSection,
  ContactType,
  Hero,
  HomepageMeta,
  PortfolioItem,
  SkillGroup,
  Social,
  TestimonialSection,
  TimelineItem,
} from './dataDef';

/**
 * Page meta data
 */
export const homePageMeta: HomepageMeta = {
  title: 'LocumPharmacistMelbourne.com.au',
  description: 'Reliable, experienced pharmacist locum services across Melbourne, Victoria.',
};

/**
 * Section definition
 */
export const SectionId = {
  Hero: 'hero',
  About: 'about',
  Contact: 'contact',
  Portfolio: 'portfolio',
  Resume: 'resume',
  Skills: 'skills',
  Stats: 'stats',
  Testimonials: 'testimonials',
} as const;

export type SectionId = (typeof SectionId)[keyof typeof SectionId];

/**
 * Hero section
 */
export const heroData: Hero = {
  imageSrc: heroImage,
  name: `Locum Pharmacist — Melbourne, Victoria`,
  description: (
    <>
      <p className="prose-sm text-stone-200 sm:prose-base lg:prose-lg">
        I'm a registered community pharmacist providing professional{' '}
        <strong className="text-stone-100">locum cover across Melbourne</strong> and regional Victoria. I ensure
        continuity of care, PBS compliance, and smooth dispensary operations during staff absences and peak periods.
      </p>
      <p className="prose-sm text-stone-200 sm:prose-base lg:prose-lg">
        Experienced across independent and franchise pharmacies, including high-volume environments. Competent with{' '}
        <strong className="text-stone-100">DispenseWorks, Minfos, Fred, POSWorks, Fred Plus, Z dispense, DDcloud, MethDA, and StrongRoom</strong>.
      </p>
    </>
  ),
  actions: [
    {
      href: `#${SectionId.Contact}`,
      text: 'Enquire / Book',
      primary: true,
    },
  ],
};

/**
 * About section
 */
export const aboutData: About = {
  profileImageSrc: profilepic,
  description:
    'Registered community pharmacist based in Melbourne, Victoria. I specialise in maintaining accurate, compliant, and efficient dispensary operations with a calm, team-focused approach. Services include MedsChecks (incl. Diabetes MedsCheck), DAAs, vaccinations, clinical screening/counselling, and PPA-funded programs. I integrate quickly with new teams and systems to keep workflows running smoothly.',
  aboutItems: [
    {label: 'Location', text: 'Elsternwick 3185, Melbourne, VIC', Icon: MapIcon},
    {
      label: 'Service Regions',
      text: 'All directions welcome: CBD & Inner Suburbs; West (Melton, Rockbank, Thornhill Park, Werribee, Point Cook); North/East (Doncaster, Ringwood, Heidelberg, Greensborough, and surrounding areas).\nRegional by request.',
      Icon: MapIcon,
    },
    {label: 'Availability', text: 'Available weekdays with flexible hours. Weekends unavailable.', Icon: CalendarIcon},
    {label: 'Systems', text: 'DispenseWorks, Minfos, Fred, POSWorks, Fred Plus, Z Dispense, DDBook, MethDA, Strongroom, MyPak, Medadvisor', Icon: SparklesIcon},
    {label: 'Vaccinations', text: 'Flu, COVID-19, Whooping Cough, RSV, Travel Health', Icon: AcademicCapIcon},
    {label: 'AHPRA', text: 'PHA0002760177', Icon: FlagIcon},
    {label: 'ABN', text: '60 941 806 254', Icon: BuildingOffice2Icon},
    {label: 'Insurance', text: 'Professional indemnity (current)', Icon: SparklesIcon},
  ],
};

/**
 * Skills section
 */
export const skills: SkillGroup[] = [
  {
    name: 'Core Competencies',
    skills: [
      {name: 'PBS dispensing & claiming', level: 9},
      {name: 'PBS reconciliation & compliance', level: 9},
      {name: 'Workflow optimisation', level: 8},
      {name: 'Team leadership & supervision', level: 8},
      {name: 'Clinical screening & counselling', level: 8},
    ],
  },
  {
    name: 'Professional Services',
    skills: [
      {name: 'MedsCheck & Diabetes MedsCheck (PPA)', level: 9},
      {name: 'Vaccinations (flu, COVID-19, etc.)', level: 9},
      {name: 'DAA / SureMed management', level: 8},
      {name: 'DAA QA & continuity', level: 8},
      {name: 'PPA-funded programs', level: 8},
    ],
  },
  {
    name: 'Systems & Tools',
    skills: [
      {name: 'DispenseWorks', level: 9},
      {name: 'Minfos', level: 8},
      {name: 'Fred', level: 8},
      {name: 'POSWorks', level: 8},
    ],
  },
];

/**
 * Portfolio section
 */
export const portfolioItems: PortfolioItem[] = [
];

/**
 * Resume section -- TODO: Standardize resume contact format or offer MDX
 */
export const education: TimelineItem[] = [
];

export const experience: TimelineItem[] = [
];

/**
 * Testimonial section
 */
export const testimonial: TestimonialSection = {
  imageSrc: testimonialImage,
  testimonials: [
    {
      name: 'Pharmacy Owner, DCO Cheltenham',
      text: 'Jordan has been a great support to our pharmacy team in a locum capacity. He consistently demonstrates strong communication skills and a genuine care for customers. He brings energy and professionalism to the role, and his approachable nature makes him a pleasure to work with.',
    },
    {
      name: 'Pharmacy Owner, Western Suburbs',
      text: 'Reliable, detail-oriented, and proactive — Jordan consistently ensures the dispensary runs smoothly and PBS claims are compliant.',
    },
    {
      name: 'Dispensary Manager, Melbourne Metro',
      text: 'Exceptional communication and teamwork. Quickly adapts to new systems and delivers excellent patient care.',
    },
  ],
};

/**
 * Contact section
 */

export const contact: ContactSection = {
  headerText: 'Service Enquiries & Bookings',
  description:
    'For locum pharmacist cover across Melbourne and regional Victoria. Include pharmacy location, dates/times, dispense system, and any specific service requirements.',
  calendlyUrl: 'https://calendly.com/your-username', // Update with your Calendly URL
  items: [
    {
      type: ContactType.Email,
      text: 'contact@locumpharmacistmelbourne.com.au',
      href: 'mailto:contact@locumpharmacistmelbourne.com.au',
    },
    {
      type: ContactType.Location,
      text: 'Melbourne, VIC',
      href: 'https://maps.google.com/?q=Melbourne+VIC',
    },
  ],
};

/**
 * Social items
 */
export const socialLinks: Social[] = [
];
