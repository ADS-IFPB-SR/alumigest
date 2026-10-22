/**
 * Utilitário para comunicação direta com impressoras térmicas USB (Elgin L42)
 * através da Web Serial API do navegador (sem necessidade de spooler do servidor ou caixas de diálogo).
 * US-17 / Correções #492 e #493.
 */

export interface SerialPrintResult {
  success: boolean;
  message?: string;
}

/**
 * Envia um payload binário ou de texto (comandos nativos BPLB) diretamente
 * para a impressora térmica conectada via porta Serial/USB.
 *
 * @param payload buffer com os dados do script BPLB
 * @param baudRate velocidade da comunicação serial (padrão 9600 para Elgin L42)
 */
export async function printDirectToSerialPrinter(
  payload: Uint8Array | ArrayBuffer | string,
  baudRate = 9600
): Promise<SerialPrintResult> {
  const nav = navigator as unknown as { serial?: { requestPort: () => Promise<unknown>; getPorts: () => Promise<unknown[]> } };

  if (!nav.serial) {
    throw new Error(
      'Navegador não suporta a Web Serial API. Para impressão direta USB, utilize o Google Chrome, Edge ou Opera. Como alternativa, utilize o botão "Baixar PDF".'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let port: any = null;

  try {
    port = await nav.serial.requestPort();
    await port.open({ baudRate });

    const writer = port.writable.getWriter();

    const data: Uint8Array =
      typeof payload === 'string'
        ? new TextEncoder().encode(payload)
        : payload instanceof Uint8Array
          ? payload
          : new Uint8Array(payload);

    await writer.write(data);
    writer.releaseLock();
    await port.close();

    return {
      success: true,
      message: 'Comandos BPLB enviados diretamente para a impressora térmica via USB com sucesso.',
    };
  } catch (error: unknown) {
    if (port && port.readable && !port.readable.locked) {
      try {
        await port.close();
      } catch {
        // Ignora erro no fechamento de porta de fallback
      }
    }

    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return {
        success: false,
        message: 'Nenhuma porta USB ou impressora foi selecionada pelo operador.',
      };
    }

    const message = error instanceof Error ? error.message : 'Falha na comunicação direta com a porta USB.';
    throw new Error(message, { cause: error });
  }
}
