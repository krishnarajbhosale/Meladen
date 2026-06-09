import { API_BASE_URL, authHeaders, fetchJson, formatHttpError } from './client';

export interface CelebPhotoApi {
  id: number;
  sectionName: string;
  sortOrder: number;
  imageUrl: string;
}

export function celebPhotoImageSrc(photo: CelebPhotoApi): string {
  if (!photo.imageUrl) return '';
  if (photo.imageUrl.startsWith('http') || photo.imageUrl.startsWith('/assets')) {
    return photo.imageUrl;
  }
  return `${API_BASE_URL}${photo.imageUrl}`;
}

export async function fetchPublicCelebPhotos(): Promise<CelebPhotoApi[]> {
  return fetchJson<CelebPhotoApi[]>('/api/public/celeb-photos');
}

export async function adminListCelebPhotos(token: string): Promise<CelebPhotoApi[]> {
  return fetchJson<CelebPhotoApi[]>('/api/admin/celeb-photos', {
    headers: authHeaders(token),
  });
}

export async function adminCreateCelebPhoto(
  token: string,
  sectionName: string,
  sortOrder: number,
  image: File,
): Promise<CelebPhotoApi> {
  const form = new FormData();
  form.append('sectionName', sectionName.trim());
  form.append('sortOrder', String(sortOrder));
  form.append('image', image);
  const res = await fetch(`${API_BASE_URL}/api/admin/celeb-photos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatHttpError(res.status, text, 'Upload failed'));
  }
  return res.json() as Promise<CelebPhotoApi>;
}

export async function adminDeleteCelebPhoto(token: string, id: number): Promise<void> {
  await fetchJson(`/api/admin/celeb-photos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function adminReplaceCelebPhoto(token: string, id: number, image: File): Promise<CelebPhotoApi> {
  const form = new FormData();
  form.append('image', image);
  const res = await fetch(`${API_BASE_URL}/api/admin/celeb-photos/${id}/image`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatHttpError(res.status, text, 'Photo replace failed'));
  }
  return res.json() as Promise<CelebPhotoApi>;
}
