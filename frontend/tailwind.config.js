/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
          "primary": "#a13f1f",
          "secondary-fixed-dim": "#b0c7f4",
          "surface-container": "#eceef0",
          "on-surface": "#191c1e",
          "secondary": "#485f86",
          "on-tertiary-fixed-variant": "#005144",
          "tertiary-container": "#4ba491",
          "secondary-container": "#b9cffd",
          "on-secondary-container": "#42587f",
          "primary-fixed": "#ffdbd1",
          "on-primary-container": "#5a1500",
          "on-tertiary-container": "#00352c",
          "secondary-fixed": "#d6e3ff",
          "on-primary": "#ffffff",
          "surface-bright": "#f8f9fb",
          "surface-dim": "#d8dadc",
          "surface-tint": "#a13f1f",
          "inverse-on-surface": "#eff1f3",
          "surface-container-low": "#f2f4f6",
          "surface-container-lowest": "#ffffff",
          "on-primary-fixed": "#3a0a00",
          "on-tertiary": "#ffffff",
          "surface-variant": "#e0e3e5",
          "on-surface-variant": "#57423c",
          "error": "#ba1a1a",
          "on-error-container": "#93000a",
          "on-secondary-fixed-variant": "#30476d",
          "tertiary": "#006b5b",
          "on-tertiary-fixed": "#00201a",
          "on-error": "#ffffff",
          "error-container": "#ffdad6",
          "on-secondary-fixed": "#001b3e",
          "tertiary-fixed": "#9af3de",
          "on-secondary": "#ffffff",
          "primary-fixed-dim": "#ffb59f",
          "tertiary-fixed-dim": "#7ed6c2",
          "on-background": "#191c1e",
          "surface-container-high": "#e6e8ea",
          "inverse-surface": "#2d3133",
          "inverse-primary": "#ffb59f",
          "surface-container-highest": "#e0e3e5",
          "primary-container": "#e8734f",
          "on-primary-fixed-variant": "#822809",
          "surface": "#f8f9fb",
          "outline-variant": "#ddc0b8",
          "outline": "#8a726b",
          "background": "#f8f9fb"
      },
      "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
      },
      "spacing": {
          "base": "4px",
          "sidebar-width": "280px",
          "gutter": "24px",
          "header-height": "64px",
          "margin-desktop": "32px",
          "container-max": "1280px",
          "margin-mobile": "16px"
      },
      "fontFamily": {
          "label-sm": ["IBM Plex Sans", "sans-serif"],
          "body-md": ["IBM Plex Sans", "sans-serif"],
          "display-lg": ["\"Source Serif 4\"", "serif"],
          "headline-lg": ["\"Source Serif 4\"", "serif"],
          "body-lg": ["IBM Plex Sans", "sans-serif"],
          "headline-sm": ["\"Source Serif 4\"", "serif"],
          "display-lg-mobile": ["\"Source Serif 4\"", "serif"],
          "label-md": ["IBM Plex Sans", "sans-serif"],
          "label-lg": ["IBM Plex Sans", "sans-serif"],
          "headline-md": ["\"Source Serif 4\"", "serif"],
          "body-sm": ["IBM Plex Sans", "sans-serif"]
      },
      "fontSize": {
          "label-sm": ["11px", {"lineHeight": "16px", "fontWeight": "500"}],
          "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
          "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
          "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
          "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
          "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
          "display-lg-mobile": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
          "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "600"}],
          "label-lg": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600"}],
          "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
          "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}
