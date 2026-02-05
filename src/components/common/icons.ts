// Commerce Kit Icon Library - Centralized SVG Management
// Usage: import { icons } from '@/components/common/icons'

export const icons = {
    // Navigation & UI
    cart: {
        viewBox: '0 0 24 24',
        path: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'
    },
    menu: {
        viewBox: '0 0 24 24',
        path: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>'
    },
    close: {
        viewBox: '0 0 24 24',
        path: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
    },
    search: {
        viewBox: '0 0 24 24',
        path: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'
    },

    // Actions
    plus: {
        viewBox: '0 0 24 24',
        path: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
    },
    minus: {
        viewBox: '0 0 24 24',
        path: '<line x1="5" y1="12" x2="19" y2="12"/>'
    },
    trash: {
        viewBox: '0 0 24 24',
        path: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
    },

    // Arrows & Chevrons
    chevronLeft: {
        viewBox: '0 0 24 24',
        path: '<polyline points="15 18 9 12 15 6"/>'
    },
    chevronRight: {
        viewBox: '0 0 24 24',
        path: '<polyline points="9 18 15 12 9 6"/>'
    },
    chevronDown: {
        viewBox: '0 0 24 24',
        path: '<polyline points="6 9 12 15 18 9"/>'
    },
    arrowRight: {
        viewBox: '0 0 24 24',
        path: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'
    },
    externalLink: {
        viewBox: '0 0 24 24',
        path: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'
    },

    // Status & Indicators
    check: {
        viewBox: '0 0 24 24',
        path: '<polyline points="20 6 9 17 4 12"/>'
    },
    checkCircle: {
        viewBox: '0 0 24 24',
        path: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
    },
    alertCircle: {
        viewBox: '0 0 24 24',
        path: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
    },
    info: {
        viewBox: '0 0 24 24',
        path: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
    },

    // Social & Contact
    whatsapp: {
        viewBox: '0 0 24 24',
        path: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>'
    },
    email: {
        viewBox: '0 0 24 24',
        path: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'
    },
    phone: {
        viewBox: '0 0 24 24',
        path: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'
    },

    // Racing / Motorsport
    flag: {
        viewBox: '0 0 24 24',
        path: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'
    },
    checkeredFlag: {
        viewBox: '0 0 24 24',
        path: '<rect x="3" y="3" width="4" height="4" fill="currentColor"/><rect x="11" y="3" width="4" height="4" fill="currentColor"/><rect x="7" y="7" width="4" height="4" fill="currentColor"/><rect x="15" y="7" width="4" height="4" fill="currentColor"/><rect x="3" y="11" width="4" height="4" fill="currentColor"/><rect x="11" y="11" width="4" height="4" fill="currentColor"/><line x1="3" y1="19" x2="3" y2="22" stroke-width="2"/>'
    },
    speed: {
        viewBox: '0 0 24 24',
        path: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/>'
    },
    tire: {
        viewBox: '0 0 24 24',
        path: '<circle cx="12" cy="12" r="10" stroke-width="4"/><circle cx="12" cy="12" r="3"/>'
    },

    // Product Features
    factory: {
        viewBox: '0 0 24 24',
        path: '<path d="M2 20V8l5-3v5l5-3v5l5-3v11H2zm18 0h2V4h-6v2.5l4 2.5v11z"/>'
    },
    target: {
        viewBox: '0 0 24 24',
        path: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'
    },
    shield: {
        viewBox: '0 0 24 24',
        path: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
    },
    truck: {
        viewBox: '0 0 24 24',
        path: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'
    },
    globe: {
        viewBox: '0 0 24 24',
        path: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
    },
    pencil: {
        viewBox: '0 0 24 24',
        path: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>'
    },
    rubber: {
        viewBox: '0 0 24 24',
        path: '<circle cx="12" cy="12" r="9"/><path d="M12 3c-2 2-3 5-3 9s1 7 3 9c2-2 3-5 3-9s-1-7-3-9z"/><path d="M5 8h14M5 16h14"/>'
    },

    // Gallery
    zoomIn: {
        viewBox: '0 0 24 24',
        path: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>'
    },
    image: {
        viewBox: '0 0 24 24',
        path: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'
    },
} as const;

export type IconName = keyof typeof icons;
