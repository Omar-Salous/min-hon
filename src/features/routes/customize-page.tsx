"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { BrandImage } from "@/components/ui/brand-image";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { defaultProductId, products, productsById } from "@/features/commerce/commerce-data";
import {
  ALLOWED_CUSTOMIZATION_IMAGE_TYPES,
  DEFAULT_CUSTOMIZATION_UPLOAD_MAX_FILE_SIZE,
  formatUploadSizeLabel,
} from "@/features/commerce/customization-upload";
import { useCommerce } from "@/features/commerce/commerce-provider";
import { formatPrice, productSupportsSize } from "@/features/commerce/commerce-utils";
import type {
  ProductColor,
  ProductId,
  ProductSize,
} from "@/features/commerce/commerce-types";

const guidanceSteps = [
  {
    title: "Choose the base piece",
    text: "Start with the format that fits the story: wearable, practical, giftable, or display-worthy.",
  },
  {
    title: "Shape the message",
    text: "Add a name, phrase, or short sentence that gives the design emotional meaning.",
  },
  {
    title: "Review before cart",
    text: "Use the preview to confirm tone, balance, and product details before you continue.",
  },
];

const builderGallery = [defaultProductId, "hoodie", "cap"] as const;

export function CustomizePage() {
  const router = useRouter();
  const { addToCart, sessionId } = useCommerce();
  const [selectedProductId, setSelectedProductId] = useState<ProductId>(defaultProductId);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    productsById[defaultProductId].colors[0],
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize | "">(
    productsById[defaultProductId].sizes?.[1] ?? productsById[defaultProductId].sizes?.[0] ?? "",
  );
  const [customTitle, setCustomTitle] = useState("");
  const [customStory, setCustomStory] = useState("");
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string>();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>();
  const [uploadedImageStorageKey, setUploadedImageStorageKey] = useState<string>();
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedProduct = productsById[selectedProductId];

  const previewImage = uploadedPreviewUrl ?? uploadedImageUrl ?? selectedProduct.image.src;
  const previewAlt = uploadedPreviewUrl || uploadedImageUrl
    ? `${selectedProduct.name} custom upload preview`
    : selectedProduct.image.alt;
  const requiresSize = productSupportsSize(selectedProduct);

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
    };
  }, [uploadedPreviewUrl]);

  const handleProductSelect = (productId: ProductId) => {
    const nextProduct = productsById[productId];
    const nextColor = nextProduct.colors.includes(selectedColor)
      ? selectedColor
      : nextProduct.colors[0];
    const nextSize = productSupportsSize(nextProduct)
      ? nextProduct.sizes?.includes(selectedSize as ProductSize)
        ? selectedSize
        : (nextProduct.sizes?.[1] ?? nextProduct.sizes?.[0] ?? "")
      : "";

    setSelectedProductId(productId);
    setSelectedColor(nextColor);
    setSelectedSize(nextSize);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
      setUploadedPreviewUrl(undefined);
      setUploadedImageUrl(undefined);
      setUploadedImageStorageKey(undefined);
      setUploadedFileName("");
      setUploadMessage("");
      return;
    }

    if (!ALLOWED_CUSTOMIZATION_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_CUSTOMIZATION_IMAGE_TYPES)[number])) {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
      setUploadedPreviewUrl(undefined);
      setUploadedImageUrl(undefined);
      setUploadedImageStorageKey(undefined);
      setUploadedFileName("");
      setUploadMessage("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > DEFAULT_CUSTOMIZATION_UPLOAD_MAX_FILE_SIZE) {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
      setUploadedPreviewUrl(undefined);
      setUploadedImageUrl(undefined);
      setUploadedImageStorageKey(undefined);
      setUploadedFileName("");
      setUploadMessage(`Please choose an image smaller than ${formatUploadSizeLabel(DEFAULT_CUSTOMIZATION_UPLOAD_MAX_FILE_SIZE)}.`);
      return;
    }

    if (!sessionId) {
      setUploadMessage("Preparing your session. Please try the upload again in a moment.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }

    setUploadedPreviewUrl(nextPreviewUrl);
    setUploadedFileName(file.name);
    setUploadedImageUrl(undefined);
    setUploadedImageStorageKey(undefined);
    setUploadMessage("Uploading artwork securely. Your local preview is ready already.");
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("file", file);

      const response = await fetch("/api/uploads/customization-image", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            uploadedImage?: {
              url: string;
              storageKey: string;
              fileName: string;
            };
          }
        | null;

      if (!response.ok || !payload?.uploadedImage) {
        throw new Error(payload?.error ?? "The artwork upload did not finish successfully.");
      }

      setUploadedImageUrl(payload.uploadedImage.url);
      setUploadedImageStorageKey(payload.uploadedImage.storageKey);
      setUploadMessage("Artwork uploaded successfully. It will stay attached to this customization request.");
    } catch (error) {
      setUploadedImageUrl(undefined);
      setUploadedImageStorageKey(undefined);
      setUploadMessage(
        error instanceof Error
          ? `${error.message} The preview is still visible, but the image will not be saved until upload succeeds.`
          : "The artwork upload failed. The preview is still visible, but the image will not be saved until upload succeeds.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveUpload = () => {
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }
    setUploadedPreviewUrl(undefined);
    setUploadedImageUrl(undefined);
    setUploadedImageStorageKey(undefined);
    setUploadedFileName("");
    setUploadMessage("Artwork removed. The preview is showing the product image again.");
    setIsUploadingImage(false);
  };

  const handleAddToCart = async () => {
    const trimmedTitle = customTitle.trim();
    const trimmedStory = customStory.trim();

    if (!trimmedTitle) {
      setErrorMessage("Add a custom title or name so the piece feels personal before it goes to cart.");
      setSuccessMessage("");
      return;
    }

    if (requiresSize && !selectedSize) {
      setErrorMessage("Choose a size for this product before adding it to cart.");
      setSuccessMessage("");
      return;
    }

    if (isUploadingImage) {
      setErrorMessage("Please wait for the artwork upload to finish before adding this piece to cart.");
      setSuccessMessage("");
      return;
    }

    if (uploadedFileName && !uploadedImageUrl) {
      setErrorMessage("Your artwork preview is visible, but the upload has not been saved yet. Please retry the upload or remove it before continuing.");
      setSuccessMessage("");
      return;
    }

    await addToCart({
      productId: selectedProduct.id,
      color: selectedColor,
      size: selectedSize || undefined,
      quantity: 1,
      customTitle: trimmedTitle,
      customStory: trimmedStory,
      uploadedImageUrl,
      uploadedImageName: uploadedFileName || undefined,
      uploadedImageStorageKey,
    });

    setErrorMessage("");
    setSuccessMessage(
      `${selectedProduct.name} added to cart with ${trimmedTitle}${trimmedStory ? " and your story note" : ""}.`,
    );
  };

  return (
    <>
      <CustomizeHero
        selectedProduct={selectedProduct}
        customTitle={customTitle}
        customStory={customStory}
        onAddToCart={handleAddToCart}
      />
      <BuilderSection
        selectedProduct={selectedProduct}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        customTitle={customTitle}
        customStory={customStory}
        previewImage={previewImage}
        previewAlt={previewAlt}
        uploadedFileName={uploadedFileName}
        uploadedImageUrl={uploadedImageUrl}
        isUploadingImage={isUploadingImage}
        uploadMessage={uploadMessage}
        successMessage={successMessage}
        errorMessage={errorMessage}
        onProductSelect={handleProductSelect}
        onColorSelect={setSelectedColor}
        onSizeSelect={setSelectedSize}
        onTitleChange={setCustomTitle}
        onStoryChange={setCustomStory}
        onImageUpload={handleImageUpload}
        onRemoveUpload={handleRemoveUpload}
        onAddToCart={handleAddToCart}
        onGoToCart={() => router.push("/cart")}
      />
      <GuidanceSection />
      <CustomizeCtaSection />
    </>
  );
}

function CustomizeHero({
  selectedProduct,
  customTitle,
  customStory,
  onAddToCart,
}: {
  selectedProduct: (typeof products)[number];
  customTitle: string;
  customStory: string;
  onAddToCart: () => Promise<void>;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(184,134,80,0.10),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(77,107,74,0.12),_transparent_30%)]" />
      <Container className="relative grid gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">
            <span>Customize</span>
            <span className="h-1 w-1 rounded-full bg-[var(--highlight)]" />
            <span dir="rtl" lang="ar">
              {"\u0627\u0644\u062a\u062e\u0635\u064a\u0635"}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Create a piece that begins with your story and ends as something worth keeping.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              This is the heart of MIN HON: a calm, guided space where product choice, color, language, memory, and personal meaning come together in one thoughtful piece.
            </p>
            <p
              className="max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-7"
              dir="rtl"
              lang="ar"
            >
              {"\u0647\u0646\u0627 \u062a\u0628\u062f\u0623 \u0627\u0644\u0642\u0635\u0629: \u0627\u062e\u062a\u0631 \u0627\u0644\u0642\u0637\u0639\u0629\u060c \u0623\u0636\u0641 \u0627\u0644\u0643\u0644\u0645\u0629 \u0623\u0648 \u0627\u0644\u0630\u0643\u0631\u0649\u060c \u062b\u0645 \u0634\u0627\u0647\u062f \u0643\u064a\u0641 \u062a\u0635\u0628\u062d \u0645\u0646\u062a\u062c\u0627\u064b \u064a\u0634\u0628\u0647\u0643."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void onAddToCart()}>Add Current Setup to Cart</Button>
            <ButtonLink href="/explore" variant="secondary">
              Start from Designed Products
            </ButtonLink>
          </div>
        </div>

        <Card className="overflow-hidden bg-[linear-gradient(160deg,#fbf4e8_0%,#eee2cf_100%)] p-0">
          <div className="grid min-h-[380px] gap-4 p-5 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <PreviewMiniCard title="Product" text={`${selectedProduct.name} / ${selectedProduct.subtitle.toLowerCase()}`} />
              <PreviewMiniCard title="Story" text={customTitle.trim() || "Add a name, title, or dedication"} />
              <PreviewMiniCard
                title="Meaning"
                text={customStory.trim() || "Shape the story with a sentence, note, or memory"}
              />
            </div>

            <BrandImage
              src={selectedProduct.image.src}
              alt={selectedProduct.image.alt}
              className="min-h-[280px] rounded-[1.9rem] border border-[var(--border)]"
              priority
              sizes="(max-width: 640px) 100vw, 42vw"
              contentClassName="p-5"
              content={
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                    Live preview focus
                  </p>
                  <div className="max-w-[15rem] rounded-[1.3rem] border border-white/20 bg-[rgba(255,250,242,0.18)] px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/75">Preview</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedProduct.name}</p>
                    <p className="mt-2 text-sm text-white/82">
                      {customTitle.trim() || "Your custom title will appear here."}
                    </p>
                  </div>
                </div>
              }
            />
          </div>
        </Card>
      </Container>
    </section>
  );
}

