const DEFAULT_PUBLIC_ORIGIN = 'https://cana.im';

/** Build a canonical public URL without depending on a trailing slash in env. */
export function buildPublicUrl(
  pathname: string,
  searchParams?: Record<string, string>,
): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_PUBLIC_ORIGIN;
  const origin = configuredOrigin.replace(/\/+$/, '');
  const url = new URL(pathname.startsWith('/') ? pathname : `/${pathname}`, `${origin}/`);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}
