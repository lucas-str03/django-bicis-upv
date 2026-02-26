from psycopg.rows import dict_row
from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE

class CarrilesOOP():
    def __init__(self):
        self.conn = connect()
        self.cur = self.conn.cursor()

    def disconnect(self):
        self.cur.close()
        self.conn.close()

    def insert(self, d):
        # Requisito: Diccionario de respuesta
        resultado = {"ok": False, "message": "", "data": None}
        
        try:
            # Requisito: Validar que no se crucen (Intersects)
            # Usamos st_geometryFromText como hace el profesor en su ejemplo
            cons_val = """
            SELECT EXISTS (
                SELECT 1 FROM carriles_bici 
                WHERE st_intersects(geometria, st_geometryFromText(%s, %s))
            )
            """
            self.cur.execute(cons_val, [d['geometria_wkt'], EPSG_CODE])
            if self.cur.fetchone()[0]:
                resultado["message"] = "Reject linestrings than intersects"
                self.disconnect()
                return resultado

            # Inserción siguiendo el estilo exacto del profesor
            cons = """
            INSERT INTO carriles_bici 
                (nombre_calle, longitud_metros, geometria)
            VALUES
                (%s, %s, st_snapToGrid(st_geometryFromText(%s, %s), 0.0001))
            RETURNING id
            """
            # El snapToGrid cumple el requisito de redondear a 0.0001
            self.cur.execute(cons, [
                d['nombre'], 
                d['longitud'], 
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
            print("Inserted") # Como en el ejemplo del profe
            
        return resultado

    def selectAsDicts(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            # Estilo profesor: row_factory para dicts
            self.cur = self.conn.cursor(row_factory=dict_row)
            
            cons = """
            SELECT id, nombre_calle, longitud_metros, st_astext(geometria) as geom
            FROM carriles_bici 
            WHERE id = %s
            """
            self.cur.execute(cons, [d['id']])
            l = self.cur.fetchall()
            
            resultado["ok"] = True
            resultado["message"] = "Data retrieved"
            resultado["data"] = l
            
        except Exception as e:
            resultado["message"] = str(e)
        finally:
            self.disconnect()
            print("Selected")
            
        return resultado