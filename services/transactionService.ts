
import { supabase } from './supabase';

export interface CreateTransactionParams {
    p_user_id: string;
    p_description: string;
    p_amount: number;
    p_type: 'credit' | 'debit';
    p_date: string;
    p_category?: string;
    p_card_id?: string;
}

/**
 * Gerado conforme solicitação:
 * - Chama supabase.rpc("insert_transaction", ...)
 * - Não calcula saldo nem altera sinal
 * - Trata erros
 */
export const createTransaction = async (params: CreateTransactionParams) => {
    try {
        const { data, error } = await supabase.rpc('insert_transaction', params);

        if (error) {
            console.error('❌ Erro RPC insert_transaction:', error);
            throw error;
        }

        return data;
    } catch (error: any) {
        console.error('❌ Erro inesperado ao criar transação:', error.message);
        throw error;
    }
};
