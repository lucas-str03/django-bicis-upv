from psycopg.rows import dict_row # dict_row le dice a psycopg que nos devuelva los datos como un Diccionario. Importante selectAsDicts
from myLib.connect import connect 
from myLib.p1Settings import EPSG_CODE # Código del sistema de coordenadas
import datetime # De pyrhn para trabajar con fechas y horas

class EstacionesOOP(): # Crear la clase Estaciones
    def __init__(self): # El constructor
        self.conn = connect() # Abre el acceso a PostGIS, dentro de Estaciones (e.)
        self.cur = self.conn.cursor()

    def disconnect(self): # Cierra tanto el acceso, como el mensaje. Para no colapsar PostGIS
        self.cur.close()
        self.conn.close()

    def insert(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            lon = round(d['lon'], 4) # Redondear a 4 lon y lat
            lat = round(d['lat'], 4)
            punto_texto = f"POINT({lon} {lat})" # Formato WKT, para escribir figuras geométricas con texto

            # NUEVO: 1. Validación de geometría (ST_IsValid)
            cons_valid = "SELECT ST_IsValid(ST_GeometryFromText(%s, %s))" # Coge el texto y lo hace espacial
            self.cur.execute(cons_valid, [punto_texto, EPSG_CODE])
            if not self.cur.fetchone()[0]: # Le pedimos q si no el "ok" es false, cierra la conexión, porque la geometría no es válida
                self.disconnect()
                return {"ok": False, "message": "Reject: Geometría inválida (ST_IsValid)", "data": None}

            # 2. Validación de polígono (ST_Within) comprobamos que el punto caiga dentro del polígono 
            cons_val = """
            SELECT EXISTS (
                SELECT 1 FROM barrios 
                WHERE ST_Within(ST_GeometryFromText(%s, %s), geometria)
            )
            """
            self.cur.execute(cons_val, [punto_texto, EPSG_CODE]) # Misma dinámica que antes 
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
            # Returning nos sirve para que no solo mete el valor, sino q tb nos diga su id
            self.cur.execute(cons, [
                d['numero'], d['direccion'], d['activo'], d['bicis'], 
                d['espacios_libres'], d['espacios_totales'], 
                d.get('fecha', datetime.datetime.now()), punto_texto, EPSG_CODE # Si no tiene fecha le pone una actual
            ])
            self.conn.commit()
            l = self.cur.fetchall() # Nos da el resultado guardado
            resultado["ok"] = True
            resultado["message"] = "Data inserted"
            resultado["data"] = [{"id": l[0][0]}]

        except Exception as e: # Si hay algún problema le decimos que corte y elimine, para volver de 0 al insert
            self.conn.rollback()
            resultado["message"] = str(e)
        finally: # Aunque haya algun problema, SIEMPRE se cerrará para evitar dejar nada corriendo
            self.disconnect()
        return resultado

    def selectAsDicts(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            self.cur = self.conn.cursor(row_factory=dict_row) # Devuelve como diccionario row_factory=dict_row
            # ST_astext nos devuelve legible la  gemoetría de PostGIS
            cons = "SELECT id, numero, direccion, activo, bicis_disponibles, espacios_libres, espacios_totales, fecha_actualizacion, st_astext(geometria) as geom FROM estaciones_valenbisi WHERE id = %s" 
            self.cur.execute(cons, [d['id']]) # Trae todas esas columnas, pero solo donde id sea exactamente el que te paso en (d['id'])
            l = self.cur.fetchall() # Nos devuelve todo, pero como buscamos por ID (que es único), la lista l solo tendrá un elemento
            if l:
                resultado["ok"] = True
                resultado["message"] = "Data retrieved"
                resultado["data"] = l
            else: # O el id vacío si no existe
                resultado["message"] = "ID not found"
                resultado["data"] = []
        except Exception as e: # Cierre de seguirdad de nuevo 
            resultado["message"] = str(e)
        finally:
            self.disconnect()
        return resultado

    # Las Tuples son más rápida de procesar que diccionarios, así que mejor si descargo muchas estaciones a la vez
    def selectAsTuples(self, d): # Lo mismo q el anterior, pero devolverá una Tupla sin etiquetas, solo por orden de cons
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
            cons = "DELETE FROM estaciones_valenbisi WHERE id = %s" # Borra SOLO la estación donde le digamos el id, sin el where borraría todo 
            self.cur.execute(cons, [d['id']])
            self.conn.commit() # De nuevo importante el comit en los select... no hace falta porq solo mira la DB, aquí modificamos (delete, insert, update)
            resultado["ok"] = True
            resultado["message"] = "Data deleted"
            resultado["data"] = [{"rows_deleted": self.cur.rowcount}] # Como no se puede fetchone() ni fetchall(), porq hemos borrado podemos ver las filas afectadas
        except Exception as e: # Sistema de segurira. Si algo falla vuelve al principio y desconecta
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
            # En caso de un cambio de la localización de la estacion es necesario y redondearlas de nuevo.
            lon = round(d['lon'], 4)
            lat = round(d['lat'], 4)
            punto_texto = f"POINT({lon} {lat})"

            cons = """
            UPDATE estaciones_valenbisi 
            SET activo = %s, bicis_disponibles = %s, espacios_libres = %s, fecha_actualizacion = %s,
                geometria = st_geometryFromText(%s, %s)
            WHERE id = %s 
            """
            # MUY importante de nuevo el where para no moficicar todas las estaciones, y solo la del id
            self.cur.execute(cons, [
                d['activo'], d['bicis'], d['espacios_libres'], 
                d.get('fecha', datetime.datetime.now()), punto_texto, EPSG_CODE, d['id'] # Importante el orden de las variables, id esta vez último
            ])
            # "Informe" de lo actualizado y el rollback
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