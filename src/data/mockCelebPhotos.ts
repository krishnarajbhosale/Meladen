import celeb1 from '../assets/1.jpeg';
import celeb2 from '../assets/3.jpeg';
import celeb3 from '../assets/4.jpeg';
import celeb4 from '../assets/5.jpeg';

export type CelebPhotoDisplay = {
  id: number | string;
  sectionName: string;
  personName: string | null;
  personPosition: string | null;
  sortOrder: number;
  imageUrl: string;
};

export type CelebPhotoSectionGroup = {
  sectionName: string;
  photos: CelebPhotoDisplay[];
};

/** Preview uses one section so the homepage shows a single slider (not duplicate blocks). */
export const MOCK_CELEB_PHOTOS: CelebPhotoDisplay[] = [
  { id: 'mock-1', sectionName: 'Gallery', personName: null, personPosition: null, sortOrder: 0, imageUrl: celeb1 },
  { id: 'mock-2', sectionName: 'Gallery', personName: null, personPosition: null, sortOrder: 1, imageUrl: celeb2 },
  { id: 'mock-3', sectionName: 'Gallery', personName: null, personPosition: null, sortOrder: 2, imageUrl: celeb3 },
  { id: 'mock-4', sectionName: 'Gallery', personName: null, personPosition: null, sortOrder: 3, imageUrl: celeb4 },
  { id: 'mock-5', sectionName: 'Gallery', personName: null, personPosition: null, sortOrder: 4, imageUrl: celeb1 },
];

export function groupCelebPhotos(items: CelebPhotoDisplay[]): CelebPhotoSectionGroup[] {
  const bySection = new Map<string, CelebPhotoDisplay[]>();
  for (const item of items) {
    const key = item.sectionName.trim();
    if (!key) continue;
    const list = bySection.get(key) ?? [];
    list.push(item);
    bySection.set(key, list);
  }
  return Array.from(bySection.entries()).map(([sectionName, photos]) => ({
    sectionName,
    photos: [...photos].sort((a, b) => a.sortOrder - b.sortOrder || String(a.id).localeCompare(String(b.id))),
  }));
}
