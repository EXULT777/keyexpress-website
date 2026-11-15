import type { SectionContent, SectionKey } from "@/lib/page-sections";
import type { IconName } from "@/lib/icons";

// Everything the site shows on its first start, before the Admin edits anything.
// Text can use {phone}, {email} and {city}; pages fill in the current Business Settings.

export const starterSettings = {
  businessName: "Key Express",
  phone: "(555) 014-7823",
  email: "info@keyexpress.example",
  notificationEmail: "",
  serviceAreaCity: "Your City",
  towns: Array.from({ length: 8 }, (_, i) => `Nearby Town ${i + 1}`),
  paymentMethods: ["Cash", "Visa", "Mastercard", "American Express", "Discover", "Apple Pay", "Google Pay"],
  emergencyBadge: true,
  licenseNumber: "",
  footerText: "A fully mobile locksmith for cars, homes, and businesses. We come to you, day or night.",
};

export const starterSections: { [K in SectionKey]: SectionContent<K> } = {
  "home.hero": {
    heading: "Locked Out or Lost Your Keys? We'll Get You Back In, Fast.",
    text: "Key Express is a mobile locksmith serving {city} and nearby areas. We come straight to you, for cars, homes, and businesses.",
    callButton: "Get Help Now",
    requestButton: "Request Service",
    phoneIntro: "Call us any time, day or night:",
  },
  "home.emergency": {
    heading: "Emergency Lockout? We're Available Day and Night",
    text: "Locked out of your car, house, or office? Call us any hour, any day. A technician will head your way quickly to get you back inside without damaging your locks.",
    button: "Call Now",
  },
  "home.business": {
    heading: "Reliable Locksmith Service for Your Business",
    text: "From company vehicles to office doors to tenant locks, we keep your property secure and your keys under control. Property managers, offices, and shops can count on us.",
    button: "Request Service",
  },
  "home.about": {
    heading: "Locksmith Help That Comes to You",
    text: "Key Express is a fully mobile locksmith company. Instead of you coming to a shop, we bring the tools and the expertise to your driveway, home, or business. We're known for handling the difficult jobs: the advanced car keys and tricky locks that other companies often turn down.",
    button: "More about us",
  },
  "home.whyChooseUs": {
    heading: "Why Choose Us",
    badges: [
      { icon: "truck", title: "Mobile Service", text: "We come to your location." },
      { icon: "tag", title: "Fair Prices", text: "Honest, affordable rates." },
      { icon: "clock", title: "Fast Response", text: "Quick help when you need it." },
      { icon: "shield", title: "Licensed & Insured", text: "Trained, professional technicians." },
      { icon: "thumbs-up", title: "Satisfaction Guaranteed", text: "We're not done until you're happy." },
    ],
  },
  "home.services": {
    heading: "Our Services",
    text: "Whatever lock or key you need help with, we bring the tools to you.",
    cardLink: "Call for this service",
  },
  "home.fobHighlight": {
    heading: "Need a New Key Fob? Get It Done Today",
    text: "Lost your remote or did it stop working? We replace and program key fobs at prices well below the dealer, often the same day, right where your car is parked.",
    button: "Call Now",
  },
  "home.businessAccounts": {
    heading: "Open a Business Account",
    text: "Let us manage the locks and keys for your company, buildings, or rental properties. One call handles rekeys, lock changes, and key control, so you can focus on running your business.",
    button: "Call to Set Up an Account",
  },
  "home.request": {
    heading: "Request Service",
    text: "Prefer to talk? Call us at {phone}. It's the fastest way to get help.",
    button: "Send Request",
    successMessage: "Thank you! We received your request and will call you shortly. For emergencies, please call {phone}.",
  },
  "home.faq": {
    heading: "Frequently Asked Questions",
  },
  "home.serviceArea": {
    heading: "Areas We Serve",
    text: "We proudly serve {city} and the surrounding communities, including:",
  },
  "about.intro": {
    heading: "About Key Express",
    text: [
      "Key Express is a fully mobile locksmith company. Instead of you coming to a shop, we bring the tools and the expertise to your driveway, home, or business.",
      "We're known for handling the difficult jobs: the advanced car keys and tricky locks that other companies often turn down. Our vans carry the equipment to cut and program most car keys on the spot, including smart keys, key fobs, and transponder keys for domestic and European vehicles.",
      "We also help homeowners, renters, property managers, and businesses with lockouts, rekeys, lock changes, and new hardware.",
      "Call us any time, day or night. We'll answer your questions and send a technician your way.",
    ].join("\n\n"),
  },
  "contact.intro": {
    heading: "Contact Us",
    text: "The fastest way to get help is to call us at {phone}, any time of day or night. You can also send us a request below and we'll call you back.",
  },
  "not-found": {
    heading: "Sorry, We Can't Find That Page",
    text: "The page you're looking for may have moved. You can go back to the home page, or call us at {phone} if you need help right away.",
    button: "Go to Home",
  },
};

