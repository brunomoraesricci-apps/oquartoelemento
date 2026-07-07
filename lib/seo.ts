import type { Metadata } from "next";

export const SITE_URL = "https://oquartoelemento.com.br";
export const SITE_NAME = "O Quarto Elemento";
export const SITE_TITLE = "O Quarto Elemento | Arquivos Investigativos";
export const SITE_DESCRIPTION =
  "Acesse transmissões, dossiês, relatos e arquivos classificados sobre mistérios brasileiros, OVNIs, lendas, desaparecimentos e casos inexplicáveis.";
export const DEFAULT_OG_IMAGE = "/og-image.png";

type SeoOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  keywords = [],
}: SeoOptions = {}): Metadata {
  const finalTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    metadataBase: new URL(SITE_URL),
    title: finalTitle,
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    keywords: [
      "O Quarto Elemento",
      "arquivos investigativos",
      "mistérios brasileiros",
      "OVNIs",
      "casos inexplicáveis",
      "documentário",
      "dossiês",
      "relatos",
      ...keywords,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: finalTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "pt_BR",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — arquivo investigativo digital`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}
