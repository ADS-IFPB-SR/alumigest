import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
// Nota: Ajuste a importação da sua API/Axios e biblioteca de Toast conforme o padrão do seu projeto.
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface TechnicalSheetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
}

export function TechnicalSheetPreviewModal({
  isOpen,
  onClose,
  orderId,
  orderCode
}: TechnicalSheetPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Efeito para buscar o PDF quando o modal abre
  useEffect(() => {
    if (!isOpen || !orderId) return;

    let objectUrl = '';

    const fetchPdf = async () => {
      setIsLoading(true);
      try {
        // Importante: responseType 'blob' é obrigatório para lidar com ficheiros binários
        const response = await api.get(`/api/v1/orders/${orderId}/production-sheet/pdf`, {
          responseType: 'blob',
        });

        // Cria uma URL temporária na memória do navegador para exibir o PDF
        const blob = new Blob([response.data], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (error) {
        console.error('Erro ao carregar Ficha Técnica:', error);
        toast.error('Não foi possível gerar a Ficha Técnica. Verifique se o pedido possui itens válidos.');
        onClose(); // Fecha o modal se falhar, cumprindo o critério de aceitação #5
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    // Cleanup: Liberta a memória do navegador quando o modal fecha
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setPdfUrl(null);
      }
    };
  }, [isOpen, orderId, onClose]);

  // Bloqueio de scroll do body e suporte à tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Ficha_Tecnica_${orderCode.replace('/', '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Janela do Modal */}
      <div className="relative bg-surface-container-lowest w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden bg-white">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Ficha Técnica de Produção Fabril
            </h2>
            <p className="text-sm text-gray-500">Pedido: {orderCode}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={isLoading || !pdfUrl}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading || !pdfUrl}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📥 Baixar PDF
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-200"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Corpo do PDF */}
        <div className="flex-1 bg-gray-100 p-2 sm:p-4 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 z-10">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Calculando lista de corte e desenhando folha A4...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full h-full rounded shadow-sm bg-white"
              title="Pré-visualização da Ficha Técnica"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Erro ao carregar o documento.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}