type StarterService = {
  slug: string;
  title: string;
  icon: IconName;
  shortDescription: string;
  longDescription: string;
};

function paragraphs(...lines: string[]) {
  return lines.join("\n\n");
}

export const starterServices: StarterService[] = [
  {
    slug: "european-foreign-vehicles",
    title: "European & Foreign Vehicles",
    icon: "car",
    shortDescription: "Keys and programming for Audi, Volkswagen, Volvo, Mercedes-Benz, BMW, and other imported makes.",
    longDescription: paragraphs(
      "European and imported cars use some of the most advanced key systems on the road. We have the equipment to cut and program keys for Audi, Volkswagen, Volvo, Mercedes-Benz, BMW, and many other makes.",
      "You don't need to have your car towed to the dealer. We come to wherever your car is parked and make the new key there.",
      "Call us with your car's make, model, and year, and we'll tell you what we can do.",
    ),
  },
  {
    slug: "domestic-vehicles",
    title: "Domestic Vehicles",
    icon: "car-front",
    shortDescription: "Key cutting and programming for Ford, Chevrolet, Dodge, Jeep, GMC, and other American brands.",
    longDescription: paragraphs(
      "We cut and program keys for Ford, Chevrolet, Dodge, Jeep, GMC, and other American brands, from older models to the newest trucks and SUVs.",
      "Whether you need a spare key or you've lost the only one you had, we can make a working key on the spot.",
      "It's usually faster and cheaper than the dealership, and there's no tow truck to pay for.",
    ),
  },
  {
    slug: "smart-keys",
    title: "Smart Keys",
    icon: "key",
    shortDescription: "Push-to-start and proximity keys made and programmed on the spot.",
    longDescription: paragraphs(
      "Smart keys let you unlock the doors and start the car without taking the key out of your pocket. When one is lost or stops working, the car may not start at all.",
      "We make and program new smart keys on the spot, so your car recognizes the new key and stops accepting the one that was lost.",
      "Have your car's make, model, and year ready when you call, so we can bring the right key.",
    ),
  },
  {
    slug: "key-fob-programming",
    title: "Key Fob Programming",
    icon: "fob",
    shortDescription: "Lost or broken remote? We replace and program key fobs for less than the dealership.",
    longDescription: paragraphs(
      "Your key fob locks and unlocks the doors, opens the trunk, and sometimes starts the car. When it's lost, broken, or stops working, we can replace it.",
      "We program the new fob to your car right where it's parked.",
      "Our prices are usually well below what the dealer charges.",
    ),
  },
  {
    slug: "transponder-keys",
    title: "Transponder Keys",
    icon: "chip",
    shortDescription: "Chip keys cut and paired to your vehicle so it starts right away.",
    longDescription: paragraphs(
      "Most cars built since the late 1990s have a small chip inside the key. The car won't start unless it recognizes that chip, even if the key fits and turns.",
      "We cut the new key and pair its chip with your car, so it starts the first time.",
      "We can also make spare transponder keys, so you're never stuck with just one.",
    ),
  },
  {
    slug: "ignition-repair-replacement",
    title: "Ignition Repair & Replacement",
    icon: "ignition",
    shortDescription: "Key stuck or ignition won't turn? We repair or replace the ignition.",
    longDescription: paragraphs(
      "If your key gets stuck, won't turn, or the ignition feels loose, the ignition cylinder may be worn or damaged.",
      "We repair or replace the ignition where your car is parked.",
      "Please don't force a stuck key: it can break off inside the ignition. Give us a call instead.",
    ),
  },
  {
    slug: "apartments",
    title: "Apartments",
    icon: "building",
    shortDescription: "Lockouts, rekeys, and lock changes for tenants and property managers.",
    longDescription: paragraphs(
      "Locked out of your apartment? We'll get you back inside quickly and without damage.",
      "For property managers, we rekey units between tenants, change locks, and replace lost keys, so each new tenant gets keys that only they have.",
      "We can take care of a single unit or a whole building.",
    ),
  },
  {
    slug: "residential",
    title: "Residential",
    icon: "home",
    shortDescription: "Home lockouts, rekeying after a move, and new locks for better security.",
    longDescription: paragraphs(
      "Locked out of your house? We'll get you back in without damaging your door or lock.",
      "Just moved in? Rekeying your locks means keys from previous owners no longer work, and it costs less than replacing every lock.",
      "We also install new deadbolts and stronger hardware to make your home more secure.",
    ),
  },
  {
    slug: "commercial",
    title: "Commercial",
    icon: "door",
    shortDescription: "Lock replacement, hardware upgrades, and master key systems for businesses.",
    longDescription: paragraphs(
      "We replace and repair locks for offices, shops, and warehouses, including commercial-grade hardware.",
      "A master key system lets one key open every door, while each employee's key opens only the doors they need.",
      "When an employee leaves or a key goes missing, we can rekey your locks quickly so your business stays secure.",
    ),
  },
];

