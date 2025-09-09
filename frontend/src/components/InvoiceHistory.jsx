import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceAPI } from '../services/api';

const InvoiceHistory = () => {
  const { tenantId } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [tenantId]);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceAPI.getInvoices(tenantId);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'open': return 'text-yellow-600 bg-yellow-100';
      case 'void': return 'text-gray-600 bg-gray-100';
      case 'uncollectible': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const downloadInvoice = (invoicePdf) => {
    if (invoicePdf) {
      window.open(invoicePdf, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link to={`/tenant/${tenantId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Tenant
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Invoice History</h1>

        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No invoices found</div>
            <p className="text-gray-400">Invoices will appear here once you have an active subscription.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              Invoice #{invoice.number || invoice.id}
                            </p>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-500">
                              {new Date(invoice.created * 1000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatAmount(invoice.amount_paid, invoice.currency)}
                          </p>
                          {invoice.amount_due > 0 && (
                            <p className="text-sm text-red-600">
                              Due: {formatAmount(invoice.amount_due, invoice.currency)}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {invoice.invoice_pdf && (
                            <button
                              onClick={() => downloadInvoice(invoice.invoice_pdf)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              Download
                            </button>
                          )}
                          {invoice.hosted_invoice_url && (
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {invoice.lines?.data && invoice.lines.data.length > 0 && (
                      <div className="mt-4 ml-14">
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Items:</p>
                          <ul className="mt-1 space-y-1">
                            {invoice.lines.data.map((line, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{line.description || 'Subscription'}</span>
                                <span>{formatAmount(line.amount, invoice.currency)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help with your invoices? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHistory;