function BuilderSection({
  selectedProduct,
  selectedColor,
  selectedSize,
  customTitle,
  customStory,
  previewImage,
  previewAlt,
  uploadedFileName,
  uploadedImageUrl,
  isUploadingImage,
  uploadMessage,
  successMessage,
  errorMessage,
  onProductSelect,
  onColorSelect,
  onSizeSelect,
  onTitleChange,
  onStoryChange,
  onImageUpload,
  onRemoveUpload,
  onAddToCart,
  onGoToCart,
}: {
  selectedProduct: (typeof products)[number];
  selectedColor: ProductColor;
  selectedSize: ProductSize | "";
  customTitle: string;
  customStory: string;
  previewImage: string;
  previewAlt: string;
  uploadedFileName: string;
  uploadedImageUrl?: string;
  isUploadingImage: boolean;
  uploadMessage: string;
  successMessage: string;
  errorMessage: string;
  onProductSelect: (value: ProductId) => void;
  onColorSelect: (value: ProductColor) => void;
  onSizeSelect: (value: ProductSize | "") => void;
  onTitleChange: (value: string) => void;
  onStoryChange: (value: string) => void;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveUpload: () => void;
  onAddToCart: () => Promise<void>;
  onGoToCart: () => void;
}) {
  const requiresSize = productSupportsSize(selectedProduct);

  return (
    <section className="py-12 sm:py-16">
      <Container className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <BuilderPanel
            eyebrow="Step 1"
            title="Choose your product"
            description="Begin with the object that best carries your story."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <SelectableCard
                  key={product.id}
                  title={product.name}
                  description={product.description}
                  price={formatPrice(product.price)}
                  active={selectedProduct.id === product.id}
                  image={product.image}
                  onClick={() => onProductSelect(product.id)}
                />
              ))}
            </div>
          </BuilderPanel>

          <BuilderPanel
            eyebrow="Step 2"
            title="Set color and size"
            description="Keep these choices calm and intentional so the message remains central."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold">Color</p>
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-pressed={selectedColor === color}
                      className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm transition ${
                        selectedColor === color
                          ? "border-[var(--accent)] bg-[linear-gradient(180deg,rgba(77,107,74,0.12),rgba(255,250,242,1))] text-[var(--accent-deep)] shadow-[0_12px_24px_rgba(50,73,48,0.12)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:bg-[var(--background)]"
                      }`}
                      onClick={() => onColorSelect(color)}
                    >
                      <ColorSwatch color={color} active={selectedColor === color} />
                      {color}
                      {selectedColor === color ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          Selected
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Size</p>
                {requiresSize ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes?.map((size) => (
                        <button
                          key={size}
                          type="button"
                          aria-pressed={selectedSize === size}
                          className={`min-w-12 rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selectedSize === size
                              ? "border-[var(--accent)] bg-[linear-gradient(180deg,var(--accent)_0%,var(--accent-deep)_100%)] text-white shadow-[0_12px_24px_rgba(50,73,48,0.22)]"
                              : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:bg-[var(--background)]"
                          }`}
                          onClick={() => onSizeSelect(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs leading-6 text-[var(--muted)]">
                      Sizes are shown only where they matter, like apparel and hoodies.
                    </p>
                  </>
                ) : (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
                    This product keeps sizing simple, so no size selection is needed here.
                  </div>
                )}
              </div>
            </div>
          </BuilderPanel>

          <BuilderPanel
            eyebrow="Step 3"
            title="Add the message or memory"
            description="This is where the product becomes personal."
          >
            <div className="space-y-4">
              <FormField label="Custom title or name">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(event) => onTitleChange(event.target.value)}
                  placeholder="Nour, Start Your Story, A gift for home..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                />
                <p className="text-xs leading-6 text-[var(--muted)]">
                  This appears in the preview and cart, so it helps to keep it short and meaningful.
                </p>
              </FormField>

              <FormField label="Story, sentence, or description">
                <textarea
                  value={customStory}
                  onChange={(event) => onStoryChange(event.target.value)}
                  placeholder="Write a sentence, a note, or a short memory to shape the piece."
                  rows={5}
                  className="w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 outline-none"
                />
                <p className="text-xs leading-6 text-[var(--muted)]">
                  Optional, but useful when you want the gift, phrase, or memory to feel more complete.
                </p>
              </FormField>
            </div>
          </BuilderPanel>

          <BuilderPanel
            eyebrow="Step 4"
            title="Add optional details"
            description="Use extras only when they deepen the meaning of the piece."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <OptionalFeatureCard
                title="Image Upload"
                description="Upload a reference image, sketch, or artwork to guide the preview and cart item."
              >
                <label className="flex cursor-pointer flex-col gap-3 rounded-[1.3rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)] hover:border-[var(--highlight)] hover:bg-[var(--background)]">
                  <span className="font-medium text-[var(--foreground)]">
                    {isUploadingImage ? "Uploading artwork..." : "Choose image"}
                  </span>
                  <span>
                    {uploadedFileName || `JPG, PNG, or WebP up to ${formatUploadSizeLabel(DEFAULT_CUSTOMIZATION_UPLOAD_MAX_FILE_SIZE)}.`}
                  </span>
                  <span className="text-xs leading-6">
                    If you upload artwork here, it will replace the product image in the live preview and be saved with the customization request.
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
                </label>
                {uploadedFileName ? (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {isUploadingImage ? "Uploading" : uploadedImageUrl ? "Saved" : "Preview only"}
                    </span>
                    <button
                      type="button"
                      className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-deep)]"
                      onClick={onRemoveUpload}
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
                {uploadMessage ? (
                  <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
                    {uploadMessage}
                  </div>
                ) : null}
              </OptionalFeatureCard>

              <OptionalFeatureCard
                title="Story Direction"
                description="A calm guide for the design tone while more advanced production tools come later."
              >
                <div className="rounded-[1.3rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                  Warm / heritage-inspired / minimal
                  <div className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--highlight)]">
                    Extra production tools can be added later with backend support.
                  </div>
                </div>
              </OptionalFeatureCard>
            </div>
          </BuilderPanel>
        </div>

        <div className="space-y-6">
          <PreviewPanel
            selectedProduct={selectedProduct}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            customTitle={customTitle}
            customStory={customStory}
            previewImage={previewImage}
            previewAlt={previewAlt}
            requiresSize={requiresSize}
            successMessage={successMessage}
            errorMessage={errorMessage}
            onAddToCart={onAddToCart}
            onGoToCart={onGoToCart}
          />
          <NextStepsPanel />
        </div>
      </Container>
    </section>
  );
}

function GuidanceSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)] py-12 sm:py-16">
      <Container className="space-y-8">
        <SectionIntro
          eyebrow="How the Builder Works"
          title="A guided creative journey, kept simple."
          description="The page should help users move forward calmly, with enough guidance to feel supported without turning the experience into a technical form."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {guidanceSteps.map((step, index) => (
            <Card key={step.title} className="h-full p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-strong)] text-sm font-semibold">
                0{index + 1}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.text}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CustomizeCtaSection() {
  return (
    <section className="pb-16 pt-6 sm:pb-20">
      <Container>
        <Card className="border-[color:var(--accent)] bg-[linear-gradient(135deg,rgba(77,107,74,0.12),rgba(255,253,248,1)_55%,rgba(184,134,80,0.08))] p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Ready for the Next Step
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Review the piece, add it to cart, and continue with confidence.
              </h2>
              <p className="text-base leading-8 text-[var(--muted)]">
                The flow stays simple: confirm your choices, move to cart, and continue to checkout when the story feels right.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/cart">Open Cart</ButtonLink>
              <ButtonLink href="/checkout" variant="secondary">
                Continue to Checkout
              </ButtonLink>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}

function BuilderPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6 sm:p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">{description}</p>
        </div>
        {children}
      </div>
    </Card>
  );
}

function SelectableCard({
  title,
  description,
  price,
  active,
  image,
  onClick,
}: {
  title: string;
  description: string;
  price: string;
  active?: boolean;
  image: { src: string; alt: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-[1.6rem] border p-4 text-left transition ${
        active
          ? "border-[var(--accent)] bg-[linear-gradient(180deg,rgba(77,107,74,0.12),rgba(255,253,248,1))] shadow-[0_16px_30px_rgba(50,73,48,0.12)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:bg-[var(--background)]"
      }`}
    >
      <BrandImage
        src={image.src}
        alt={image.alt}
        className="aspect-[4/5] rounded-[1.2rem] border border-[var(--border)]"
        sizes="(max-width: 640px) 100vw, 25vw"
        content={
          <div>
            {active ? (
              <span className="mb-3 inline-flex rounded-full border border-white/30 bg-[rgba(255,250,242,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                Selected
              </span>
            ) : null}
            <p className="text-lg font-semibold text-white">{title}</p>
            <p className="mt-2 max-w-[14rem] text-sm leading-6 text-white/82">{description}</p>
            <p className="mt-3 text-sm font-semibold text-white">{price}</p>
          </div>
        }
      />
    </button>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function OptionalFeatureCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--background)] p-5">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function PreviewPanel({
  selectedProduct,
  selectedColor,
  selectedSize,
  customTitle,
  customStory,
  previewImage,
  previewAlt,
  requiresSize,
  successMessage,
  errorMessage,
  onAddToCart,
  onGoToCart,
}: {
  selectedProduct: (typeof products)[number];
  selectedColor: ProductColor;
  selectedSize: ProductSize | "";
  customTitle: string;
  customStory: string;
  previewImage: string;
  previewAlt: string;
  requiresSize: boolean;
  successMessage: string;
  errorMessage: string;
  onAddToCart: () => Promise<void>;
  onGoToCart: () => void;
}) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,#fff9f0_0%,#f1e5d4_100%)] p-0">
      <div className="space-y-6 p-6 sm:p-7">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Live Preview
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            See the product take shape as the story comes together.
          </h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            The preview remains visually important so users always understand what they are creating.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.5)] p-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <BrandImage
              src={previewImage}
              alt={previewAlt}
              className="min-h-[420px] rounded-[1.5rem] border border-[var(--border)]"
              sizes="(max-width: 1024px) 100vw, 35vw"
              contentClassName="p-6"
              content={
                <div className="max-w-[16rem] rounded-[1.4rem] border border-white/20 bg-[rgba(255,250,242,0.18)] px-5 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/75">
                    {selectedProduct.name} Preview
                  </p>
                  <p className="mt-4 text-xl font-semibold text-white">
                    {customTitle.trim() || "Your custom title"}
                  </p>
                  <p className="mt-2 text-sm italic text-white/82">
                    {customStory.trim() || "Your story or sentence will appear here in the final piece."}
                  </p>
                </div>
              }
            />

            <div className="space-y-3">
              <PreviewDetail label="Product" value={selectedProduct.name} />
              <PreviewDetail label="Price" value={formatPrice(selectedProduct.price)} />
              <PreviewDetail label="Color" value={selectedColor} />
              {requiresSize ? <PreviewDetail label="Size" value={selectedSize || "Choose size"} /> : null}
              <PreviewDetail
                label="Artwork"
                value={uploadedArtworkStatus(previewImage, selectedProduct.image.src)}
              />
              <PreviewDetail
                label="Story direction"
                value={customTitle.trim() || customStory.trim() ? "Personalized and ready to review" : "Waiting for your personal message"}
              />
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-[rgba(179,111,83,0.35)] bg-[rgba(255,248,244,0.96)] px-4 py-3 text-sm leading-7 text-[#8a513c]">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-[rgba(77,107,74,0.26)] bg-[rgba(241,248,239,0.96)] px-4 py-3 text-sm leading-7 text-[var(--accent-deep)]">
            {successMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void onAddToCart()}>Add to Cart</Button>
          <Button variant="secondary" onClick={onGoToCart}>
            View Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}

