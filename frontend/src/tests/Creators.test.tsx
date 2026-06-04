// @vitest-environment happy-dom

import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BrowserRouter } from 'react-router-dom';
import GlobalFooter from '../components/GlobalFooter';

describe('Megjelenik-e a készítők szöveg', () => {
    it('Készítők szöveg megjelenik', () => {
        const footer = renderToString(
            <BrowserRouter>
                <GlobalFooter />
            </BrowserRouter>,
        );
        expect(footer).toContain('Készítők');
    });
});
