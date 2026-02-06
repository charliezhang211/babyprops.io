// BabyProps.io Author Configuration
// Author profiles for blog posts

export const authors = {
  'tira-chan': {
    name: 'Tira Chan',
    avatar: '/images/author-tira.webp',
    bio: 'Founder of Dvotinst with 8+ years of experience in newborn photography props. Passionate about helping photographers capture perfect moments.',
    social: {
      instagram: 'https://instagram.com/dvotinst',
      pinterest: 'https://pinterest.com/dvotinst',
    },
  },
} as const;

export type AuthorId = keyof typeof authors;
