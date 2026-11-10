import { Router } from 'express';
import { orderInput, type OrderInput } from '../../shared/schemas.js';
import { validate } from '../middleware/validate.js';
import { supabase } from '../lib/supabase.js';
import { buildOrderMessage, waLink } from '../lib/whatsapp.js';
import { PAYMENT_LABEL, priceOrder } from '../lib/orders.js';

const router = Router();

router.post('/', validate(orderInput), async (req, res, next) => {
  try {
    const input = req.body as OrderInput;
    if (input.website) return res.status(400).json({ error: { code: 'spam', message: 'Solicitud inválida' } });

    const ids = [...new Set(input.items.map((i) => i.productId))];
    const [{ data: products, error }, { data: settings, error: sErr }] = await Promise.all([
      supabase.from('products').select('*, product_variants(*)').in('id', ids),
      supabase.from('store_settings').select('*').eq('id', 1).single(),
    ]);
    if (error) throw error;
    if (sErr) throw sErr;

    const priced = priceOrder(input, (products ?? []) as any, settings);
    const isDelivery = input.delivery.method === 'domicilio';
    const d = input.delivery as any;

    // 1) Insertar el pedido para obtener el código generado por la secuencia
    const { data: order, error: oErr } = await supabase.from('orders').insert({
      customer_name: input.customer.name, customer_phone: input.customer.phone,
      customer_email: input.customer.email || null, customer_document: input.customer.document || null,
      company_name: input.customer.companyName || null, delivery_method: input.delivery.method,
      address: isDelivery ? d.address : null, neighborhood: isDelivery ? d.neighborhood : null, city: isDelivery ? d.city : null,
      preferred_date: input.preferredDate ?? null, payment_method: input.paymentMethod, notes: input.notes ?? null,
      subtotal_cop: priced.subtotal, delivery_fee_cop: priced.deliveryFee, total_cop: priced.total,
      has_price_on_request: priced.hasPriceOnRequest, whatsapp_message: '',
    }).select('id, code, created_at').single();
    if (oErr) throw oErr;

    // 2) Líneas del pedido
    const { error: iErr } = await supabase.from('order_items').insert(priced.lines.map((l) => ({
      order_id: order.id, product_id: l.productId, catalog_slug: l.catalogSlug, product_name: l.name,
      variant_name: l.variantName, unit_label: l.unitLabel, unit_price_cop: l.unitPrice,
      quantity: l.quantity, line_total_cop: l.lineTotal,
    })));
    if (iErr) { await supabase.from('orders').delete().eq('id', order.id); throw iErr; }

    // 3) Mensaje y enlace
    const message = buildOrderMessage({
      code: order.code, createdAt: new Date(order.created_at), customer: input.customer, deliveryText: priced.deliveryText,
      preferredDate: input.preferredDate, lines: priced.lines, subtotal: priced.subtotal, deliveryFee: priced.deliveryFee,
      total: priced.total, hasPriceOnRequest: priced.hasPriceOnRequest, paymentMethod: PAYMENT_LABEL[input.paymentMethod],
      notes: input.notes, footer: settings.order_message_footer,
    });
    await supabase.from('orders').update({ whatsapp_message: message }).eq('id', order.id);

    res.status(201).json({ data: { code: order.code, total: priced.total, whatsappUrl: waLink(settings.whatsapp_number, message) } });
  } catch (e) { next(e); }
});

export default router;
