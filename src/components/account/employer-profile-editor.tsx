"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HOUSEHOLD_TYPES } from "@/lib/constants";
import { LocationInput } from "@/components/shared/location-input";
import { updateEmployerProfile } from "@/app/account/profile/actions";
import type { User } from "@/types/database";

interface EmployerProfileEditorProps {
  user: User;
  profile: {
    id: string;
    householdType: string | null;
    locality: string | null;
  } | null;
}

export function EmployerProfileEditor({
  user,
  profile,
}: EmployerProfileEditorProps) {
  const router = useRouter();
  const t = useTranslations("profileEdit");
  const locale = useLocale();

  const nameParts = (user.name ?? "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [locality, setLocality] = useState(profile?.locality ?? user.locality ?? "");
  const [householdType, setHouseholdType] = useState(profile?.householdType ?? "");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const householdLabels: Record<string, { en: string; hi: string }> = {
    apartment: { en: "Apartment", hi: "अपार्टमेंट" },
    independent_house: { en: "Independent House", hi: "स्वतंत्र मकान" },
    villa: { en: "Villa", hi: "विला" },
    other: { en: "Other", hi: "अन्य" },
  };

  async function handleSubmit() {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const formData = new FormData();
    formData.set("profile_id", profile?.id ?? "");
    formData.set("name", fullName);
    formData.set("locality", locality);
    formData.set("household_type", householdType);
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);

    await updateEmployerProfile(formData);
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">Back</span>
        </button>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {/* Phone (read-only) */}
        <div>
          <label className="text-xs font-semibold text-slate-500">{t("phoneNumber")}</label>
          <Input value={`+91 ${user.phone.slice(-10)}`} disabled className="mt-1 bg-slate-50 text-[13px] text-slate-400" />
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            Name
          </label>
          <div className="mt-1 flex gap-2">
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="flex-1 bg-white text-[13px]"
            />
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="flex-1 bg-white text-[13px]"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            {t("location")}
          </label>
          <div className="mt-1">
            <LocationInput
              value={locality}
              onChange={setLocality}
              onCoords={(lat, lng) => {
                setLatitude(lat.toString());
                setLongitude(lng.toString());
              }}
            />
          </div>
        </div>

        {/* Household type */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            {t("householdType")}
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HOUSEHOLD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setHouseholdType(type)}
                className={`rounded-full border-[1.5px] px-3 py-1 text-[11px] font-semibold transition-all ${
                  householdType === type
                    ? "border-primary bg-teal-light text-teal-dark"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {locale === "hi"
                  ? householdLabels[type]?.hi ?? type
                  : householdLabels[type]?.en ?? type}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSubmit}
          className="w-full rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white"
        >
          {t("saveChanges")}
        </button>
      </div>
    </div>
  );
}
