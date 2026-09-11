import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateOptionSchemaEditor } from '../../../features/catalog/components/builder/TemplateOptionSchemaEditor'
import type { TemplateOptionSchema } from '../../../features/catalog/types/templates'

describe('TemplateOptionSchemaEditor', () => {
  it('não deve renderizar nada quando templateType for null', () => {
    const { container } = render(
      <TemplateOptionSchemaEditor
        templateType={null}
        optionSchema={{}}
        setOptionSchema={vi.fn()}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('deve disparar setOptionSchema inicializando as regras aplicáveis ao selecionar um template', () => {
    const setOptionSchema = vi.fn()
    const setTemplateConfig = vi.fn()

    render(
      <TemplateOptionSchemaEditor
        templateType="SLIDING_DOOR_2F"
        optionSchema={{}}
        setOptionSchema={setOptionSchema}
        setTemplateConfig={setTemplateConfig}
      />
    )

    expect(setOptionSchema).toHaveBeenCalledWith(
      expect.objectContaining({
        allowHandle: true,
        allowDrilling: true,
        allowSlidingMode: true,
      })
    )
  })

  it('deve renderizar a seção de puxadores e permitir alternar o switch de restrição', () => {
    const setOptionSchema = vi.fn()
    const optionSchema: Partial<TemplateOptionSchema> = {
      allowHandle: true,
      allowedHandleTypes: ['BAR_TUBULAR', 'SHELL_LOCK'],
      allowedHandlePositions: ['RIGHT', 'LEFT'],
    }

    render(
      <TemplateOptionSchemaEditor
        templateType="SLIDING_DOOR_2F"
        optionSchema={optionSchema}
        setOptionSchema={setOptionSchema}
      />
    )

    expect(screen.getByText('Puxadores e Fechaduras')).toBeInTheDocument()

    // O switch de permitir puxadores
    const switchBtn = screen.getByRole('switch', { name: /Desativar restrição de Puxadores e Fechaduras/i })
    expect(switchBtn).toBeInTheDocument()

    fireEvent.click(switchBtn)

    expect(setOptionSchema).toHaveBeenCalledWith(
      expect.objectContaining({
        allowHandle: false,
      })
    )
  })

  it('deve expandir as opções ao clicar no botão de expandir da seção', () => {
    const optionSchema: Partial<TemplateOptionSchema> = {
      allowHandle: true,
      allowedHandleTypes: ['BAR_TUBULAR', 'SHELL_LOCK'],
      allowedHandlePositions: ['RIGHT', 'LEFT'],
    }

    render(
      <TemplateOptionSchemaEditor
        templateType="SLIDING_DOOR_2F"
        optionSchema={optionSchema}
        setOptionSchema={vi.fn()}
      />
    )

    const expandBtn = screen.getByTitle('Expandir opções')
    fireEvent.click(expandBtn)

    // Ao expandir, exibe o conteúdo de customização de puxadores
    expect(screen.getByText('Modelos de Puxador:')).toBeInTheDocument()
    expect(screen.getByText('Posições Permitidas:')).toBeInTheDocument()
  })

  it('deve renderizar as seções de paleta de cores de alumínio e vidro', () => {
    const optionSchema: Partial<TemplateOptionSchema> = {
      allowAluminumColors: ['#212121', '#FFFFFF'],
      allowGlassColors: ['#e3f2fd', '#595959'],
    }

    render(
      <TemplateOptionSchemaEditor
        templateType="SLIDING_DOOR_2F"
        optionSchema={optionSchema}
        setOptionSchema={vi.fn()}
      />
    )

    expect(screen.getByText('Cores de Alumínio Permitidas')).toBeInTheDocument()
    expect(screen.getByText('Acabamentos de Vidro Permitidos')).toBeInTheDocument()
  })
})
