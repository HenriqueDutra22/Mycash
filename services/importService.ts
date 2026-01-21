
import Papa from 'papaparse';
import { ExtractedTransaction } from './geminiService';
import * as pdfjs from 'pdfjs-dist';

// Configuração do worker do PDF.js compatível com Vite 5/6
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Parser para arquivos de texto tabular (colunas separadas por espaços).
 * Formato: Data | Descrição | Valor | Saldo
 * - Valor vem ANTES do saldo
 * - Usa vírgula como decimal (formato BR)
 * - Pode ter sinal negativo
 * - NUNCA converte erro de parsing em zero
 */
export const parseTabularBankStatement = (file: File): Promise<ExtractedTransaction[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const text = await file.text();
            const lines = text.split('\n');
            const transactions: ExtractedTransaction[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Pular linhas vazias ou cabeçalhos
                if (!line || line.length < 10) continue;

                // Regex para extrair data no formato DD/MM/YYYY ou DD/MM/YY
                const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2,4})/);
                if (!dateMatch) continue; // Pular se não tiver data

                const dateStr = dateMatch[1];

                // Extrair valores monetários (formato brasileiro: -1.234,56 ou 1.234,56)
                // Procura por números com vírgula decimal, opcionalmente com pontos de milhar e sinal negativo
                const valueRegex = /-?\d{1,3}(?:\.\d{3})*,\d{2}/g;
                const values = line.match(valueRegex);

                if (!values || values.length < 1) {
                    console.warn(`Linha ${i + 1}: Nenhum valor encontrado - "${line}"`);
                    continue; // Pular linha sem valores
                }

                // O VALOR da transação é o PENÚLTIMO número (antes do saldo)
                // Se houver apenas 1 número, é o valor
                const valueStr = values.length >= 2 ? values[values.length - 2] : values[0];

                // Normalizar número brasileiro para formato JS
                const normalizedValue = valueStr
                    .replace(/\./g, '')  // Remove pontos de milhar
                    .replace(',', '.');   // Troca vírgula por ponto

                const amount = parseFloat(normalizedValue);

                // NUNCA converter erro de parsing em zero - lançar erro
                if (isNaN(amount)) {
                    throw new Error(`Linha ${i + 1}: Erro ao parsear valor "${valueStr}" - resultado NaN`);
                }

                // Extrair descrição (texto entre data e primeiro valor)
                const afterDate = line.substring(line.indexOf(dateStr) + dateStr.length).trim();
                const firstValueIndex = afterDate.indexOf(valueStr);
                const description = firstValueIndex > 0
                    ? afterDate.substring(0, firstValueIndex).trim()
                    : 'Transação Importada';

                // Formatar data para YYYY-MM-DD
                const [d, m, y] = dateStr.split('/');
                const year = y.length === 2 ? `20${y}` : y;
                const formattedDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

                // Identificar se é crédito (positivo) ou débito (negativo)
                const isIncome = amount > 0;

                transactions.push({
                    description: description || 'Transação Importada',
                    amount: Math.abs(amount),
                    date: formattedDate,
                    category: 'Geral',
                    confidence: 'high' as 'high' | 'low',
                    isIncome: isIncome
                });
            }

            if (transactions.length === 0) {
                throw new Error('Nenhuma transação encontrada no arquivo. Verifique se o formato está correto.');
            }

            console.log(`✅ Parser tabular: ${transactions.length} transações extraídas`);
            resolve(transactions);

        } catch (error: any) {
            console.error('❌ Erro no parser tabular:', error);
            reject(error);
        }
    });
};

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
                            confidence: 'high' as 'high' | 'low',
                            isIncome: amount > 0
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
                    confidence: 'high',
                    isIncome: amount > 0
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
    // Suporta TXT (tabular), CSV, XLS e PDF
    return ['txt', 'csv', 'xls', 'xlsx', 'pdf'].includes(extension || '');
};
