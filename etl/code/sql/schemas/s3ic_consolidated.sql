DROP TABLE IF EXISTS etl.s3ic_consolidated;

CREATE TABLE etl.s3ic_consolidated
(
    id SERIAL PRIMARY KEY,
    code_s3ic VARCHAR(255),
    x NUMERIC(10,0),
    y NUMERIC(10,0),
    epsg NUMERIC(10,0),
    nom_ets VARCHAR(255),
    num_dep VARCHAR(255),
    cd_insee VARCHAR(255),
    cd_postal VARCHAR(255),
    nomcommune VARCHAR(255),
    code_naf VARCHAR(255),
    lib_naf VARCHAR(255),
    num_siret VARCHAR(255),
    regime VARCHAR(255),
    lib_regime VARCHAR(255),
    ippc NUMERIC(10,0),
    seveso VARCHAR(255),
    lib_seveso VARCHAR(255),
    famille_ic VARCHAR(255),
    url_fiche VARCHAR(255),
    rayon NUMERIC(10,0),
    precis_loc NUMERIC(10,0),
    lib_precis VARCHAR(255),
    geom geometry(Point),
    irep_identifiant VARCHAR(255),
    irep_nom_etablissement VARCHAR(255),
    irep_numero_siret VARCHAR(255),
    irep_adresse TEXT ,
    irep_code_postal VARCHAR(255),
    irep_commune VARCHAR(255),
    irep_departement VARCHAR(255),
    irep_region VARCHAR(255),
    irep_coordonnees_x NUMERIC(10,0),
    irep_coordonnees_y NUMERIC(10,0),
    irep_code_ape VARCHAR(255),
    irep_libelle_ape VARCHAR(255),
    irep_code_eprtr VARCHAR(255),
    irep_libelle_eprtr TEXT
);

CREATE INDEX num_siret_idx on etl.s3ic_consolidated (num_siret);
CREATE INDEX irep_numero_siret_idx on etl.s3ic_consolidated (irep_numero_siret);