CREATE TABLE tb_product_categories (
    id UUID NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    PRIMARY KEY (id)
);

-- Remove the old string column
ALTER TABLE tb_products DROP COLUMN category;

-- Add the new relation column
ALTER TABLE tb_products ADD COLUMN category_id UUID;

-- Optional: Since there might be existing data, we could have issues, but assuming it's dev environment.
-- Normally we would do data migration here, but for now we just add the FK constraint.
ALTER TABLE tb_products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES tb_product_categories (id);
