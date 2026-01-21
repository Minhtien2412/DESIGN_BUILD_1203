import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['vi', 'en'],
    // Disable tutorials/guides
    tutorials: false,
    notifications: {
      releases: false,
    },
    // Theme customization
    theme: {
      light: {
        colors: {
          primary100: '#f0f9ff',
          primary200: '#bae6fd',
          primary500: '#0ea5e9',
          primary600: '#0284c7',
          primary700: '#0369a1',
          buttonPrimary500: '#0ea5e9',
          buttonPrimary600: '#0284c7',
        },
      },
      dark: {
        colors: {
          primary100: '#0c4a6e',
          primary200: '#075985',
          primary500: '#0ea5e9',
          primary600: '#38bdf8',
          primary700: '#7dd3fc',
          buttonPrimary500: '#0ea5e9',
          buttonPrimary600: '#38bdf8',
        },
      },
    },
  },
  bootstrap(app: StrapiApp) {
    // Inject custom CSS to hide upgrade banners
    const style = document.createElement('style');
    style.textContent = `
      /* Hide upgrade/trial banners */
      [class*="grLNwp"],
      [class*="eYKpPc"],
      a[href*="chargebeeportal"],
      a[href*="strapi.io/pricing"],
      [class*="UpgradeBanner"],
      div[class*="sc-bRKDuR"][class*="sc-hvigdm"]:has(a[href*="chargebeeportal"]),
      /* Hide trial notifications */
      [class*="trial"],
      [class*="Trial"],
      /* Hide "Upgrade now" buttons */
      button:has(span:contains("Upgrade")),
      a:has(span:contains("Upgrade now")),
      /* Generic upgrade banner patterns */
      div:has(> div > span:contains("Growth plan features")),
      div:has(> a[href*="chargebeeportal"]) {
        display: none !important;
      }
      
      /* Hide license-related elements */
      [data-testid*="upgrade"],
      [data-testid*="trial"],
      [aria-label*="upgrade"],
      [aria-label*="trial"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('🚀 Strapi Admin customized - Upgrade banners hidden');
  },
};
