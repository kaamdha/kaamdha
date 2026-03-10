"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HOUSEHOLD_TYPES } from "@/lib/constants";
import { detectLocation, type LocationResult } from "@/lib/location";
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

  const [name, setName] = useState(user.name ?? "");
  const [locality, setLocality] = useState(profile?.locality ?? user.locality ?? "");
  const [householdType, setHouseholdType] = useState(profile?.householdType ?? "");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const householdLabels: Record<string, { en: string; hi: string }> = {
    apartment: { en: "Apartment", hi: "अपार्टमेंट" },
    independent_house: { en: "Independent House", hi: "स्वतंत्र मकान" },
    villa: { en: "Villa", hi: "विला" },
    other: { en: "Other", hi: "अन्य" },
  };

  async function handleDetectLocation() {
    setDetectingLocation(true);
    try {
      const result: LocationResult = await detectLocation();
      if (result.locality) setLocality(result.locality);
      if (result.latitude) setLatitude(result.latitude.toString());
      if (result.longitude) setLongitude(result.longitude.toString());
    } catch {
      // Manual fallback
    } finally {
      setDetectingLocation(false);
    }
  }

  async function handleSubmit() {
    const formData = new FormData();
    formData.set("profile_id", profile?.id ?? "");
    formData.set("name", name);
    formData.set("locality", locality);
    formData.set("household_type", householdType);
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);

    await updateEmployerProfile(formData);
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => router.back()} className="text-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-heading text-[16px] font-bold text-foreground">
          {t("editProfile")}
        </h1>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("name")}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 bg-white text-[13px]"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("location")}
          </label>
          <div className="mt-1 flex gap-2">
            <Input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="flex-1 bg-white text-[13px]"
            />
            <button
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-slate-200 bg-teal-light"
            >
              {detectingLocation ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <MapPin className="size-4 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Household type */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("householdType")}
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HOUSEHOLD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setHouseholdType(type)}
                className={`rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold transition-all ${
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
