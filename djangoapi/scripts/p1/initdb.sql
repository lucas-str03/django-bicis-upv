CREATE EXTENSION postgis;

-- 1. Estaciones de Valenbisi (Puntos)
CREATE TABLE estaciones_valenbisi (
    id SERIAL PRIMARY KEY,
    numero INTEGER,
    direccion VARCHAR(200),
    bicis_disponibles INTEGER,
    espacios_libres INTEGER,
    fecha_actualizacion TIMESTAMP,
    geometria GEOMETRY(Point, 25830)
);

-- 2. Carriles Bici (Líneas)
CREATE TABLE carriles_bici (
    id SERIAL PRIMARY KEY,
    nombre_calle VARCHAR(200),
    tipo_via VARCHAR(50),
    anchura_m FLOAT,
    pavimento VARCHAR(50),
    estado VARCHAR(50),
    geometria GEOMETRY(LineString, 25830)
);

-- 3. Barrios (Polígonos)
CREATE TABLE barrios (
    id SERIAL PRIMARY KEY,
    nombre_barrio VARCHAR(100),
    nivel_restriccion VARCHAR(50),
    poblacion INTEGER,
    superficie_m2 FLOAT,
    objetivo_co2 FLOAT,
    geometria GEOMETRY(Polygon, 25830)
);