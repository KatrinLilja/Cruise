// Domains that need server-side proxying to bypass hotlink protection
const PROXY_HOSTS = ['assets.dm.rccl.com', 'images.ctfassets.net', 'www.celebritycruises.com', 'www.carnival.com', 'www.ncl.com', 'www.msccruises.com'];

export function getImageSrc(url) {
  if (!url) return '';
  try {
    const { hostname } = new URL(url);
    if (PROXY_HOSTS.includes(hostname)) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // not a valid URL, return as-is
  }
  return url;
}
