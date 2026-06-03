import { API_BASE_URL, authHeaders, fetchJson } from './client';

export interface CustomerReviewApi {
  id: number;
  reviewerName: string;
  reviewText: string;
  sortOrder: number;
  approved: boolean;
  createdAt: string | null;
  photoUrl: string;
}

export function customerReviewPhotoSrc(review: CustomerReviewApi): string {
  if (!review.photoUrl) return '';
  if (review.photoUrl.startsWith('http') || review.photoUrl.startsWith('/assets')) {
    return review.photoUrl;
  }
  return `${API_BASE_URL}${review.photoUrl}`;
}

export async function fetchPublicCustomerReviews(): Promise<CustomerReviewApi[]> {
  return fetchJson<CustomerReviewApi[]>('/api/public/customer-reviews');
}

export async function adminListCustomerReviews(token: string): Promise<CustomerReviewApi[]> {
  return fetchJson<CustomerReviewApi[]>('/api/admin/customer-reviews', {
    headers: authHeaders(token),
  });
}

export async function adminCreateCustomerReview(
  token: string,
  reviewerName: string,
  reviewText: string,
  sortOrder: number,
  photo: File,
  approved = true,
): Promise<CustomerReviewApi> {
  const form = new FormData();
  form.append('reviewerName', reviewerName.trim());
  form.append('reviewText', reviewText.trim());
  form.append('sortOrder', String(sortOrder));
  form.append('approved', String(approved));
  form.append('photo', photo);
  const res = await fetch(`${API_BASE_URL}/api/admin/customer-reviews`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  return res.json() as Promise<CustomerReviewApi>;
}

export async function adminApproveCustomerReview(
  token: string,
  id: number,
): Promise<CustomerReviewApi> {
  return fetchJson<CustomerReviewApi>(`/api/admin/customer-reviews/${id}/approve`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
}

export async function adminDeleteCustomerReview(token: string, id: number): Promise<void> {
  await fetchJson(`/api/admin/customer-reviews/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}
