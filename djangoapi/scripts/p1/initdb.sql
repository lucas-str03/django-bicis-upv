CREATE EXTENSION postgis;

-- 1. Estaciones de Valenbisi (Puntos)
DROP TABLE IF EXISTS public.estaciones_valenbisi;

CREATE TABLE public.estaciones_valenbisi
(
    id serial PRIMARY KEY,
    numero integer,
    direccion character varying(200),
    activo character varying(10),
    bicis_disponibles integer,
    espacios_libres integer,
    espacios_totales integer,
    fecha_actualizacion timestamp without time zone,
    geometria geometry(Point, 25830)
);

-- 2. Carriles Bici (Líneas)
DROP TABLE IF EXISTS public.carriles_bici;

CREATE TABLE public.carriles_bici
(
    id serial PRIMARY KEY,
    objectid integer,
    tipo character varying(100),
    longitud_metros numeric,
    fecha_actualizacion timestamp without time zone,
    geometria geometry(LineString, 25830)
);


-- 3. Barrios (Polígonos)
DROP TABLE IF EXISTS public.barrios;

CREATE TABLE public.barrios
(
    id serial PRIMARY KEY,
    codigo_distrito_barrio integer,
    nombre_barrio character varying(200),
    codigo_distrito integer,
    codigo_barrio integer,
    area_m2 numeric,
    geometria geometry(Polygon, 25830)
);

