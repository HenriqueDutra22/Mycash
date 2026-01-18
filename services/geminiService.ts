
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
      
      CONTEXTO: A imagem pode ser um extrato bancário, fatura de cartão ou comprovante de Pix.
      
      REGRAS DE EXTRAÇÃO:
      1. IGNORE o resumo (total, limite, etc). Foque na LISTA de lançamentos.
      2. 'description': Nome do estabelecimento ou favorecido/pagador.
      3. 'amount': Valor numérico absoluto. Se houver parcelas (Ex: 99,90 Parcela 2/12), retorne 99.90.
      4. 'date': Formato YYYY-MM-DD.
      5. 'category': Atribua uma categoria (Saúde, Educação, Mercado, Lazer, Salário, Pix, Outros).
      6. 'confidence': 'high' ou 'low'.
      7. 'isIncome': BOOLEANO. true se for uma entrada (recebido, crédito, estorno, salário), false se for uma saída (pagamento, compra, Pix enviado).

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
