
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Lazy initialization - only create the AI instance when needed
let genAI: GoogleGenerativeAI | null = null;

const getAI = () => {
  if (!genAI) {
    const apiKey = (process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY) as string;

    if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey === '') {
      console.error('❌ Gemini API key is missing or invalid.');
      throw new Error('Chave de API do Gemini não encontrada. Certifique-se de que GEMINI_API_KEY ou VITE_GEMINI_API_KEY está definida no seu .env.local');
    }

    console.log('✅ Gemini API Key identified (Length:', apiKey.length, ')');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export interface ExtractedTransaction {
  description: string;
  amount: number;
  date: string;
  category: string;
  confidence: 'high' | 'low';
  isIncome?: boolean;
}

export const scanReceipt = async (base64Image: string): Promise<ExtractedTransaction[]> => {
  try {
    const model = getAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              description: { type: SchemaType.STRING },
              amount: { type: SchemaType.NUMBER },
              date: { type: SchemaType.STRING },
              category: { type: SchemaType.STRING },
              confidence: { type: SchemaType.STRING },
              isIncome: { type: SchemaType.BOOLEAN }
            },
            required: ['description', 'amount', 'date', 'category', 'confidence', 'isIncome']
          }
        }
      }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image.split(',')[1] || base64Image
        }
      },
      `Você é um assistente financeiro de elite especializado em extratos bancários brasileiros.
      
      OBJETIVO: Extrair TODAS as transações financeiras (Entradas e Saídas) da imagem.
      
      CONTEXTO: A imagem é um extrato bancário (ex: Santander) com colunas de "Data", "Descrição", "Crédito (R$)", "Débito (R$)" e "Saldo (R$)".
      
      REGRAS DE EXTRAÇÃO:
      1. IGNORE o resumo superior. Foque na TABELA de lançamentos.
      2. 'description': Nome fiel ao extrato. Ex: "PIX RECEBIDO...", "DEBITO VISA...", "REMUNERACAO APLICACAO...".
      3. 'amount': Valor numérico absoluto (sempre positivo no JSON). 
         - Se houver valor na coluna "Débito", extraia esse valor.
         - Se houver valor na coluna "Crédito", extraia esse valor.
         - Remova símbolos monetários e converta vírgula para ponto.
      4. 'date': Formato YYYY-MM-DD. Use o ano do período (ex: 2026).
      5. 'category': Atribua uma categoria (Mercado, Lazer, Salário, Investimento, Pix, Outros).
      6. 'confidence': 'high' ou 'low'.
      7. 'isIncome': BOOLEANO. 
         - 'true' se o valor estiver na coluna "Crédito" OU a descrição for "PIX RECEBIDO" ou "REMUNERACAO".
         - 'false' se o valor estiver na coluna "Débito" OU a descrição for "PIX ENVIADO", "DEBITO VISA", "PAGAMENTO".

      Retorne APENAS o JSON.`
    ]);

    const response = await result.response;
    const text = response.text();
    console.log('🤖 AI Debug:', text);

    const parsed = JSON.parse(text || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("❌ Gemini Error:", e);
    throw e;
  }
};
