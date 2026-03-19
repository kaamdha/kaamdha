"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2, LocateFixed } from "lucide-react";
import { EditIcon } from "@/components/shared/edit-icon";
import { Input } from "@/components/ui/input";
import {
  detectLocation,
  searchLocations,
  type LocationResult,
  type LocationSuggestion,
} from "@/lib/location";

interface LocationInputProps {
  value: string;
  onChange: (locality: string) => void;
  onCoords?: (lat: number, lng: number) => void;
  placeholder?: string;
  startEditing?: boolean;
}

export function LocationInput({
  value,
  onChange,
  onCoords,
  placeholder = "Your area / locality",
  startEditing = false,
}: LocationInputProps) {
  // Start in display mode if we already have a saved value (unless startEditing is true)
  const [editing, setEditing] = useState(startEditing || !value);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserTyping = useRef(false);

  // Sync external value changes (only when not actively typing)
  useEffect(() => {
    if (!isUserTyping.current) {
      setQuery(value);
    }
  }, [value]);

  // Close dropdown on outside click; exit edit mode if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        if (query) setEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const handleSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const results = await searchLocations(q);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch (err) {
      console.error("Location search failed:", err);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInputChange(val: string) {
    isUserTyping.current = true;
    setQuery(val);
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(val);
      isUserTyping.current = false;
    }, 300);
  }

  function handleSelect(suggestion: LocationSuggestion) {
    isUserTyping.current = false;
    setQuery(suggestion.locality);
    onChange(suggestion.locality);
    onCoords?.(suggestion.latitude, suggestion.longitude);
    setSuggestions([]);
    setShowDropdown(false);
    setEditing(false);
  }

  async function handleDetect() {
    setDetecting(true);
    try {
      const result: LocationResult = await detectLocation();
      if (result.locality) {
        setQuery(result.locality);
        onChange(result.locality);
        setEditing(false);
      }
      onCoords?.(result.latitude, result.longitude);
    } catch {
      // User can type manually
    } finally {
      setDetecting(false);
    }
  }

  // Display mode — show saved locality with edit affordance
  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="flex h-9 cursor-pointer items-center rounded-md border border-input bg-white px-3"
      >
        <MapPin className="mr-2 size-3.5 shrink-0 text-primary" />
        <span className="flex-1 truncate text-[13px] text-foreground">
          {value}
        </span>
        <EditIcon className="size-3.5 shrink-0 text-slate-400" />
      </div>
    );
  }

  // Edit mode — full autocomplete input
  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="bg-white pr-9 text-[13px]"
      />
      <button
        type="button"
        onClick={handleDetect}
        disabled={detecting}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {detecting || searching ? (
          <Loader2 className="size-4 animate-spin text-slate-400" />
        ) : (
          <LocateFixed className="size-4 text-primary" />
        )}
      </button>
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className="flex w-full items-start gap-2 border-b border-slate-50 px-3 py-2.5 text-left last:border-b-0 hover:bg-slate-50"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-foreground">
                  {s.locality}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {s.displayName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
