# Certificate Generator

A modern, interactive certificate creator that allows users to customize text, fonts, and positions on templates, preview changes in real-time, and download high-quality PDFs. Built with **React**, **Vite**, and **TypeScript**.

---

## Features

- **Upload Certificate Templates:** Add your own certificate images (PNG, JPG, SVG).  
- **Dynamic Text Editing:** Customize names, titles, and other fields with adjustable font, size, color, and position.  
- **Live Preview:** See your changes immediately.  
- **PDF Export:** Download certificates in high-quality PDF format.  
- **Responsive Design:** Works well on both desktop and tablet screens.  
- **Optional Animated Background:** Falling squares animation for modern look.  

---

## Technology Stack

This project is built with:

- **Vite**  
- **TypeScript**  
- **React**  
- **shadcn-ui**  
- **Tailwind CSS**  

> All shadcn/ui components have been downloaded under `@/components/ui`.

---

## File Structure

- `index.html` - HTML entry point  
- `vite.config.ts` - Vite configuration  
- `tailwind.config.js` - Tailwind CSS configuration  
- `package.json` - NPM dependencies and scripts  
- `src/app.tsx` - Root component  
- `src/main.tsx` - Project entry point  
- `src/index.css` - Global styles  
- `src/pages/Index.tsx` - Home page logic  

---

## Components & Styling

- All shadcn/ui components are available at `@/components/ui`.  
- Use Tailwind classes for styling components.  
- Add global styles in `src/index.css` or create new CSS files.  

> Note: The `@/` path alias points to the `src/` directory. Don’t re-export types unnecessarily in TypeScript.

---

## Development

- Import components from `@/components/ui` in your React components.  
- Customize the UI by modifying the Tailwind configuration.

**Commands**

- Install dependencies:  
  ```bash
  pnpm i

- Add dependencies: 
  ```bash
  pnpm add <dependency>

- Start preview:
  ```bash
  pnpm run dev

- Build production version:
  ```bash
  pnpm run build

# Usage

- Upload a certificate template image.
- Add names or other texts and drag to desired positions.
- Customize font style, size, and color.
- Preview in real-time.
- Click Download to save as PDF.




 