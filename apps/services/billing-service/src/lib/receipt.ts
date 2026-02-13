import { create } from 'xmlbuilder2';

export interface CustomerForReceipt {
  firstName: string;
  lastName: string;
  email: string;
}

export interface InvoiceForReceipt {
  invoiceNumber: string;
  totalAmount: number;
}

export interface PaymentForReceipt {
  paymentId: string;
  amount: number;
  method: string;
  transactionRef: string;
  processedAt: Date;
}

export function generatePaymentReceipt(
  payment: PaymentForReceipt,
  invoice: InvoiceForReceipt,
  customer: CustomerForReceipt,
): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('receipt')
    .ele('company')
    .ele('name')
    .txt('TelecomNexus')
    .up()
    .up()
    .ele('customer')
    .ele('name')
    .txt(`${customer.firstName} ${customer.lastName}`)
    .up()
    .ele('email')
    .txt(customer.email)
    .up()
    .up()
    .ele('invoice')
    .ele('number')
    .txt(String(invoice.invoiceNumber))
    .up()
    .ele('total')
    .txt(String(invoice.totalAmount))
    .up()
    .up()
    .ele('payment')
    .ele('id')
    .txt(String(payment.paymentId))
    .up()
    .ele('amount')
    .txt(String(payment.amount))
    .up()
    .ele('method')
    .txt(payment.method)
    .up()
    .ele('reference')
    .txt(payment.transactionRef)
    .up()
    .ele('date')
    .txt(payment.processedAt.toISOString())
    .up()
    .up();

  return doc.end({ prettyPrint: true });
}
