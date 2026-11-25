"use server";
/**
 * Acciones del carrito. Son públicas: validan con el servidor pero no escriben en la base
 * (el carrito vive en el navegador, SUP-17).
 *
 * @module acciones/pedidos
 */
import { aCantidad, sanear, type Carrito } from "@/lib/dominio/carrito";
import { servicios } from "@/lib/servicios";
import { ejecutar, type Resultado } from "./resultado";

/** Agrega un producto al carrito validando cantidad y disponibilidad (HU-02). */
export async function agregarAlCarrito(carrito: unknown, codigo: string, cantidad: string | number): Promise<Resultado<Carrito>> {
  return ejecutar(() => servicios().pedidos.agregarAlCarrito(sanear(carrito), codigo, aCantidad(cantidad)));
}
