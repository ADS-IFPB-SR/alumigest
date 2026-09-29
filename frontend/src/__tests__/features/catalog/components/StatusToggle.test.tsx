import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StatusToggle } from '@/features/catalog/components/StatusToggle';

describe('StatusToggle Component', () => {
  it('deve renderizar com título e descrição padrões', () => {
    render(<StatusToggle active={true} onChange={vi.fn()} />);

    expect(screen.getByText('Status do Material')).toBeInTheDocument();
    expect(screen.getByText('Materiais inativos não aparecem em novos orçamentos.')).toBeInTheDocument();
  });

  it('Técnica: Transição de Estados - deve disparar onChange invertendo o valor booleano', () => {
    const onChange = vi.fn();
    const { rerender } = render(<StatusToggle active={true} onChange={onChange} />);

    const button = screen.getByRole('button', { name: 'Alternar status' });
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(false);

    // Quando inativo
    rerender(<StatusToggle active={false} onChange={onChange} />);
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
