export function getInitials(name: string): string {
  if (!name) return 'CL';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

export function formatWhatsAppLink(phone?: string, clientName?: string): string {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return '#';
  const countryPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const greeting = clientName ? `Olá ${clientName}, tudo bem?` : 'Olá, tudo bem?';
  const msg = `${greeting} Entro em contato através do AlumiGest sobre seus orçamentos e pedidos.`;
  return `https://wa.me/${countryPhone}?text=${encodeURIComponent(msg)}`;
}

export function buildBudgetWhatsAppLink(
  phone?: string,
  clientName?: string,
  budgetCode?: string,
  total?: number
): string {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return '#';
  const countryPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const totalStr = total !== undefined ? formatCurrency(total) : '';
  const greeting = clientName ? `Olá ${clientName}!` : 'Olá!';
  const message = `${greeting} Segue a proposta comercial ${budgetCode || ''} no valor de ${totalStr}. Estamos à disposição para tirar qualquer dúvida!`;
  return `https://wa.me/${countryPhone}?text=${encodeURIComponent(message)}`;
}
