-- FUNÇÃO DE INSERÇÃO DE TRANSAÇÃO (ROBUSTA)
-- Esta função deve ser executada no SQL Editor do Supabase Dashboard.

CREATE OR REPLACE FUNCTION insert_transaction(
  p_user_id UUID,
  p_description TEXT,
  p_amount NUMERIC,
  p_type TEXT,
  p_date DATE,
  p_category TEXT DEFAULT 'Outros',
  p_card_id UUID DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_installments_current INTEGER DEFAULT 1,
  p_installments_total INTEGER DEFAULT 1
) RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Inserir a transação
  INSERT INTO transactions (
    user_id, 
    description, 
    amount, 
    type, 
    date, 
    time,
    category, 
    card_id, 
    payment_method,
    installments_current, 
    installments_total
  ) VALUES (
    p_user_id, 
    p_description, 
    p_amount, 
    p_type, 
    p_date, 
    CURRENT_TIME,
    p_category, 
    p_card_id,
    p_payment_method,
    p_installments_current, 
    p_installments_total
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true, 
    'id', v_transaction_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM, 
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário: A permissão SECURITY DEFINER permite que a função
-- ignore as políticas de RLS para a inserção, mas use o UUID do usuário autenticado.
-- Certifique-se de que a tabela 'transactions' existe e tem as colunas corretas.
