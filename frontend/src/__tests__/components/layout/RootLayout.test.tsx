// RootLayout.test.tsx
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('RootLayout', () => {
  it('renders Header and main content', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
