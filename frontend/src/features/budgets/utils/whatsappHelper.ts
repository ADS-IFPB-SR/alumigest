export interface OpenWhatsAppOptions {
  phone?: string | null;
  text: string;
  appWindowName?: string;
}

/**
 * Detecta se o dispositivo é mobile (Android, iOS, iPadOS).
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isTouchMac = navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua);
  return /Android|iPhone|iPad|iPod/i.test(ua) || isTouchMac;
}

/**
 * Normaliza número de telefone brasileiro removendo caracteres não numéricos
 * e evitando duplicação do código DDI 55.
 */
export function cleanPhoneNumber(phone?: string | null): string {
  let raw = phone ? phone.replace(/\D/g, '') : '';
  if (raw.startsWith('55') && raw.length >= 12) {
    raw = raw.slice(2);
  }
  return raw;
}

/**
 * Normaliza emojis de 4 bytes propensos a corrupção em sistemas Windows/Desktop
 * convertendo-os em marcadores textuais limpos e universais.
 */
export function sanitizeWhatsAppText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/📋\s*/g, '')
    .replace(/📅\s*/g, '• ')
    .replace(/👤\s*/g, '• ')
    .replace(/📦\s*/g, '')
    .replace(/💰\s*/g, '• ')
    .replace(/🏷️?\s*/g, '• ')
    .replace(/💳\s*/g, '• ');
}

/**
 * Monta a mensagem objetiva contendo o link direto para visualização e download do PDF Comercial.
 * O WhatsApp bloqueia links contendo 'localhost' por segurança.
 * Por isso, em ambiente de desenvolvimento local, é utilizado o wildcard DNS 127.0.0.1.nip.io
 * ou a variável VITE_PUBLIC_BASE_URL, ativando o hiperlink clicável azul.
 */
export function buildCommercialPdfMessage(budgetCode: string, budgetId: string): string {
  let origin = typeof window !== 'undefined' ? window.location.origin : '';

  const envPublicUrl = (import.meta as any).env?.VITE_PUBLIC_BASE_URL;
  if (envPublicUrl) {
    origin = envPublicUrl;
    while (origin.endsWith('/')) {
      origin = origin.slice(0, -1);
    }
  } else if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    origin = `http://127.0.0.1.nip.io:${window.location.port || '5173'}`;
  }

  const pdfUrl = `${origin}/api/orcamentos/${budgetId}/pdf/comercial`;

  return `Olá! Segue o link para visualizar e baixar a proposta comercial do orçamento *${budgetCode}*:

${pdfUrl}

Qualquer dúvida, estamos à disposição!
_Alumiportas - Vidraçaria e Esquadrias_`;
}

/**
 * Abre a conversa no WhatsApp respeitando o ambiente do usuário:
 * - Mobile: dispara diretamente para api.whatsapp.com (abrindo o app WhatsApp no celular)
 * - Desktop: abre ou reutiliza a mesma aba do WhatsApp Web (web.whatsapp.com)
 */
export function openWhatsAppChat({
  phone,
  text,
  appWindowName = 'whatsapp_web_window',
}: OpenWhatsAppOptions): void {
  const clean = cleanPhoneNumber(phone);
  const hasPhone = clean.length >= 8;
  const encodedText = encodeURIComponent(text);
  const isMobile = isMobileDevice();

  if (isMobile) {
    const mobileUrl = hasPhone
      ? `https://api.whatsapp.com/send?phone=55${clean}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
    if (typeof window !== 'undefined') {
      window.location.href = mobileUrl;
    }
    return;
  }

  // No Desktop: abre diretamente o WhatsApp Web reutilizando a aba existente
  const webUrl = hasPhone
    ? `https://web.whatsapp.com/send?phone=55${clean}&text=${encodedText}`
    : `https://web.whatsapp.com/send?text=${encodedText}`;

  if (typeof window !== 'undefined') {
    const targetTab = window.open(webUrl, appWindowName);
    targetTab?.focus();
  }
}

export interface SharePdfOptions {
  budgetId: string;
  budgetCode: string;
  customerPhone?: string | null;
  onSuccess?: () => void;
}

/**
 * Compartilha o PDF Comercial via Link Direto:
 * Envia mensagem objetiva no WhatsApp com link para o cliente visualizar e baixar o PDF diretamente,
 * sem forçar download no computador do atendente e sem necessidade de upload manual.
 */
export function shareCommercialPdfLink({
  budgetId,
  budgetCode,
  customerPhone,
  onSuccess,
}: SharePdfOptions): void {
  const message = buildCommercialPdfMessage(budgetCode, budgetId);

  openWhatsAppChat({
    phone: customerPhone,
    text: message,
    appWindowName: 'whatsapp_web_window',
  });

  onSuccess?.();
}