function uploadedArtworkStatus(previewImage: string, productImage: string) {
  return previewImage === productImage ? "Using the product photo" : "Using your uploaded artwork";
}

function PreviewDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7">{value}</p>
    </div>
  );
}

function NextStepsPanel() {
  return (
    <Card className="p-6 sm:p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Next Step Guidance
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            What happens after you finish here?
          </h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            The flow should feel obvious and reassuring, especially for first-time users.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {builderGallery.map((productId) => {
              const product = productsById[productId];
              return (
                <BrandImage
                  key={product.id}
                  src={product.image.src}
                  alt={product.image.alt}
                  className="min-h-[120px] rounded-[1.25rem] border border-[var(--border)]"
                  sizes="(max-width: 640px) 33vw, 10vw"
                />
              );
            })}
          </div>
          <GuidanceRow title="1. Review the preview" text="Make sure the product, color, and message feel balanced." />
          <GuidanceRow title="2. Add it to cart" text="Keep your current setup and continue into the purchase flow." />
          <GuidanceRow title="3. Complete checkout later" text="Move through cart, payment, delivery, and post-purchase with the same calm flow." />
        </div>
      </div>
    </Card>
  );
}

function GuidanceRow({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{text}</p>
    </div>
  );
}

function PreviewMiniCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,255,255,0.48)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7">{text}</p>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="text-base leading-8 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function ColorSwatch({
  color,
  active,
}: {
  color: ProductColor;
  active: boolean;
}) {
  const colorMap: Record<ProductColor, string> = {
    Ivory: "#f6f0e5",
    Clay: "#b36f53",
    Olive: "#5e7250",
    Charcoal: "#3a3937",
  };

  return (
    <span
      className={`h-5 w-5 rounded-full border border-white shadow ring-1 transition ${active ? "scale-110 ring-[var(--accent)]" : "ring-[var(--border-strong)]"}`}
      style={{ backgroundColor: colorMap[color] }}
    />
  );
}
