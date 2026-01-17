
import Papa from 'papaparse';
import { ExtractedTransaction } from './geminiService';
import * as pdfjs from 'pdfjs-dist';

// Configuração do worker do PDF.js compatível com Vite 5/6
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Parser para CSVs bancários genéricos.
 */
export const parseCSVStatement = (file: File): Promise<ExtractedTransaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const data = results.data as any[];
                    const transactions: ExtractedTransaction[] = data.map((row: any) => {
                        const date = row.Data || row.data || row.Date || row['Data do Lançamento'] || '';
                        const description = row.Descrição || row.descrição || row.Description || row.Historico || row.Histórico || '';
                        const valueStr = row.Valor || row.valor || row.Amount || row['Valor (R$)'] || '0';

                        const amount = parseFloat(
                            valueStr.toString()
                                .replace('R$', '')
                                .replace(/\./g, '')
                                .replace(',', '.')
                                .trim()
                        );

                        let formattedDate = date;
                        if (date.includes('/')) {
                            const [d, m, y] = date.split('/');
                            if (d && m && y) {
                                const year = y.length === 2 ? `20${y}` : y;
                                formattedDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                            }
                        }

                        return {
                            description: description || 'Transação Importada',
                            amount: isNaN(amount) ? 0 : amount,
                            date: formattedDate,
                            category: 'Geral',
                            confidence: 'high' as 'high' | 'low'
                        };
                    }).filter(tx => tx.amount !== 0);

                    resolve(transactions);
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => reject(error)
        });
    });
};

/**
 * Extrai texto de um arquivo PDF e tenta identificar transações via Regex.
 */
export const parsePDFStatement = async (file: File): Promise<ExtractedTransaction[]> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        // Padrões de Regex mais flexíveis
        const patterns = [
            // Padrão 1: DD/MM (ou DD/MM/YY) - Descrição - Valor (Ex: Nubank, Santander)
            /(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+([A-Z0-9\s*.\-/]+?)\s+(-?[\d.]+,\d{2})/g,
            // Padrão 2: Valor antes da descrição (Ex: Alguns extratos de empresas)
            /(-?[\d.]+,\d{2})\s+(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+([A-Z0-9\s*.\-/]+)/g,
        ];

        const transactions: ExtractedTransaction[] = [];

        for (const regex of patterns) {
            let match;
            while ((match = regex.exec(fullText)) !== null) {
                let dateStr, desc, valStr;

                if (regex.source.startsWith('(\\d{2}')) {
                    const [, dateStrVal, descVal, valStrVal] = match;
                    dateStr = dateStrVal; desc = descVal; valStr = valStrVal;
                } else {
                    const [, valStrVal, dateStrVal, descVal] = match;
                    valStr = valStrVal; dateStr = dateStrVal; desc = descVal;
                }

                const amount = parseFloat(valStr.replace(/\./g, '').replace(',', '.'));
                if (isNaN(amount) || amount === 0) continue;

                let formattedDate = dateStr;
                const parts = dateStr.split('/');
                if (parts.length >= 2) {
                    const year = parts[2] ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2]) : new Date().getFullYear();
                    formattedDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }

                transactions.push({
                    description: desc.trim(),
                    amount: amount,
                    date: formattedDate,
                    category: 'Geral',
                    confidence: 'high'
                });
            }
            if (transactions.length > 0) break;
        }

        if (transactions.length === 0) {
            throw new Error('Nenhuma transação encontrada. Tente usar o escaneamento por foto/IA se este for um boleto ou extrato complexo.');
        }

        return transactions;
    } catch (error: any) {
        if (error.message.includes('Nenhuma transação')) throw error;
        console.error('Erro ao ler PDF:', error);
        throw new Error('Não foi possível ler este arquivo como PDF de texto. Se for um PDF de imagem (escaneado), tente convertê-lo ou use a opção de "IA" (foto/screenshot).');
    }
};

export const isLocalFileCompatible = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['csv', 'ofx', 'pdf'].includes(extension || '');
};
