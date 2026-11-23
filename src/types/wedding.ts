export type ThemePresetId =
  | 'rosewood-ivory'
  | 'sage-alabaster'
  | 'midnight-velvet'
  | 'champagne-slate';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type PhotoCategory = 'Ceremony' | 'Reception' | 'Candid' | 'Portraits' | 'Dance Floor';

export type RsvpAttendance = 'attending' | 'declined';

export interface WeddingConfig {
  id: number;
  slug: string;
  partner1Name: string;
  partner2Name: string;
  coupleDisplayName: string;
  tagline: string;
  weddingDate: string; // ISO string
  venueCity: string;
  heroImageUrl: string;
  storyTitle: string;
  storyContent: string;
  welcomeNote: string;
  dressCodeSummary: string;
  accommodationNotes: string;
  registryNote: string;
  themePreset: ThemePresetId;
  isActive: boolean;
  isPublished: boolean;
  allowPhotoUploads: boolean;
  requirePhotoApproval: boolean;
  requireGuestbookApproval: boolean;
  allowRsvp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeddingEvent {
  id: number;
  weddingId: number;
  title: string;
  eventType: 'ceremony' | 'cocktail' | 'reception' | 'brunch' | 'other';
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  dressCode: string;
  description: string;
  mapUrl: string;
  sortOrder: number;
}

export interface StoryMilestone {
  id: number;
  weddingId: number;
  dateLabel: string;
  title: string;
  description: string;
  photoUrl: string;
  sortOrder: number;
}

export interface WeddingPhoto {
  id: number;
  weddingId: number;
  guestName: string;
  caption: string;
  category: PhotoCategory;
  imageUrl: string;
  status: ModerationStatus;
  isFeatured: boolean;
  uploadedAt: string;
}

export interface GuestWish {
  id: number;
  weddingId: number;
  guestName: string;
  relationship: string;
  message: string;
  status: ModerationStatus;
  createdAt: string;
}

export interface GuestRsvp {
  id: number;
  weddingId: number;
  guestName: string;
  email: string;
  attendance: RsvpAttendance;
  partySize: number;
  dietaryNotes: string;
  songRequest: string;
  createdAt: string;
}

export interface WeddingBundle {
  wedding: WeddingConfig;
  events: WeddingEvent[];
  milestones: StoryMilestone[];
  photos: WeddingPhoto[];
  wishes: GuestWish[];
  stats: {
    approvedPhotosCount: number;
    approvedWishesCount: number;
    attendingGuestsCount: number;
  };
}

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'couple';
}

export interface AdminDashboardSummary {
  totalWeddings: number;
  activeWeddingId: number | null;
  activeWeddingName: string;
  approvedPhotos: number;
  pendingPhotos: number;
  approvedWishes: number;
  pendingWishes: number;
  confirmedRsvps: number;
  totalAttendingGuests: number;
}