export const starterFaqs = [
  {
    question: "How quickly can you get to me?",
    answer:
      "We're a mobile service, so a technician heads to you as soon as you call. In most cases we arrive within 20–40 minutes, depending on your location and traffic.",
  },
  {
    question: "Do you really work 24 hours a day?",
    answer:
      "Yes. Emergency lockout help is available 24 hours a day, 7 days a week, including weekends and holidays.",
  },
  {
    question: "Can you make a car key if I lost all of my keys?",
    answer:
      "Yes. We can cut and program a brand-new key on the spot, even with no original key, for most domestic and European vehicles, including smart keys and transponder keys.",
  },
  {
    question: "Are you cheaper than the car dealership?",
    answer:
      "In most cases, yes. Our key and fob replacement usually costs much less than the dealer, and we come to you, so there's no towing.",
  },
  {
    question: "Are your locksmiths licensed and insured?",
    answer:
      "Yes. Our technicians are trained, licensed, and insured professionals, and we stand behind our work with a satisfaction guarantee.",
  },
];

export const starterPrivacyPolicy = `## 1. Who We Are

Key Express is a mobile locksmith service. We drive to our customers to help with car, home, and business locks and keys. You can reach us by phone at {phone} or by email at {email}.

## 2. Information We Collect

When you fill in our Request Service form or call us, we collect the details you give us, such as:

- your name
- your phone number
- your email address
- your address or location
- details about the service you need

When you visit our website, we may also collect basic technical information through cookies or analytics, such as your browser type and the pages you visit.

## 3. How We Use Your Information

We use your information to:

- respond to your requests
- send a technician to you
- give you a price quote
- process your payment
- improve our website
- meet our legal obligations

## 4. Sharing Your Information

We never sell your personal information. We share it only with companies that help us run our business, such as our website host, payment processor, and email provider, or when the law requires us to.

## 5. Cookies

Cookies are small files that a website saves in your browser. You can turn cookies off in your browser settings. Our website will still work for visitors without them.

## 6. Data Security

We use reasonable safeguards to protect your information. However, no method of sending or storing information is 100% secure, so we cannot guarantee complete security.

## 7. Data Retention

We keep your information only as long as we need it to provide our services, keep business records, and meet legal requirements.

## 8. Your Rights

You can ask us to show you, correct, or delete the personal information we have about you. To make a request, contact us using the details below.

## 9. Children's Privacy

Our website is not meant for children under 13, and we do not knowingly collect information from them.

## 10. Third-Party Links

Our website may link to other websites. We are not responsible for how those websites handle your information.

## 11. Changes to This Policy

We may update this policy from time to time. Any changes will be posted on this page, with a new "Last updated" date.

## 12. Contact Us

If you have questions about this policy or your information, please contact us:

- Phone: {phone}
- Email: {email}
`;

export const starterSeo = [
  {
    path: "/",
    title: "Key Express | 24/7 Mobile Locksmith in {city}",
    description:
      "Locked out or lost your keys? Key Express is a mobile locksmith serving {city} and nearby areas, 24/7. Car keys, key fobs, homes, and businesses. Call {phone}.",
  },
  {
    path: "/about",
    title: "About Us | Key Express",
    description:
      "Key Express is a fully mobile locksmith. We bring the tools to your driveway, home, or business, and we handle the jobs others turn down.",
  },
  {
    path: "/contact",
    title: "Contact Us | Key Express",
    description:
      "Call Key Express at {phone}, day or night, or send a service request online. Mobile locksmith serving {city} and nearby areas.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Key Express",
    description: "How Key Express collects, uses, and protects your personal information.",
  },
];
