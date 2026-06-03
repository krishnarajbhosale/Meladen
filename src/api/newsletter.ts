import { fetchJson, authHeaders } from './client';

export type NewsletterSubscriberRow = {
  id: number;
  email: string;
  createdAt: string | null;
};

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  return fetchJson('/api/public/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function adminListNewsletterSubscribers(token: string): Promise<NewsletterSubscriberRow[]> {
  return fetchJson<NewsletterSubscriberRow[]>('/api/admin/newsletter-subscribers', {
    headers: authHeaders(token),
  });
}

export async function adminDeleteNewsletterSubscriber(token: string, id: number): Promise<void> {
  await fetchJson(`/api/admin/newsletter-subscribers/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}
