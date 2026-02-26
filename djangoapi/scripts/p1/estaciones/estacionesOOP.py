from psycopg.rows import dict_row
from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE

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
            # 1. Redondeo a 4 decimales (Requisito del PDF)
            lon = round(d['lon'], 4)
            lat = round(d['lat'], 4)
            punto_texto = f"POINT({lon} {lat})"

            # 2. VALIDACIÓN ESPACIAL (Requisito: Punto dentro de Polígono)
            # Comprobamos si el punto cae en alguna de tus 'zonas_bajas_emisiones'
            cons_val = """
            SELECT EXISTS (
                SELECT 1 FROM zonas_bajas_emisiones 
                WHERE ST_Within(ST_GeometryFromText(%s, %s), geometria)
            )
            """
            self.cur.execute(cons_val, [punto_texto, EPSG_CODE])
            if not self.cur.fetchone()[0]:
                self.disconnect()
                return {"ok": False, "message": "Reject: Point must be inside a polygon (st_within)", "data": None}

            # 3. Inserción real (tu código original)
            cons = """
            INSERT INTO estaciones_valenbisi 
                (numero, direccion, bicis_disponibles, espacios_libres, fecha_actualizacion, geometria)
            VALUES
                (%s, %s, %s, %s, %s, st_geometryFromText(%s, %s))
            RETURNING id
            """
            self.cur.execute(cons, [
                d['numero'], 
                d['direccion'], 
                d['bicis'], 
                d['espacios'], 
                d['fecha'], 
                punto_texto, 
                EPSG_CODE
            ])
            
            self.conn.commit()
            l = self.cur.fetchall()
            nuevo_id = l[0][0]
            
            resultado["ok"] = True
            resultado["message"] = "Data inserted"
            resultado["data"] = [{"id": nuevo_id}]

        except Exception as e:
            if self.conn: self.conn.rollback()
            resultado["message"] = str(e)
        finally:
            self.disconnect()

        return resultado

    def selectAsDicts(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor(row_factory=dict_row)
            
            cons = """
            SELECT 
                id, numero, direccion, bicis_disponibles, espacios_libres, fecha_actualizacion, st_astext(geometria) as geom
            FROM 
                estaciones_valenbisi 
            WHERE
                id = %s
            """
            self.cur.execute(cons, [d['id']])
            l = self.cur.fetchall()
            
            if l:
                resultado["ok"] = True
                resultado["message"] = "Data retrieved"
                resultado["data"] = l # 'l' ya es una lista de diccionarios
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

    
    def selectAsTuples(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            # Cursor normal de psycopg devuelve tuplas (paréntesis) por defecto
            self.cur = self.conn.cursor()
            
            cons = """
            SELECT 
                id, numero, direccion, bicis_disponibles, espacios_libres, fecha_actualizacion, st_astext(geometria) as geom
            FROM 
                estaciones_valenbisi 
            WHERE
                id = %s
            """
            self.cur.execute(cons, [d['id']])
            l = self.cur.fetchall()
            
            if l:
                resultado["ok"] = True
                resultado["message"] = "Data retrieved"
                resultado["data"] = l # Esto será una lista con una tupla dentro: [(1, 101, 'Plaza', ...)]
            else:
                resultado["message"] = "ID not found"
                resultado["data"] = []
                
        except Exception as e:
            resultado["message"] = str(e)
        finally:
            self.disconnect()

        return resultado

    def update(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor()
            
            # Vamos a actualizar las bicis y los espacios libres de una estación concreta
            cons = """
            UPDATE estaciones_valenbisi 
            SET bicis_disponibles = %s, espacios_libres = %s, fecha_actualizacion = %s
            WHERE id = %s
            """
            self.cur.execute(cons, [
                d['bicis'], 
                d['espacios'], 
                d['fecha'],
                d['id'] # El ID de la estación que queremos modificar
            ])
            
            actualizados = self.cur.rowcount # Cuenta cuántas filas se han modificado
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
    