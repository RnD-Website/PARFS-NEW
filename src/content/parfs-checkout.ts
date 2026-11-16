/**
 * PARFS checkout settings. Shipping rates follow the Shipping policy (complimentary standard, paid
 * express). The express price is a PLACEHOLDER — confirm before launch.
 */
export const shippingMethods = [
  { id: "standard", label: "Standard", detail: "3–5 business days", price: 0 },
  { id: "express", label: "Express", detail: "1–2 business days", price: 25 },
] as const;

export const checkoutCountries = ["United States", "Canada", "United Kingdom", "Australia", "France", "Germany", "United Arab Emirates"];
export const shippableCountries = ["United States"];

export const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];
