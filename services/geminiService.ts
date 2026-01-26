
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
  type?: 'credit' | 'debit';
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
      
      CONTEXTO: A imagem é um extrato bancário (ex: Santander) com colunas: "Data", "Descrição", "Docto", "Situação", "Crédito (R$)", "Débito (R$)" e "Saldo (R$)".
      
      REGRAS CRÍTICAS DE EXTRAÇÃO:
      1. IGNORE o resumo superior. Foque na TABELA de lançamentos.
      2. 'description': Nome fiel ao extrato. Ex: "PIX RECEBIDO PULSE...", "DEBITO VISA...".
      3. 'amount': Valor numérico absoluto (Sempre positivo). 
         - SE o valor estiver alinhado abaixo de "Débito (R$)", ele é uma SAÍDA.
         - SE o valor estiver alinhado abaixo de "Crédito (R$)", ele é uma ENTRADA.
         - IMPORTANTE: No Santander, o Débito pode aparecer com sinal negativo (ex: -26,62), extraia 26.62 e marque isIncome: false.
      4. 'date': Formato YYYY-MM-DD. Use o ano corrente ou do período (ex: 2026).
      5. 'category': Atribua uma categoria lógica.
      6. 'isIncome': BOOLEANO. 
         - 'true' se o valor for CRÉDITO, RENDIMENTO ou PIX RECEBIDO.
         - 'false' se o valor for DÉBITO, PAGAMENTO ou PIX ENVIADO.

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
