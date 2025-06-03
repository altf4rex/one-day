CREATE TABLE countries(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_id INT NOT NULL REFERENCES countries(id) ON DELETE CASCADE ON UPDATE CASCADE,
    importance INT,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);
-- индекс для ускорения поиска городов по стране
CREATE INDEX idx_cities_country_id ON cities (country_id);