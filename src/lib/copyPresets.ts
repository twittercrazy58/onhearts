import { THEME_PRESETS } from './themes';

export interface InvitationCopy {
  navStory: string;
  navGallery: string;
  navSchedule: string;
  navGuestbook: string;
  navMemoriesCta: string;
  heroEyebrow: string;
  storyTitle: string;
  storyFallback: string;
  galleryEyebrow: string;
  galleryTitle: string;
  scheduleTitle: string;
  memoriesEyebrow: string;
  memoriesHeading: string;
  memoriesSubtext: string;
  memoriesButton: string;
  guestbookTitle: string;
  wishNamePlaceholder: string;
  wishRelationPlaceholder: string;
  wishMessagePlaceholder: string;
  wishSubmitLabel: string;
}

const COPY_VARIATIONS: Record<keyof typeof THEME_PRESETS, InvitationCopy[]> = {
  champagne: [
    {
      navStory: 'Our Story',
      navGallery: 'Portraits',
      navSchedule: 'Order of Events',
      navGuestbook: 'Wishes',
      navMemoriesCta: 'Memories Gallery',
      heroEyebrow: 'Together With Their Families',
      storyTitle: 'How Forever Began',
      storyFallback:
        'Surrounded by the people who shaped our lives, we joyfully invite you to witness the start of our marriage.',
      galleryEyebrow: 'Before The Vows',
      galleryTitle: 'Engagement & Pre-Wedding Portraits',
      scheduleTitle: 'The Wedding Day Itinerary',
      memoriesEyebrow: 'Shared Through Your Eyes',
      memoriesHeading: 'Capture & Share the Celebration',
      memoriesSubtext:
        'Upload your candid photos from the ceremony and reception into our live wedding album.',
      memoriesButton: 'Enter Live Gallery',
      guestbookTitle: 'Words of Blessing & Love',
      wishNamePlaceholder: 'Your Full Name',
      wishRelationPlaceholder: 'Relation (e.g., Bride’s Sister, Childhood Friend)',
      wishMessagePlaceholder: 'Leave a prayer, toast, or heartfelt note for the couple...',
      wishSubmitLabel: 'Post Blessing',
    },
    {
      navStory: 'The Journey',
      navGallery: 'Gallery',
      navSchedule: 'Schedule',
      navGuestbook: 'Guestbook',
      navMemoriesCta: 'Wedding Photos',
      heroEyebrow: 'Joyfully Invite You To Celebrate',
      storyTitle: 'Two Hearts, One Story',
      storyFallback:
        'Every step, every shared laugh, and every grace has led us to this day. Come celebrate our union with us.',
      galleryEyebrow: 'Captured Moments',
      galleryTitle: 'Pre-Wedding Collection',
      scheduleTitle: 'Celebration Timeline',
      memoriesEyebrow: 'Live Guest Album',
      memoriesHeading: 'Every Smile Counts',
      memoriesSubtext:
        'Snap a photo at your table or on the dance floor and add it directly to our keepsake gallery.',
      memoriesButton: 'Open Photo Wall',
      guestbookTitle: 'Sign Our Keepsake Guestbook',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'How do you know the couple?',
      wishMessagePlaceholder: 'Share your favorite memory or warm wishes...',
      wishSubmitLabel: 'Sign Keepsake Book',
    },
    {
      navStory: 'About Us',
      navGallery: 'Lookbook',
      navSchedule: 'Program',
      navGuestbook: 'Notes',
      navMemoriesCta: 'Live Camera',
      heroEyebrow: 'A Celebration of Covenant & Love',
      storyTitle: 'Written in Grace',
      storyFallback:
        'We are honored to gather our nearest and dearest as we exchange vows and step into a lifetime together.',
      galleryEyebrow: 'Editorial Portraits',
      galleryTitle: 'The Pre-Wedding Series',
      scheduleTitle: 'Day-Of Program',
      memoriesEyebrow: 'Guest Contributions',
      memoriesHeading: 'Relive Every Moment',
      memoriesSubtext:
        'Browse photos shared by fellow guests and upload your own highlights from today.',
      memoriesButton: 'View & Upload Photos',
      guestbookTitle: 'Notes for the Newlyweds',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'Family, Friend, or Colleague',
      wishMessagePlaceholder: 'Write a congratulatory message for the newlyweds...',
      wishSubmitLabel: 'Send Note',
    },
  ],
  rose: [
    {
      navStory: 'Love Note',
      navGallery: 'Portraits',
      navSchedule: 'Moments',
      navGuestbook: 'Wishes',
      navMemoriesCta: 'Photo Album',
      heroEyebrow: 'With Full Hearts, We Invite You',
      storyTitle: 'A Love Worth Celebrating',
      storyFallback:
        'From simple conversations to a lifetime promise, thank you for standing beside us as we say I do.',
      galleryEyebrow: 'Sweet Beginnings',
      galleryTitle: 'Pre-Wedding Moments',
      scheduleTitle: 'Moments of the Day',
      memoriesEyebrow: 'Candid & Unscripted',
      memoriesHeading: 'Share the Love in Pictures',
      memoriesSubtext:
        'Help us preserve every embrace, toast, and joyful tear by uploading your snapshots.',
      memoriesButton: 'Share Your Snapshots',
      guestbookTitle: 'Love Notes & Best Wishes',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'How we met',
      wishMessagePlaceholder: 'Write a sweet note for our new chapter...',
      wishSubmitLabel: 'Send Love Note',
    },
    {
      navStory: 'Our Chapter',
      navGallery: 'Gallery',
      navSchedule: 'Timeline',
      navGuestbook: 'Guestbook',
      navMemoriesCta: 'Memories',
      heroEyebrow: 'Save The Date & Celebrate With Us',
      storyTitle: 'Our Favorite Chapter Yet',
      storyFallback:
        'Life is sweeter together, and our wedding day wouldn’t be complete without the warmth of your presence.',
      galleryEyebrow: 'Portraits of Us',
      galleryTitle: 'Before We Say I Do',
      scheduleTitle: 'Wedding Day Flow',
      memoriesEyebrow: 'Through Your Lens',
      memoriesHeading: 'Be Our Wedding Photographer',
      memoriesSubtext:
        'Upload your favorite candid moments from today straight to our shared wedding album.',
      memoriesButton: 'Go to Live Album',
      guestbookTitle: 'Leave a Wish for the Couple',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'Your connection to the couple',
      wishMessagePlaceholder: 'Share a marriage tip, blessing, or wish...',
      wishSubmitLabel: 'Post Wish',
    },
    {
      navStory: 'Story',
      navGallery: 'Photos',
      navSchedule: 'Events',
      navGuestbook: 'Blessings',
      navMemoriesCta: 'Guest Cam',
      heroEyebrow: 'Forever Starts Here',
      storyTitle: 'Hand in Hand',
      storyFallback:
        'We found home in each other, and we cannot wait to celebrate this joyous milestone with you.',
      galleryEyebrow: 'Timeless Frames',
      galleryTitle: 'Pre-Wedding Gallery',
      scheduleTitle: 'Schedule of Festivities',
      memoriesEyebrow: 'Live Memories',
      memoriesHeading: 'Caught a Candid Moment?',
      memoriesSubtext:
        'Drop your photos into our live celebration gallery so we can cherish them forever.',
      memoriesButton: 'Upload Memories',
      guestbookTitle: 'Messages of Joy',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'Friend or Family',
      wishMessagePlaceholder: 'Write your heartfelt congratulations...',
      wishSubmitLabel: 'Share Message',
    },
  ],
  sage: [
    {
      navStory: 'Roots',
      navGallery: 'Portraits',
      navSchedule: 'Gatherings',
      navGuestbook: 'Guestbook',
      navMemoriesCta: 'Photo Journal',
      heroEyebrow: 'Come Gather & Celebrate With Us',
      storyTitle: 'Growing Together',
      storyFallback:
        'Rooted in friendship, faith, and laughter, we invite you to join us as we begin our marriage.',
      galleryEyebrow: 'Quiet Moments',
      galleryTitle: 'Pre-Wedding Portraits',
      scheduleTitle: 'Order of Gatherings',
      memoriesEyebrow: 'Collective Keepsake',
      memoriesHeading: 'Add to Our Photo Journal',
      memoriesSubtext:
        'Share candid moments from the garden, ceremony, and reception with everyone celebrating today.',
      memoriesButton: 'Open Photo Journal',
      guestbookTitle: 'Blessings for Our Home',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'How do you know us?',
      wishMessagePlaceholder: 'Write a blessing or warm wish for our marriage...',
      wishSubmitLabel: 'Add to Journal',
    },
    {
      navStory: 'Our Story',
      navGallery: 'Gallery',
      navSchedule: 'Schedule',
      navGuestbook: 'Wishes',
      navMemoriesCta: 'Live Gallery',
      heroEyebrow: 'Request The Honor of Your Presence',
      storyTitle: 'A Season of Joy',
      storyFallback:
        'Surrounded by nature and the people we hold dear, we are thrilled to celebrate our wedding day with you.',
      galleryEyebrow: 'In Full Bloom',
      galleryTitle: 'Pre-Wedding Showcase',
      scheduleTitle: 'The Day Ahead',
      memoriesEyebrow: 'Guest Perspectives',
      memoriesHeading: 'Moments Worth Keeping',
      memoriesSubtext:
        'Upload your favorite shots from the celebration and explore photos from fellow guests.',
      memoriesButton: 'Explore Gallery',
      guestbookTitle: 'Words from Our Circle',
      wishNamePlaceholder: 'Your Full Name',
      wishRelationPlaceholder: 'Friend, Cousin, Mentor...',
      wishMessagePlaceholder: 'Leave a thoughtful note for the couple...',
      wishSubmitLabel: 'Submit Wish',
    },
    {
      navStory: 'Journey',
      navGallery: 'Frames',
      navSchedule: 'Itinerary',
      navGuestbook: 'Notes',
      navMemoriesCta: 'Memories',
      heroEyebrow: 'Two Lives, One Path',
      storyTitle: 'How We Got Here',
      storyFallback:
        'Every season has prepared us for this day. Thank you for being part of our story.',
      galleryEyebrow: 'Captured Together',
      galleryTitle: 'Engagement Gallery',
      scheduleTitle: 'Wedding Day Timeline',
      memoriesEyebrow: 'Shared Moments',
      memoriesHeading: 'Contribute to Our Story',
      memoriesSubtext:
        'Snap and upload your favorite moments from today’s celebration.',
      memoriesButton: 'Upload & Browse',
      guestbookTitle: 'Congratulatory Notes',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'Relation to couple',
      wishMessagePlaceholder: 'Share your warm wishes...',
      wishSubmitLabel: 'Post Note',
    },
  ],
  midnight: [
    {
      navStory: 'The Story',
      navGallery: 'Editorial',
      navSchedule: 'Evening',
      navGuestbook: 'Guestbook',
      navMemoriesCta: 'After-Hours Gallery',
      heroEyebrow: 'An Evening of Elegance & Vows',
      storyTitle: 'Under the Stars',
      storyFallback:
        'Join us for an unforgettable celebration of love, music, and lifelong commitment.',
      galleryEyebrow: 'The Preview',
      galleryTitle: 'Pre-Wedding Editorial',
      scheduleTitle: 'Evening Itinerary',
      memoriesEyebrow: 'Live Event Feed',
      memoriesHeading: 'Spotlight the Night',
      memoriesSubtext:
        'Upload your best shots from the ceremony, toasts, and dance floor to our live gallery.',
      memoriesButton: 'Launch Live Gallery',
      guestbookTitle: 'Toasts & Tributes',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'How do you know the couple?',
      wishMessagePlaceholder: 'Raise a virtual toast or leave a tribute...',
      wishSubmitLabel: 'Post Tribute',
    },
    {
      navStory: 'Our Union',
      navGallery: 'Portraits',
      navSchedule: 'Program',
      navGuestbook: 'Wishes',
      navMemoriesCta: 'Live Photos',
      heroEyebrow: 'Cordially Invite You To Their Wedding',
      storyTitle: 'A Timeless Bond',
      storyFallback:
        'With gratitude and joy, we welcome you to share in the celebration of our marriage.',
      galleryEyebrow: 'Signature Portraits',
      galleryTitle: 'Pre-Wedding Collection',
      scheduleTitle: 'Program of Events',
      memoriesEyebrow: 'Captured Live',
      memoriesHeading: 'From Your Table to Our Album',
      memoriesSubtext:
        'Share candid moments from tonight’s celebration and view snapshots from other guests.',
      memoriesButton: 'Open Live Album',
      guestbookTitle: 'Signature Guestbook',
      wishNamePlaceholder: 'Guest Name',
      wishRelationPlaceholder: 'Family or Friend',
      wishMessagePlaceholder: 'Write a memorable message for the couple...',
      wishSubmitLabel: 'Sign Guestbook',
    },
    {
      navStory: 'About',
      navGallery: 'Gallery',
      navSchedule: 'Schedule',
      navGuestbook: 'Notes',
      navMemoriesCta: 'Memories',
      heroEyebrow: 'The Celebration of a Lifetime',
      storyTitle: 'Written Together',
      storyFallback:
        'We cannot wait to dine, dance, and celebrate the start of our marriage with our favorite people.',
      galleryEyebrow: 'The Couple',
      galleryTitle: 'Pre-Wedding Gallery',
      scheduleTitle: 'Celebration Schedule',
      memoriesEyebrow: 'Guest Gallery',
      memoriesHeading: 'Don’t Let a Moment Fade',
      memoriesSubtext:
        'Upload photos directly from your phone into our shared celebration archive.',
      memoriesButton: 'Share Photos',
      guestbookTitle: 'Words for the Couple',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'Your connection',
      wishMessagePlaceholder: 'Leave your congratulations...',
      wishSubmitLabel: 'Send Wishes',
    },
  ],
 emerald: [
    {
      navStory: 'Our Story',
      navGallery: 'Portraits',
      navSchedule: 'Order of Day',
      navGuestbook: 'Blessings',
      navMemoriesCta: 'Live Gallery',
      heroEyebrow: 'Together With Their Families',
      storyTitle: 'A Love Rooted in Grace',
      storyFallback:
        'Surrounded by the people who have shaped our lives, we joyfully celebrate the beginning of our marriage.',
      galleryEyebrow: 'Timeless Elegance',
      galleryTitle: 'Pre-Wedding Portraits',
      scheduleTitle: 'Order of Celebration',
      memoriesEyebrow: 'Live Guest Album',
      memoriesHeading: 'Share Your Favorite Moments',
      memoriesSubtext:
        'Upload photos from your phone straight into our wedding gallery so we can relive every smile.',
      memoriesButton: 'Open Live Gallery',
      guestbookTitle: 'Blessings & Best Wishes',
      wishNamePlaceholder: 'Your Full Name',
      wishRelationPlaceholder: 'Family, Friend, or Colleague',
      wishMessagePlaceholder: 'Share a prayer, blessing, or congratulatory note...',
      wishSubmitLabel: 'Send Your Blessing',
    },
    {
      navStory: 'About Us',
      navGallery: 'Gallery',
      navSchedule: 'Schedule',
      navGuestbook: 'Guestbook',
      navMemoriesCta: 'Wedding Photos',
      heroEyebrow: 'Request the Honor of Your Presence',
      storyTitle: 'Two Hearts, One Journey',
      storyFallback:
        'Thank you for traveling near and far to stand with us as we exchange our vows.',
      galleryEyebrow: 'The Couple',
      galleryTitle: 'Pre-Wedding Collection',
      scheduleTitle: 'Celebration Itinerary',
      memoriesEyebrow: 'Captured Together',
      memoriesHeading: 'Every Angle of Today',
      memoriesSubtext:
        'Post your candid snapshots from the ceremony and reception directly to our shared album.',
      memoriesButton: 'Upload & View Photos',
      guestbookTitle: 'Congratulatory Notes',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'How do you know the couple?',
      wishMessagePlaceholder: 'Write a warm note for the newlyweds...',
      wishSubmitLabel: 'Sign Guestbook',
    },
  ],
  burgundy: [
    {
      navStory: 'Love Story',
      navGallery: 'Portraits',
      navSchedule: 'Program',
      navGuestbook: 'Wishes',
      navMemoriesCta: 'Live Gallery',
      heroEyebrow: 'Joyfully Invite You To Celebrate',
      storyTitle: 'Our Love Story',
      storyFallback:
        'With full hearts, we welcome our closest family and friends to celebrate our union.',
      galleryEyebrow: 'Cherished Moments',
      galleryTitle: 'Pre-Wedding Gallery',
      scheduleTitle: 'Wedding Day Program',
      memoriesEyebrow: 'Live Camera & Album',
      memoriesHeading: 'Capture the Celebration',
      memoriesSubtext:
        'Snap a photo on your phone and add it directly to our wedding album for everyone to enjoy.',
      memoriesButton: 'View Live Gallery',
      guestbookTitle: 'Words of Love & Wishes',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'Bride’s Side or Groom’s Side',
      wishMessagePlaceholder: 'Leave a heartfelt note for the couple...',
      wishSubmitLabel: 'Sign Digital Guestbook',
    },
    {
      navStory: 'Our Journey',
      navGallery: 'Gallery',
      navSchedule: 'Events',
      navGuestbook: 'Notes',
      navMemoriesCta: 'Memories',
      heroEyebrow: 'Together Forever Begins Today',
      storyTitle: 'Written in Love',
      storyFallback:
        'Every chapter led us here—we are honored to celebrate this milestone with you.',
      galleryEyebrow: 'Before the Vows',
      galleryTitle: 'Engagement & Pre-Wedding',
      scheduleTitle: 'Order of Events',
      memoriesEyebrow: 'Shared Memories',
      memoriesHeading: 'From Your Phone to Our Keepsake',
      memoriesSubtext:
        'Upload your favorite moments from the toasts, first dance, and celebration.',
      memoriesButton: 'Open Memories Album',
      guestbookTitle: 'Well Wishes & Toasts',
      wishNamePlaceholder: 'Guest Name',
      wishRelationPlaceholder: 'Your relationship to the couple',
      wishMessagePlaceholder: 'Write your wishes for their marriage...',
      wishSubmitLabel: 'Post Wishes',
    },
  ],
  terracotta: [
    {
      navStory: 'Our Story',
      navGallery: 'Gallery',
      navSchedule: 'Schedule',
      navGuestbook: 'Guestbook',
      navMemoriesCta: 'Live Photos',
      heroEyebrow: 'We Are Tying The Knot',
      storyTitle: 'How Forever Began',
      storyFallback:
        'Come ready to laugh, dine, and dance as we celebrate our marriage surrounded by love.',
      galleryEyebrow: 'Sunlit Memories',
      galleryTitle: 'Pre-Wedding Moments',
      scheduleTitle: 'Celebration Schedule',
      memoriesEyebrow: 'Live Wedding Feed',
      memoriesHeading: 'Share Your Candid Shots',
      memoriesSubtext:
        'Upload the photos you capture today straight into our live celebration gallery.',
      memoriesButton: 'View Live Gallery',
      guestbookTitle: 'Leave a Note for the Couple',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'Friend, Family, or Guest',
      wishMessagePlaceholder: 'Drop a sweet note or piece of marriage advice...',
      wishSubmitLabel: 'Post Congratulatory Note',
    },
    {
      navStory: 'About',
      navGallery: 'Portraits',
      navSchedule: 'Itinerary',
      navGuestbook: 'Wishes',
      navMemoriesCta: 'Live Gallery',
      heroEyebrow: 'Celebrate With Us',
      storyTitle: 'Better Together',
      storyFallback:
        'We are so grateful to have you here celebrating the start of our next big adventure.',
      galleryEyebrow: 'The Preview',
      galleryTitle: 'Pre-Wedding Portraits',
      scheduleTitle: 'The Day’s Lineup',
      memoriesEyebrow: 'Guest Camera',
      memoriesHeading: 'Help Us Capture Every Smile',
      memoriesSubtext:
        'Tap to upload your best photos from today—no app download needed.',
      memoriesButton: 'Share & Browse Photos',
      guestbookTitle: 'Blessings & Notes',
      wishNamePlaceholder: 'Your Name',
      wishRelationPlaceholder: 'How we met',
      wishMessagePlaceholder: 'Write your message for the couple...',
      wishSubmitLabel: 'Send Note',
    },
  ],
};

export function getWeddingCopy(wedding: {
  slug: string;
  theme_preset: keyof typeof THEME_PRESETS;
}): InvitationCopy {
  const pool = COPY_VARIATIONS[wedding.theme_preset] || COPY_VARIATIONS.champagne;
  const hash = Array.from(wedding.slug).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return pool[hash % pool.length];
}