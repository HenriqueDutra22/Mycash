-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);

-- Cards Policies
DROP POLICY IF EXISTS "Users can view their own cards" ON cards;
CREATE POLICY "Users can view their own cards" ON cards FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cards" ON cards;
CREATE POLICY "Users can insert their own cards" ON cards FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards" ON cards;
CREATE POLICY "Users can delete their own cards" ON cards FOR DELETE USING (auth.uid() = user_id);

-- Goals Policies
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
CREATE POLICY "Users can view their own goals" ON goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
CREATE POLICY "Users can insert their own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;
CREATE POLICY "Users can delete their own goals" ON goals FOR DELETE USING (auth.uid() = user_id);
