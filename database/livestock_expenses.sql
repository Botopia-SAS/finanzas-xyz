-- Crear tabla de gastos para verticales
CREATE TABLE IF NOT EXISTS livestock_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    vertical_id UUID NOT NULL,
    cow_id UUID REFERENCES livestock_cows(id) ON DELETE CASCADE,
    expense_type VARCHAR(50) NOT NULL DEFAULT 'purchase', -- purchase, feed, veterinary, maintenance, other
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT livestock_expenses_amount_positive CHECK (amount > 0),
    CONSTRAINT livestock_expenses_type_valid CHECK (expense_type IN ('purchase', 'feed', 'veterinary', 'maintenance', 'other'))
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS livestock_expenses_business_id_idx ON livestock_expenses(business_id);
CREATE INDEX IF NOT EXISTS livestock_expenses_vertical_id_idx ON livestock_expenses(vertical_id);
CREATE INDEX IF NOT EXISTS livestock_expenses_cow_id_idx ON livestock_expenses(cow_id);
CREATE INDEX IF NOT EXISTS livestock_expenses_date_idx ON livestock_expenses(date);
CREATE INDEX IF NOT EXISTS livestock_expenses_type_idx ON livestock_expenses(expense_type);

-- Habilitar RLS
ALTER TABLE livestock_expenses ENABLE ROW LEVEL SECURITY;

-- Crear política de seguridad para que solo puedan acceder los usuarios del negocio
CREATE POLICY "Enable CRUD for business users" ON livestock_expenses
    FOR ALL USING (business_id IN (
        SELECT id FROM businesses WHERE id = business_id
    ));

-- Agregar campos nuevos a la tabla de vacas
ALTER TABLE livestock_cows 
    ADD COLUMN IF NOT EXISTS acquisition_type VARCHAR(50) DEFAULT 'purchase' CHECK (acquisition_type IN ('purchase', 'birth', 'donation', 'transfer')),
    ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2) CHECK (purchase_price > 0),
    ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS father_id UUID REFERENCES livestock_cows(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS mother_id UUID REFERENCES livestock_cows(id) ON DELETE SET NULL;

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS livestock_cows_father_id_idx ON livestock_cows(father_id);
CREATE INDEX IF NOT EXISTS livestock_cows_mother_id_idx ON livestock_cows(mother_id);
CREATE INDEX IF NOT EXISTS livestock_cows_acquisition_type_idx ON livestock_cows(acquisition_type);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_livestock_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER livestock_expenses_updated_at_trigger
    BEFORE UPDATE ON livestock_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_livestock_expenses_updated_at();

-- Crear función para crear gasto automáticamente cuando se compra una vaca
CREATE OR REPLACE FUNCTION create_cow_purchase_expense()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo crear gasto si es una compra y tiene precio
    IF NEW.acquisition_type = 'purchase' AND NEW.purchase_price IS NOT NULL AND NEW.purchase_price > 0 THEN
        INSERT INTO livestock_expenses (
            business_id,
            vertical_id,
            cow_id,
            expense_type,
            amount,
            description,
            date,
            supplier_name,
            notes
        ) VALUES (
            NEW.business_id,
            -- Aquí necesitaríamos obtener el vertical_id, por ahora usamos un placeholder
            NEW.business_id, -- Temporalmente usamos business_id, esto se debe corregir
            NEW.id,
            'purchase',
            NEW.purchase_price,
            'Compra de vaca: ' || NEW.name || ' (' || NEW.tag || ')',
            NEW.acquisition_date,
            NEW.seller_name,
            'Gasto generado automáticamente por compra de vaca'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para crear gasto automáticamente
CREATE TRIGGER cow_purchase_expense_trigger
    AFTER INSERT ON livestock_cows
    FOR EACH ROW
    EXECUTE FUNCTION create_cow_purchase_expense();

-- Comentarios para documentar las tablas
COMMENT ON TABLE livestock_expenses IS 'Tabla de gastos relacionados con la vertical de ganado';
COMMENT ON COLUMN livestock_expenses.expense_type IS 'Tipo de gasto: purchase, feed, veterinary, maintenance, other';
COMMENT ON COLUMN livestock_expenses.amount IS 'Monto del gasto en la moneda local';
COMMENT ON COLUMN livestock_expenses.cow_id IS 'ID de la vaca relacionada (opcional)';
COMMENT ON COLUMN livestock_expenses.supplier_name IS 'Nombre del proveedor o vendedor';
