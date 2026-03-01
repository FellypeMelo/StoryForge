import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from './AppShell';
import React from 'react';

describe('AppShell Navigation', () => {
  it('should call onNavigate when a nav item is clicked', () => {
    const onNavigate = vi.fn();
    render(
      <AppShell onNavigate={onNavigate}>
        <div>Content</div>
      </AppShell>
    );

    const personasButton = screen.getByText('Personas');
    fireEvent.click(personasButton);

    expect(onNavigate).toHaveBeenCalledWith('personas');
  });
});
