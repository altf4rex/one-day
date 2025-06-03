CREATE TABLE wishes(
    id SERIAL PRIMARY KEY,
    city_id INT NOT NULL REFERENCES city(id) ON DELETE CASCADE ON UPDATE CASCADE,
    dscription TEXT, 
    todo TEXT,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
)

CREATE INDEX idx_wishes_country_id ON wishes (country_id);
CREATE INDEX idx_wishes_city_id ON wishes (city_id);
CREATE INDEX idx_wishes_country_priority ON wishes (country_id, priority);