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
            # Requisito: Reject polygons that intersects with other polygons
            cons_val = """
            SELECT EXISTS (
                SELECT 1 FROM zonas_bajas_emisiones 
                WHERE st_intersects(geometria, st_geometryFromText(%s, %s))
            )
            """
            self.cur.execute(cons_val, [d['geometria_wkt'], EPSG_CODE])
            if self.cur.fetchone()[0]:
                resultado["message"] = "Reject polygons that intersects"
                self.disconnect()
                return resultado

            cons = """
            INSERT INTO zonas_bajas_emisiones (nombre, geometria)
            VALUES (%s, st_snapToGrid(st_geometryFromText(%s, %s), 0.0001))
            RETURNING id
            """
            self.cur.execute(cons, [d['nombre'], d['geometria_wkt'], EPSG_CODE])
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