from psycopg.rows import dict_row
from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE
import datetime

class EstacionesOOP():
    def __init__(self):
        self.conn = connect()
        self.cur = self.conn.cursor()

    def disconnect(self):
        self.cur.close()
        self.conn.close()

    def insert(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            lon = round(d['lon'], 4)
            lat = round(d['lat'], 4)
            punto_texto = f"POINT({lon} {lat})"

            # NUEVO: 1. Validación de geometría (ST_IsValid)
            cons_valid = "SELECT ST_IsValid(ST_GeometryFromText(%s, %s))"
            self.cur.execute(cons_valid, [punto_texto, EPSG_CODE])
            if not self.cur.fetchone()[0]:
                self.disconnect()
                return {"ok": False, "message": "Reject: Geometría inválida (ST_IsValid)", "data": None}

            # 2. Validación de polígono (ST_Within)
            cons_val = """
            SELECT EXISTS (
                SELECT 1 FROM barrios 
                WHERE ST_Within(ST_GeometryFromText(%s, %s), geometria)
            )
            """
            self.cur.execute(cons_val, [punto_texto, EPSG_CODE])
            if not self.cur.fetchone()[0]:
                self.disconnect()
                return {"ok": False, "message": "Reject: Point must be inside a polygon (st_within)", "data": None}

            # 3. Inserción
            cons = """
            INSERT INTO estaciones_valenbisi 
                (numero, direccion, activo, bicis_disponibles, espacios_libres, espacios_totales, fecha_actualizacion, geometria)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, st_geometryFromText(%s, %s))
            RETURNING id
            """
            self.cur.execute(cons, [
                d['numero'], d['direccion'], d['activo'], d['bicis'], 
                d['espacios_libres'], d['espacios_totales'], 
                d.get('fecha', datetime.datetime.now()), punto_texto, EPSG_CODE
            ])
            self.conn.commit()
            l = self.cur.fetchall()
            resultado["ok"] = True
            resultado["message"] = "Data inserted"
            resultado["data"] = [{"id": l[0][0]}]

        except Exception as e:
            self.conn.rollback()
            resultado["message"] = str(e)
        finally:
            self.disconnect()
        return resultado

    def selectAsDicts(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor(row_factory=dict_row)
            cons = "SELECT id, numero, direccion, activo, bicis_disponibles, espacios_libres, espacios_totales, fecha_actualizacion, st_astext(geometria) as geom FROM estaciones_valenbisi WHERE id = %s"
            self.cur.execute(cons, [d['id']])
            l = self.cur.fetchall()
            if l:
                resultado["ok"] = True
                resultado["message"] = "Data retrieved"
                resultado["data"] = l
            else:
                resultado["message"] = "ID not found"
                resultado["data"] = []
        except Exception as e:
            resultado["message"] = str(e)
        finally:
            self.disconnect()
        return resultado

    def selectAsTuples(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor()
            cons = "SELECT id, numero, direccion, activo, bicis_disponibles, espacios_libres, espacios_totales, fecha_actualizacion, st_astext(geometria) FROM estaciones_valenbisi WHERE id = %s"
            self.cur.execute(cons, [d['id']])
            l = self.cur.fetchall()
            if l:
                resultado["ok"] = True
                resultado["message"] = "Data retrieved"
                resultado["data"] = l
            else:
                resultado["message"] = "ID not found"
                resultado["data"] = []
        except Exception as e:
            resultado["message"] = str(e)
        finally:
            self.disconnect()
        return resultado

    def delete(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor()
            cons = "DELETE FROM estaciones_valenbisi WHERE id = %s"
            self.cur.execute(cons, [d['id']])
            self.conn.commit()
            resultado["ok"] = True
            resultado["message"] = "Data deleted"
            resultado["data"] = [{"rows_deleted": self.cur.rowcount}]
        except Exception as e:
            self.conn.rollback()
            resultado["message"] = str(e)
        finally:
            self.disconnect()
        return resultado

    def update(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor()
            
            # NUEVO: El update también redondea y guarda la posición
            lon = round(d['lon'], 4)
            lat = round(d['lat'], 4)
            punto_texto = f"POINT({lon} {lat})"

            cons = """
            UPDATE estaciones_valenbisi 
            SET activo = %s, bicis_disponibles = %s, espacios_libres = %s, fecha_actualizacion = %s,
                geometria = st_geometryFromText(%s, %s)
            WHERE id = %s
            """
            self.cur.execute(cons, [
                d['activo'], d['bicis'], d['espacios_libres'], 
                d.get('fecha', datetime.datetime.now()), punto_texto, EPSG_CODE, d['id']
            ])
            self.conn.commit()
            resultado["ok"] = True
            resultado["message"] = "Data updated"
            resultado["data"] = [{"rows_updated": self.cur.rowcount}]
        except Exception as e:
            self.conn.rollback()
            resultado["message"] = str(e)
        finally:
            self.disconnect()
        return resultado