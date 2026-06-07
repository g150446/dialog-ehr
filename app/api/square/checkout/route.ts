import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Production,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount = 100, paymentType } = body;

    const checkoutParams: any = {
      amountMoney: {
        amount: BigInt(amount),
        currency: 'JPY',
      },
      deviceOptions: {
        deviceId: process.env.SQUARE_DEVICE_ID,
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      referenceId: `ehr-${Date.now()}`,
    };

    if (paymentType === 'SUICA') {
      checkoutParams.paymentType = 'FELICA_TRANSPORTATION_GROUP';
    }

    const response = await client.terminal.checkouts.create({
      idempotencyKey: randomUUID(),
      checkout: checkoutParams,
    });

    const checkout = response.checkout;
    return NextResponse.json({
      checkoutId: checkout?.id,
      status: checkout?.status,
      amount: Number(checkout?.amountMoney?.amount),
      currency: checkout?.amountMoney?.currency,
    });
  } catch (error: any) {
    console.error('Square checkout error:', error);
    const message = error?.errors?.[0]?.detail || error?.message || '決済リクエストに失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
