/**
 * Utilitário de cópia para área de transferência com suporte a ambientes HTTP inseguros (BUG-028 / Issue #373).
 *
 * Conforme a especificação da W3C, a Clipboard API (`navigator.clipboard`) é restrita a Secure Contexts
 * (HTTPS ou localhost). Quando a aplicação é acessada pelo IP da rede local em oficinas/vidraçarias
 * (ex: http://192.168.x.x:5173), `navigator.clipboard` é undefined.
 *
 * Esta função implementa:
 * 1. Uso prioritário de `navigator.clipboard.writeText` se disponível.
 * 2. Fallback resiliente via elemento `<textarea>` temporário com `document.execCommand('copy')`.
 * 3. Retorno booleano indicando o sucesso da operação.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Tenta a API moderna em Secure Context (HTTPS / localhost)
  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Rejeitado pelo navegador (permissão bloqueada, contexto sem foco, etc.)
      // Prossegue para o fallback
    }
  }

  // 2. Fallback com elemento textarea temporário e execCommand('copy')
  if (typeof document !== 'undefined') {
    let textArea: HTMLTextAreaElement | null = null;
    try {
      textArea = document.createElement('textarea');
      textArea.value = text;

      // Garante que o elemento não interfira visualmente nem desloque o scroll
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = typeof document.execCommand === 'function' && document.execCommand('copy'); // NOSONAR typescript:S1874
      return Boolean(successful);
    } catch {
      return false;
    } finally {
      textArea?.remove();
    }
  }

  return false;
}
