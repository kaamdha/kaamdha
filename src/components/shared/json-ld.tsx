import { JOB_CATEGORIES } from "@/lib/constants";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "kaamdha",
        url: "https://kaamdha.com",
        description:
          "kaamdha connects households with verified maids, cooks, drivers, nannies and more in Gurgaon. Find staff or find jobs near you.",
        areaServed: {
          "@type": "City",
          name: "Gurgaon",
          addressCountry: "IN",
        },
      }}
    />
  );
}

export function JobPostingJsonLd({
  title,
  description,
  category,
  locality,
  salaryMin,
  salaryMax,
  createdAt,
  expiresAt,
  employerName,
}: {
  title: string;
  description?: string | null;
  category: string;
  locality?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt: string;
  expiresAt: string;
  employerName: string;
}) {
  const catInfo = JOB_CATEGORIES.find((c) => c.id === category);
  const jobTitle = title || `${catInfo?.labelEn ?? "Staff"} needed`;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobTitle,
    description: description || `Looking for ${catInfo?.labelEn?.toLowerCase() ?? "staff"} in ${locality ?? "Gurgaon"}`,
    datePosted: createdAt,
    validThrough: expiresAt,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: employerName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: locality ?? "Gurgaon",
        addressRegion: "Haryana",
        addressCountry: "IN",
      },
    },
    industry: "Household Services",
  };

  if (salaryMin || salaryMax) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: salaryMin ?? undefined,
        maxValue: salaryMax ?? undefined,
        unitText: "MONTH",
      },
    };
  }

  return <JsonLd data={data} />;
}
