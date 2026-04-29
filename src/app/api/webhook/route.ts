import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/services/customer.service';
import { MessageService } from '@/services/message.service';
import { OrderService } from '@/services/order.service';
import { extractQuantity } from '@/utils/parser';

export async function GET(req: NextRequest) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK_VERIFIED');
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // WhatsApp payload check
    if (body.object === 'whatsapp_business_account') {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const messageData = body.entry[0].changes[0].value.messages[0];
        const phoneNumber = messageData.from; // Sender phone number
        const text = messageData.text?.body || ''; // Message text

        console.log(`Received message from ${phoneNumber}: ${text}`);

        // Find or create customer
        const customer = await CustomerService.findOrCreate(phoneNumber);
        
        // Store message
        const storedMessage = await MessageService.store(customer.id, text, body);
        console.log(`Successfully stored message for customer ${customer.id}`);

        // Check for order quantity and create order if found
        const quantity = extractQuantity(text);
        if (quantity) {
          const order = await OrderService.createDraft(customer.id, storedMessage.id, quantity);
          console.log(`Successfully created pending order ${order.id} for ${quantity} items.`);
        }
      }

      return NextResponse.json({ received: true });
    } else {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
