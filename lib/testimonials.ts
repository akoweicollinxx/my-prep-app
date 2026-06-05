// Do not enable testimonials until you have at least 3 real, attributable quotes.
// Made-up testimonials are a trust-killer. Either use real ones or leave this empty.
// Enable by setting NEXT_PUBLIC_SHOW_TESTIMONIALS=true in your env vars.

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

// TODO: replace with real testimonials before enabling
export const TESTIMONIALS: Testimonial[] = [];