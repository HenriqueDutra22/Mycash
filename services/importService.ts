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
 * - Tenta importar TODA linha com data + valor
 */
export const parseTabularBankStatement = (file: File): Promise<ExtractedTransaction[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const text = await file.text();
            const lines = text.split('\n');
            const transactions: ExtractedTransaction[] = [];
            const errors: string[] = [];

            console.log(`📄 Processando ${lines.length} linhas do arquivo...`);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const lineNum = i + 1;

                // Pular apenas linhas completamente vazias
                if (!line) continue;

                try {
                    // Regex para extrair data no formato DD/MM/YYYY ou DD/MM/YY
                    const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2,4})/);

                    // Extrair valores monetários (formato brasileiro: -1.234,56 ou 1.234,56)
                    const valueRegex = /-?\d{1,3}(?:\.\d{3})*,\d{2}/g;
                    const values = line.match(valueRegex);

                    // Se não tem data OU não tem valor, pular mas logar
                    if (!dateMatch || !values || values.length < 1) {
                        if (line.length > 5) { // Só loga linhas com conteúdo relevante
                            console.warn(`⚠️ Linha ${lineNum} ignorada (sem data ou valor): "${line.substring(0, 50)}..."`);
                        }
                        continue;
                    }

                    const dateStr = dateMatch[1];

                    // O VALOR da transação é o PENÚLTIMO número (antes do saldo)
                    // Se houver apenas 1 número, é o valor
                    const valueStr = values.length >= 2 ? values[values.length - 2] : values[0];

                    // Normalizar número brasileiro para formato JS
                    const normalizedValue = valueStr
                        .replace(/\./g, '')  // Remove pontos de milhar
                        .replace(',', '.');   // Troca vírgula por ponto

                    const amount = parseFloat(normalizedValue);

                    // Se parsing falhar, logar e continuar
                    if (isNaN(amount)) {
                        const error = `❌ Linha ${lineNum}: Erro ao parsear valor "${valueStr}" - "${line}"`;
                        console.error(error);
                        errors.push(error);
                        continue; // Continua processando outras linhas
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

                    // Identificar se é crédito ou débito com regras específicas
                    const descUpper = description.toUpperCase();
                    let type: 'credit' | 'debit';

                    if (descUpper.includes('PIX RECEBIDO')) {
                        type = 'credit';
                    } else if (descUpper.includes('PIX ENVIADO') || descUpper.includes('DEBITO') || descUpper.includes('BOLETO')) {
                        type = 'debit';
                    } else {
                        // Fallback pelo sinal
                        type = amount > 0 ? 'credit' : 'debit';
                    }

                    const isIncome = type === 'credit';

                    transactions.push({
                        description: description || 'Transação Importada',
                        amount: Math.abs(amount),
                        date: formattedDate,
                        category: 'Geral',
                        confidence: 'high' as 'high' | 'low',
                        isIncome: isIncome,
                        type: type
                    });

                    console.log(`✅ Linha ${lineNum}: ${description} - ${isIncome ? '+' : '-'}${Math.abs(amount)}`);

                } catch (error: any) {
                    // Logar erro mas continuar processando
                    const errorMsg = `❌ Linha ${lineNum}: Erro inesperado - ${error.message} - "${line}"`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                }
            }

            if (transactions.length === 0) {
                const errorSummary = errors.length > 0
                    ? `\n\nErros encontrados:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... e mais ${errors.length - 5} erros` : ''}`
                    : '';
                reject(new Error(`Nenhuma transação válida encontrada no arquivo.${errorSummary}`));
                return;
            }

            console.log(`\n📊 Resumo do parsing:`);
            console.log(`✅ ${transactions.length} transações extraídas`);
            if (errors.length > 0) {
                console.log(`⚠️ ${errors.length} linhas com erro (veja logs acima)`);
            }

            resolve(transactions);

        } catch (error: any) {
            console.error('❌ Erro fatal no parser tabular:', error);
            reject(error);
        }
    });
};

/**
 * Parser para CSV no formato oficial padronizado.
 * Formato: date,description,credit,debit
 * - Importa TODA linha que contenha uma data válida
 * - Suporta ponto OU vírgula como decimal automaticamente
 * - Não aplica filtros inteligentes
 * - Assume que o arquivo já está normalizado
 */
export const parseStandardCSV = (file: File): Promise<ExtractedTransaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const data = results.data as any[];
                    const transactions: ExtractedTransaction[] = [];
                    const errors: string[] = [];

                    console.log(`📄 Processando ${data.length} linhas do CSV...`);

                    for (let i = 0; i < data.length; i++) {
                        const row = data[i];
                        const lineNum = i + 2; // +2 porque linha 1 é header

                        try {
                            // Extrair campos do formato oficial
                            const dateStr = row.date || row.Date || '';
                            const description = row.description || row.Description || '';
                            const creditStr = row.credit || row.Credit || '';
                            const debitStr = row.debit || row.Debit || '';

                            // Validar data - se não tem data válida, pular
                            if (!dateStr || dateStr.trim() === '') {
                                console.warn(`⚠️ Linha ${lineNum} ignorada (sem data)`);
                                continue;
                            }

                            // Validar formato de data (aceita YYYY-MM-DD ou DD/MM/YYYY)
                            const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) || /^\d{2}\/\d{2}\/\d{2,4}$/.test(dateStr);
                            if (!isValidDate) {
                                const error = `❌ Linha ${lineNum}: Data inválida "${dateStr}"`;
                                console.error(error);
                                errors.push(error);
                                continue;
                            }

                            // Função para converter valor, detectando automaticamente o formato
                            const parseValue = (valueStr: string): number => {
                                if (!valueStr || valueStr.trim() === '') return 0;

                                const cleaned = valueStr.toString().replace('R$', '').trim();

                                // Detectar formato: se tem vírgula, é formato BR (1.234,56)
                                // Se tem apenas ponto, é formato US (1234.56)
                                if (cleaned.includes(',')) {
                                    // Formato brasileiro: 1.234,56
                                    return parseFloat(
                                        cleaned
                                            .replace(/\./g, '')  // Remove pontos de milhar
                                            .replace(',', '.')   // Troca vírgula por ponto
                                    );
                                } else {
                                    // Formato americano/internacional: 1234.56 ou 1,234.56
                                    return parseFloat(
                                        cleaned.replace(/,/g, '')  // Remove vírgulas de milhar
                                    );
                                }
                            };

                            // Processar valores de crédito e débito
                            const creditValue = parseValue(creditStr);
                            const debitValue = parseValue(debitStr);

                            // Determinar se é entrada ou saída
                            let amount = 0;
                            let isIncome = false;

                            if (creditValue > 0 && debitValue > 0) {
                                // Se ambos têm valor, usar o maior
                                if (creditValue > debitValue) {
                                    amount = creditValue;
                                    isIncome = true;
                                } else {
                                    amount = debitValue;
                                    isIncome = false;
                                }
                            } else if (creditValue > 0) {
                                amount = creditValue;
                                isIncome = true;
                            } else if (debitValue > 0) {
                                amount = debitValue;
                                isIncome = false;
                            } else {
                                const error = `❌ Linha ${lineNum}: Nenhum valor válido em credit ou debit`;
                                console.error(error);
                                errors.push(error);
                                continue;
                            }

                            // Validar se o parsing foi bem-sucedido
                            if (isNaN(amount) || amount === 0) {
                                const error = `❌ Linha ${lineNum}: Erro ao parsear valores (credit: "${creditStr}", debit: "${debitStr}")`;
                                console.error(error);
                                errors.push(error);
                                continue;
                            }

                            // Formatar data para YYYY-MM-DD se necessário
                            let formattedDate = dateStr;
                            if (dateStr.includes('/')) {
                                const [d, m, y] = dateStr.split('/');
                                const year = y.length === 2 ? `20${y}` : y;
                                formattedDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                            }

                            // Definir type final baseado no resultado anterior
                            const type: 'credit' | 'debit' = isIncome ? 'credit' : 'debit';

                            transactions.push({
                                description: description || 'Transação Importada',
                                amount: Math.abs(amount),
                                date: formattedDate,
                                category: 'Geral',
                                confidence: 'high' as 'high' | 'low',
                                isIncome: isIncome,
                                type: type
                            });

                            console.log(`✅ Linha ${lineNum}: ${description} - ${isIncome ? '+' : '-'}${Math.abs(amount).toFixed(2)}`);

                        } catch (error: any) {
                            const errorMsg = `❌ Linha ${lineNum}: Erro inesperado - ${error.message}`;
                            console.error(errorMsg);
                            errors.push(errorMsg);
                            // Continua para próxima linha
                        }
                    }

                    if (transactions.length === 0) {
                        const errorSummary = errors.length > 0
                            ? `\n\nErros encontrados:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... e mais ${errors.length - 5} erros` : ''}`
                            : '';
                        reject(new Error(`Nenhuma transação válida encontrada no CSV.${errorSummary}`));
                        return;
                    }

                    console.log(`\n📊 Resumo do parsing CSV:`);
                    console.log(`✅ ${transactions.length} transações extraídas`);
                    if (errors.length > 0) {
                        console.log(`⚠️ ${errors.length} linhas com erro (veja logs acima)`);
                    }

                    resolve(transactions);

                } catch (error: any) {
                    console.error('❌ Erro fatal no parser CSV:', error);
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

                        const isIncome = amount > 0;
                        return {
                            description: description || 'Transação Importada',
                            amount: isNaN(amount) ? 0 : Math.abs(amount),
                            date: formattedDate,
                            category: 'Geral',
                            confidence: 'high' as 'high' | 'low',
                            isIncome: isIncome,
                            type: (isIncome ? 'credit' : 'debit') as 'credit' | 'debit',
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

                const descUpper = desc.toUpperCase();
                let type: 'credit' | 'debit';

                if (descUpper.includes('PIX RECEBIDO')) {
                    type = 'credit';
                } else if (descUpper.includes('PIX ENVIADO') || descUpper.includes('DEBITO') || descUpper.includes('BOLETO')) {
                    type = 'debit';
                } else {
                    type = amount > 0 ? 'credit' : 'debit';
                }

                transactions.push({
                    description: desc.trim(),
                    amount: Math.abs(amount),
                    date: formattedDate,
                    category: 'Geral',
                    confidence: 'high',
                    isIncome: type === 'credit',
                    type: type
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