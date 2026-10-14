import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';

// jsdom n'implémente pas le défilement
window.scrollTo = () => undefined;
