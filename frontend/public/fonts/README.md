# Fonts Directory

## Required Fonts

### Gilroy Regular
Due to licensing restrictions, Gilroy font is not included in this repository.

**To use Gilroy font:**
1. Download Gilroy Regular font from a legitimate source
2. Convert to WOFF2 format (if not already)
3. Place the file as: `Gilroy-Regular.woff2` in this directory

**Alternative Options:**
If you don't have access to Gilroy, you can use similar alternatives:
- **Montserrat** (Google Fonts) - Very similar geometric sans-serif
- **Poppins** (Google Fonts) - Clean and modern alternative
- **Inter** (Google Fonts) - Professional and readable

### To use an alternative font:
Update `frontend/src/app/layout.tsx` to replace Gilroy with your chosen alternative.

For example, to use Montserrat:
```typescript
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: "400",
  variable: "--font-gilroy", // Keep the same variable name
  subsets: ["latin"],
});
```
