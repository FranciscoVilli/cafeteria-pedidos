"use server";
/**
 * Acciones del carrito y de los pedidos. Las del carrito son públicas (no escriben en la base);
 * confirmar exige sesión de cliente.
 *
 * @module acciones/pedidos
 */
import { revalidatePath } from "next/cache";
import type { ResumenCarrito } from "@/lib/aplicacion/pedido-servicio";
import { aCantidad, sanear, type Carrito } from "@/lib/dominio/carrito";
import { EntidadNoEncontradaError } from "@/lib/dominio/errores";
import { servicios } from "@/lib/servicios";
import { exigirCliente } from "@/lib/sesion";
import { ejecutar, type Resultado } from "./resultado";

/** Agrega un producto al carrito validando cantidad y disponibilidad (HU-02). */
export async function agregarAlCarrito(carrito: unknown, codigo: string, cantidad: string | number): Promise<Resultado<Carrito>> {
  return ejecutar(() => servicios().pedidos.agregarAlCarrito(sanear(carrito), codigo, aCantidad(cantidad)));
}

/** Cambia la cantidad de una línea (HU-03, escenario 2). */
export async function cambiarCantidad(carrito: unknown, codigo: string, cantidad: string | number): Promise<Resultado<Carrito>> {
  return ejecutar(() => servicios().pedidos.cambiarCantidad(sanear(carrito), codigo, aCantidad(cantidad)));
}

/** Devuelve el carrito con precios vigentes, subtotales y total (HU-03). */
export async function resumirCarrito(carrito: unknown): Promise<Resultado<ResumenCarrito>> {
  return ejecutar(() => servicios().pedidos.resumirCarrito(sanear(carrito)));
}

/** Confirma el pedido del cliente con sesión iniciada (HU-04). */
export async function confirmarPedido(carrito: unknown): Promise<Resultado<{ codigoRetiro: string }>> {
  return ejecutar(async () => {
    const cliente = await exigirCliente();
    const pedido = await servicios().pedidos.confirmarPedido(sanear(carrito), cliente.codigo);
    revalidatePath("/personal");
    return { codigoRetiro: pedido.codigoRetiro };
  });
}

/** Busca un pedido por código de retiro para la página de seguimiento (HU-05). */
export async function buscarPorCodigo(codigo: string): Promise<Resultado<{ codigoRetiro: string }>> {
  return ejecutar(async () => {
    const limpio = (codigo ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(limpio)) {
      throw new EntidadNoEncontradaError("El código de retiro tiene 6 letras o números.");
    }
    const pedido = await servicios().pedidos.consultarPorCodigoRetiro(limpio);
    return { codigoRetiro: pedido.codigoRetiro };
  });
}
