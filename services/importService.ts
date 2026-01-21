
import Papa from 'papaparse';
import { ExtractedTransaction } from './geminiService';
import * as pdfjs from 'pdfjs-dist';

// Configuração do worker do PDF.js compatível com Vite 5/6
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Parser específico para formato Excel Money 2000 e superior.
 * Lê TODAS as linhas sem descartar nenhuma transação.
 * Identifica crédito/débito através de colunas separadas ou valores com sinal.
 */
export const parseExcelMoney2000 = (file: File): Promise<ExtractedTransaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const data = results.data as any[];
                    const transactions: ExtractedTransaction[] = [];

                    for (const row of data) {
                        // Identificar colunas de data
                        const date = row.Data || row.data || row.Date || row['Data do Lançamento'] ||
                            row['Data Mov.'] || row['Data Movimentação'] || '';

                        // Identificar colunas de descrição
                        const description = row.Descrição || row.descrição || row.Description ||
                            row.Historico || row.Histórico || row['Histórico'] ||
                            row.Descricao || row.HISTORICO || row.DESCRIÇÃO ||
                            'Transação Importada';

                        // Identificar valores de crédito e débito
                        let creditValue = 0;
                        let debitValue = 0;

                        // Cenário 1: Colunas separadas de Crédito e Débito
                        if (row.Crédito || row.Credito || row.CREDITO || row['Crédito']) {
                            const creditStr = row.Crédito || row.Credito || row.CREDITO || row['Crédito'] || '0';
                            creditValue = parseFloat(
                                creditStr.toString()
                                    .replace('R$', '')
                                    .replace(/\./g, '')
                                    .replace(',', '.')
                                    .trim()
                            );
                        }

                        if (row.Débito || row.Debito || row.DEBITO || row['Débito']) {
                            const debitStr = row.Débito || row.Debito || row.DEBITO || row['Débito'] || '0';
                            debitValue = parseFloat(
                                debitStr.toString()
                                    .replace('R$', '')
                                    .replace(/\./g, '')
                                    .replace(',', '.')
                                    .trim()
                            );
                        }

                        // Cenário 2: Coluna única "Valor" com sinal
                        if (!creditValue && !debitValue) {
                            const valueStr = row.Valor || row.valor || row.Amount || row['Valor (R$)'] ||
                                row.VALOR || row.Value || '0';
                            const amount = parseFloat(
                                valueStr.toString()
                                    .replace('R$', '')
                                    .replace(/\./g, '')
                                    .replace(',', '.')
                                    .trim()
                            );

                            if (!isNaN(amount)) {
                                if (amount > 0) {
                                    creditValue = amount;
                                } else if (amount < 0) {
                                    debitValue = Math.abs(amount);
                                }
                            }
                        }

                        // Formatar data
                        let formattedDate = date;
                        if (date && date.includes('/')) {
                            const [d, m, y] = date.split('/');
                            if (d && m && y) {
                                const year = y.length === 2 ? `20${y}` : y;
                                formattedDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                            }
                        }

                        // Criar transação - NÃO DESCARTAR NENHUMA LINHA
                        // Mesmo que valor seja 0, incluir para o usuário decidir
                        const finalAmount = creditValue > 0 ? creditValue : (debitValue > 0 ? debitValue : 0);
                        const isIncome = creditValue > 0;

                        transactions.push({
                            description: description || 'Transação Importada',
                            amount: finalAmount,
                            date: formattedDate || new Date().toISOString().split('T')[0],
                            category: 'Geral',
                            confidence: 'high' as 'high' | 'low',
                            isIncome: isIncome
                        });
                    }

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

/**
 * Parser para arquivos OFX (Open Financial Exchange).
 * Lê TODAS as transações sem descartar nenhuma.
 */
export const parseOFXStatement = async (file: File): Promise<ExtractedTransaction[]> => {
    try {
        const text = await file.text();
        const transactions: ExtractedTransaction[] = [];

        // Regex para encontrar blocos de transação STMTTRN
        const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
        let match;

        while ((match = transactionRegex.exec(text)) !== null) {
            const txBlock = match[1];

            // Extrair campos da transação
            const typeMatch = txBlock.match(/<TRNTYPE>(.*?)(?:<|$)/);
            const dateMatch = txBlock.match(/<DTPOSTED>(.*?)(?:<|$)/);
            const amountMatch = txBlock.match(/<TRNAMT>(.*?)(?:<|$)/);
            const memoMatch = txBlock.match(/<MEMO>(.*?)(?:<|$)/);
            const nameMatch = txBlock.match(/<NAME>(.*?)(?:<|$)/);

            const trnType = typeMatch ? typeMatch[1].trim() : '';
            const dateStr = dateMatch ? dateMatch[1].trim() : '';
            const amountStr = amountMatch ? amountMatch[1].trim() : '0';
            const memo = memoMatch ? memoMatch[1].trim() : '';
            const name = nameMatch ? nameMatch[1].trim() : '';

            // Parsear valor
            const amount = parseFloat(amountStr);
            if (isNaN(amount)) continue;

            // Formatar data (OFX usa formato YYYYMMDD ou YYYYMMDDHHMMSS)
            let formattedDate = new Date().toISOString().split('T')[0];
            if (dateStr.length >= 8) {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                formattedDate = `${year}-${month}-${day}`;
            }

            // Descrição: usar MEMO ou NAME
            const description = memo || name || 'Transação OFX';

            // Identificar se é crédito ou débito
            // TRNTYPE pode ser: CREDIT, DEBIT, INT, DIV, FEE, SRVCHG, DEP, ATM, POS, XFER, CHECK, PAYMENT, CASH, DIRECTDEP, DIRECTDEBIT, REPEATPMT, OTHER
            const creditTypes = ['CREDIT', 'DEP', 'DIRECTDEP', 'INT', 'DIV'];
            const isIncome = amount > 0 || creditTypes.includes(trnType.toUpperCase());

            transactions.push({
                description,
                amount: Math.abs(amount),
                date: formattedDate,
                category: 'Geral',
                confidence: 'high' as 'high' | 'low',
                isIncome
            });
        }

        if (transactions.length === 0) {
            throw new Error('Nenhuma transação encontrada no arquivo OFX. Verifique se o arquivo está no formato correto.');
        }

        return transactions;
    } catch (error: any) {
        if (error.message.includes('Nenhuma transação')) throw error;
        console.error('Erro ao ler OFX:', error);
        throw new Error('Não foi possível processar o arquivo OFX. Verifique se o formato está correto.');
    }
};

export const isLocalFileCompatible = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['csv', 'ofx', 'pdf'].includes(extension || '');
};
