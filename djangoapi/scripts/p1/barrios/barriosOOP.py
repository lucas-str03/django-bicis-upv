from psycopg.rows import dict_row
from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE

class BarriosOOP():
    def __init__(self):
        self.conn = connect()
        self.cur = self.conn.cursor()

    def disconnect(self):
        self.cur.close()
        self.conn.close()

    def insert(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            cons_val = """
            SELECT EXISTS (
                SELECT 1 FROM barrios 
                WHERE st_intersects(geometria, st_geometryFromText(%s, %s))
            )
            """
            self.cur.execute(cons_val, [d['geometria_wkt'], EPSG_CODE])
            if self.cur.fetchone()[0]:
                resultado["message"] = "Reject polygons that intersects"
                self.disconnect()
                return resultado

            cons = """
            INSERT INTO barrios 
                (codigo_distrito_barrio, nombre_barrio, codigo_distrito, codigo_barrio, area_m2, geometria)
            VALUES 
                (%s, %s, %s, %s, %s, st_snapToGrid(st_geometryFromText(%s, %s), 0.0001))
            RETURNING id
            """
            self.cur.execute(cons, [
                d['codigo_distrito_barrio'], 
                d['nombre'], 
                d['codigo_distrito'], 
                d['codigo_barrio'], 
                d['area'], 
                d['geometria_wkt'], 
                EPSG_CODE
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
            print("Inserted")
        return resultado

    def selectAsDicts(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor(row_factory=dict_row)
            cons = """
            SELECT id, codigo_distrito_barrio, nombre_barrio, codigo_distrito, codigo_barrio, area_m2, st_astext(geometria) as geom 
            FROM barrios WHERE id = %s
            """
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
            cons = """
            SELECT id, codigo_distrito_barrio, nombre_barrio, codigo_distrito, codigo_barrio, area_m2, st_astext(geometria) 
            FROM barrios WHERE id = %s
            """
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
            cons = "DELETE FROM barrios WHERE id = %s"
            self.cur.execute(cons, [d['id']])
            borrados = self.cur.rowcount 
            self.conn.commit()
            resultado["ok"] = True
            resultado["message"] = "Data deleted"
            resultado["data"] = [{"rows_deleted": borrados}]
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
            cons = """
            UPDATE barrios 
            SET codigo_distrito_barrio = %s, nombre_barrio = %s, codigo_distrito = %s, codigo_barrio = %s, area_m2 = %s 
            WHERE id = %s
            """
            self.cur.execute(cons, [
                d['codigo_distrito_barrio'], 
                d['nombre'], 
                d['codigo_distrito'], 
                d['codigo_barrio'], 
                d['area'], 
                d['id']
            ])
            actualizados = self.cur.rowcount
            self.conn.commit()
            resultado["ok"] = True
            resultado["message"] = "Data updated"
            resultado["data"] = [{"rows_updated": actualizados}]
        except Exception as e:
            self.conn.rollback()
            resultado["message"] = str(e)
        finally:
            self.disconnect()
        return resultado