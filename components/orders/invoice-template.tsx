"use client"

import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/utils/formatters'

interface InvoiceTemplateProps {
  order: any
}

export function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  if (!order) return null

  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="invoice-template hidden print:block">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-template,
          .invoice-template * {
            visibility: visible;
          }
          .invoice-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto bg-white p-8">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">NOTA LAUNDRY</h1>
              <p className="text-sm text-gray-600 mt-1">Laundry Express</p>
              <p className="text-sm text-gray-600">Jl. Contoh No. 123, Jakarta</p>
              <p className="text-sm text-gray-600">Telp: (021) 1234-5678</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tanggal Cetak:</p>
              <p className="text-sm font-medium">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">INFORMASI PESANAN</h2>
            <table className="text-sm w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600">No. Nota:</td>
                  <td className="py-1 font-medium">{order.order_number}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Tanggal Order:</td>
                  <td className="py-1">{formatDate(order.order_date)}</td>
                </tr>
                {order.pickup_date && (
                  <tr>
                    <td className="py-1 text-gray-600">Tanggal Pickup:</td>
                    <td className="py-1">{formatDate(order.pickup_date)}</td>
                  </tr>
                )}
                {order.delivery_date && (
                  <tr>
                    <td className="py-1 text-gray-600">Tanggal Selesai:</td>
                    <td className="py-1">{formatDate(order.delivery_date)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-1 text-gray-600">Status:</td>
                  <td className="py-1 font-medium capitalize">{order.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">INFORMASI PELANGGAN</h2>
            <table className="text-sm w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600">Nama:</td>
                  <td className="py-1 font-medium">{order.customer?.name || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Telepon:</td>
                  <td className="py-1">{order.customer?.phone ? formatPhoneNumber(order.customer.phone) : '-'}</td>
                </tr>
                {order.customer?.address && (
                  <tr>
                    <td className="py-1 text-gray-600 align-top">Alamat:</td>
                    <td className="py-1">{order.customer.address}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">DETAIL PESANAN</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-2 px-2">No</th>
                <th className="text-left py-2 px-2">Layanan</th>
                <th className="text-center py-2 px-2">Jumlah</th>
                <th className="text-right py-2 px-2">Harga Satuan</th>
                <th className="text-right py-2 px-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items && order.order_items.map((item: any, index: number) => (
                <tr key={item.id || index} className="border-b border-gray-300">
                  <td className="py-2 px-2">{index + 1}</td>
                  <td className="py-2 px-2">{item.service?.name || 'Unknown Service'}</td>
                  <td className="py-2 px-2 text-center">{item.quantity}</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 px-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-2 text-gray-600">Total Pesanan:</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(order.total_amount)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 text-gray-600">Sudah Dibayar:</td>
                  <td className="py-2 text-right text-green-600 font-medium">{formatCurrency(order.paid_amount)}</td>
                </tr>
                <tr className="border-b-2 border-gray-800">
                  <td className="py-2 font-semibold">Sisa Pembayaran:</td>
                  <td className="py-2 text-right font-bold text-lg">
                    {formatCurrency(order.total_amount - order.paid_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Catatan:</p>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-800 pt-4 mt-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-600 mb-2">Syarat & Ketentuan:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Barang yang sudah dicuci tidak dapat dikembalikan</li>
                <li>• Kehilangan/kerusakan maksimal 10x biaya cuci</li>
                <li>• Barang yang tidak diambil dalam 30 hari menjadi milik laundry</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium mb-8">Hormat Kami,</p>
              <p className="text-sm font-medium border-t border-gray-400 inline-block px-8 pt-1">
                Laundry Express
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">Terima kasih atas kepercayaan Anda</p>
          </div>
        </div>
      </div>
    </div>
  )
}
