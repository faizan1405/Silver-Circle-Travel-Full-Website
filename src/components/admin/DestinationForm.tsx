import { FormEvent, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageOff, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { DESTINATION_CATEGORIES, SLUG_PATTERN, TRAVEL_STYLES, discountPercent, formatINR, slugify, type Destination } from "@/lib/destinations";
import { refreshAfterChange } from "@/lib/admin-queries";
import { FieldError, Panel, btnOutline, btnPrimary, inputCls, labelCls } from "./ui";

type Errors = Partial<Record<"image_url" | "title" | "description" | "original_price" | "discounted_price" | "slug" | "category", string>>;

const lines = (value: string) => value.split("\n").map((l) => l.trim()).filter(Boolean);

function isValidImageUrl(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function DestinationForm({ initial }: { initial?: Destination }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "ok" | "error">(initial?.image_url ? "loading" : "idle");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Europe");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [originalPrice, setOriginalPrice] = useState(initial ? String(initial.original_price) : "");
  const [discountedPrice, setDiscountedPrice] = useState(initial?.discounted_price != null ? String(initial.discounted_price) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join("\n"));
  const [inclusions, setInclusions] = useState((initial?.inclusions ?? []).join("\n"));
  const [styles, setStyles] = useState<string[]>(initial?.travel_styles ?? []);
  const [bestTime, setBestTime] = useState(initial?.best_time ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const categories = DESTINATION_CATEGORIES.includes(category as (typeof DESTINATION_CATEGORIES)[number])
    ? DESTINATION_CATEGORIES
    : [...DESTINATION_CATEGORIES, category];

  const onTitle = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const onImageUrl = (value: string) => {
    setImageUrl(value);
    const v = value.trim();
    setImageStatus(v && isValidImageUrl(v) ? "loading" : v ? "error" : "idle");
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const img = imageUrl.trim();
    if (!img) e.image_url = "Image URL is required.";
    else if (!isValidImageUrl(img)) e.image_url = "Please enter a valid image URL (starting with https://).";
    else if (imageStatus === "error") e.image_url = "This image could not be loaded. Please check the URL.";
    else if (imageStatus === "loading") e.image_url = "The image is still loading. Please wait a moment.";
    if (!title.trim()) e.title = "Title cannot be empty.";
    if (!description.trim()) e.description = "Description cannot be empty.";
    if (!category.trim()) e.category = "Please choose a category.";
    const op = Number(originalPrice);
    if (!originalPrice.trim() || !Number.isFinite(op) || op < 0 || !Number.isInteger(op)) e.original_price = "Enter a valid price in whole rupees.";
    if (discountedPrice.trim()) {
      const dp = Number(discountedPrice);
      if (!Number.isFinite(dp) || dp < 0 || !Number.isInteger(dp)) e.discounted_price = "Enter a valid price in whole rupees.";
      else if (!e.original_price && dp > op) e.discounted_price = "Discounted price cannot be greater than the original price.";
    }
    if (!slug) e.slug = "Slug is required.";
    else if (!SLUG_PATTERN.test(slug)) e.slug = "Use lowercase letters, numbers and single hyphens only.";
    return e;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const { data: clash, error: clashError } = await supabase.from("destinations").select("id").eq("slug", slug).maybeSingle();
      if (clashError) throw clashError;
      if (clash && clash.id !== initial?.id) {
        setErrors({ slug: "This slug is already used by another destination." });
        toast.error("This slug is already in use.");
        return;
      }
      const payload = {
        image_url: imageUrl.trim(),
        title: title.trim(),
        location: location.trim(),
        country: country.trim(),
        category: category.trim(),
        duration: duration.trim(),
        original_price: Number(originalPrice),
        discounted_price: discountedPrice.trim() ? Number(discountedPrice) : null,
        description: description.trim(),
        is_featured: isFeatured,
        is_active: isActive,
        slug,
        highlights: lines(highlights),
        inclusions: lines(inclusions),
        travel_styles: styles,
        best_time: bestTime.trim(),
      };
      const { error } = initial
        ? await supabase.from("destinations").update(payload).eq("id", initial.id)
        : await supabase.from("destinations").insert(payload);
      if (error) {
        if (error.code === "23505") {
          setErrors({ slug: "This slug is already used by another destination." });
          toast.error("This slug is already in use.");
          return;
        }
        throw error;
      }
      refreshAfterChange(queryClient);
      toast.success(initial ? "Destination updated successfully." : "Destination created successfully.");
      navigate({ to: "/admin/destinations" });
    } catch (err) {
      console.error(err);
      toast.error("Unable to save destination.");
    } finally {
      setSaving(false);
    }
  };

  const discount = discountPercent({ original_price: Number(originalPrice) || 0, discounted_price: discountedPrice ? Number(discountedPrice) : null });

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="min-w-0 space-y-6">
        <Panel className="p-5 sm:p-6">
          <h2 className="text-2xl">Destination image</h2>
          <label className="mt-4 block">
            <span className={labelCls}>Image URL *</span>
            <input value={imageUrl} onChange={(e) => onImageUrl(e.target.value)} placeholder="https://images.example.com/switzerland.jpg" className={inputCls} />
            <FieldError message={errors.image_url} />
          </label>
          <div className="mt-4 overflow-hidden rounded-xl border border-dashed border-border bg-secondary/40">
            {imageUrl.trim() && isValidImageUrl(imageUrl.trim()) ? (
              <div className="relative aspect-[16/9]">
                <img
                  key={imageUrl.trim()}
                  src={imageUrl.trim()}
                  alt="Destination preview"
                  className={`h-full w-full object-cover transition-opacity duration-500 ${imageStatus === "ok" ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImageStatus("ok")}
                  onError={() => setImageStatus("error")}
                />
                {imageStatus === "loading" ? <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Loading preview…</div> : null}
                {imageStatus === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-destructive"><ImageOff className="h-6 w-6" /> Image could not be loaded</div>
                ) : null}
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center text-sm text-muted-foreground">Image preview appears here</div>
            )}
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <h2 className="text-2xl">Details</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className={labelCls}>Title *</span>
              <input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Switzerland" className={inputCls} maxLength={150} />
              <FieldError message={errors.title} />
            </label>
            <label className="block">
              <span className={labelCls}>Location</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zurich, Switzerland" className={inputCls} maxLength={200} />
            </label>
            <label className="block">
              <span className={labelCls}>Country</span>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Switzerland" className={inputCls} maxLength={120} />
            </label>
            <label className="block">
              <span className={labelCls}>Category *</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <FieldError message={errors.category} />
            </label>
            <label className="block">
              <span className={labelCls}>Duration</span>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="8N / 9D" className={inputCls} maxLength={60} />
            </label>
            <label className="block">
              <span className={labelCls}>Original price (₹) *</span>
              <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="350000" className={inputCls} />
              {originalPrice ? <p className="mt-1 text-sm text-muted-foreground">{formatINR(Number(originalPrice))}</p> : null}
              <FieldError message={errors.original_price} />
            </label>
            <label className="block">
              <span className={labelCls}>Discounted price (₹)</span>
              <input value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="299999" className={inputCls} />
              {discountedPrice ? <p className="mt-1 text-sm text-muted-foreground">{formatINR(Number(discountedPrice))}{discount > 0 ? ` · ${discount}% off` : ""}</p> : null}
              <FieldError message={errors.discounted_price} />
            </label>
            <label className="block md:col-span-2">
              <span className={labelCls}>Description *</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} maxLength={5000} placeholder="Describe the journey…" className={`${inputCls} resize-y`} />
              <FieldError message={errors.description} />
            </label>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <h2 className="text-2xl">Journey extras</h2>
          <p className="mt-1 text-sm text-muted-foreground">Optional. Shown on the destination page.</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Highlights (one per line)</span>
              <textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={5} className={`${inputCls} resize-y`} />
            </label>
            <label className="block">
              <span className={labelCls}>Inclusions (one per line)</span>
              <textarea value={inclusions} onChange={(e) => setInclusions(e.target.value)} rows={5} className={`${inputCls} resize-y`} />
            </label>
            <label className="block">
              <span className={labelCls}>Best time to visit</span>
              <input value={bestTime} onChange={(e) => setBestTime(e.target.value)} placeholder="April – September" className={inputCls} maxLength={120} />
            </label>
            <fieldset>
              <legend className={labelCls}>Travel styles</legend>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map((s) => {
                  const on = styles.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setStyles((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))}
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors duration-300 ${on ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy-deep hover:bg-secondary"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </Panel>
      </div>

      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Panel className="space-y-5 p-5 sm:p-6">
          <h2 className="text-2xl">Visibility</h2>
          <label className="flex items-center justify-between gap-4">
            <span><span className="block font-semibold text-navy-deep">Active</span><span className="text-sm text-muted-foreground">Visible on the public website</span></span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span><span className="block font-semibold text-navy-deep">Featured</span><span className="text-sm text-muted-foreground">Shown in featured sections</span></span>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </label>
        </Panel>
        <Panel className="p-5 sm:p-6">
          <h2 className="text-2xl">Slug</h2>
          <label className="mt-4 block">
            <span className={labelCls}>URL slug *</span>
            <input
              value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value) || e.target.value.toLowerCase()); }}
              className={inputCls}
            />
            <FieldError message={errors.slug} />
          </label>
          <p className="mt-2 break-all text-sm text-muted-foreground">/destinations/{slug || "…"}</p>
          {initial && slug !== initial.slug ? <p className="mt-2 text-sm text-terracotta">Changing the slug changes this destination's public web address.</p> : null}
          <button type="button" onClick={() => { setSlug(slugify(title)); setSlugTouched(!initial ? false : true); }} className={`${btnOutline} mt-3 !px-4 !py-2`}>
            <RefreshCw className="h-4 w-4" /> Generate from title
          </button>
        </Panel>
        <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
          <button type="submit" disabled={saving} className={`${btnPrimary} !py-3 sm:flex-1`}>{saving ? "Saving…" : "Save Destination"}</button>
          <Link to="/admin/destinations" className={`${btnOutline} !py-3 sm:flex-1`}>Cancel</Link>
        </div>
      </div>
    </form>
  );
}
