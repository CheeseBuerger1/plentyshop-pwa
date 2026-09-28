import { handleLegalAnchorClick } from '../utils/legalAnchors';

/** Jump links in the legal texts (table of contents of the AGB), see utils/legalAnchors.ts. */
export default defineNuxtPlugin(() => {
  document.addEventListener('click', handleLegalAnchorClick);
});
