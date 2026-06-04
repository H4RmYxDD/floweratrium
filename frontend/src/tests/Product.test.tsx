// @vitest-environment happy-dom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import { BrowserRouter } from 'react-router-dom';

describe('Megjelenik-e a Zöldike', () => {
    it('Zöldike api hívás után', async () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>,
        );
        const zoldike = await screen.findByText('Zöldike');
        expect(zoldike).toBeTruthy();
    });
});
