import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClients, type ProjectStatus, type PaymentStatus, type Client } from '../contexts/ClientContext';
import { format, differenceInDays } from 'date-fns';
import { FiEdit2, FiTrash2, FiSearch, FiUser, FiPlusCircle, FiRefreshCw, FiMail, FiPhone, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Clients = () => {
  const { 
    clients, 
    deleteClient, 
    renewClient, 
    getOverdueClients, 
    getUpcomingRenewals 
  } = useClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Get unique project types for filter dropdown
  const projectTypes = useMemo(() => {
    return Array.from(new Set(clients.map(c => c.projectType))).filter(Boolean);
  }, [clients]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  // Get status badge color
  const getStatusBadgeColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get payment status badge color
  const getPaymentBadgeColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get renewal status
  const getRenewalStatus = (client: Client) => {
    const now = new Date();
    const daysUntilRenewal = differenceInDays(client.nextRenewalDate, now);
    
    if (daysUntilRenewal < 0) {
      return { text: `${Math.abs(daysUntilRenewal)} days overdue`, color: 'text-red-600 dark:text-red-400', urgent: true };
    } else if (daysUntilRenewal <= 30) {
      return { text: `${daysUntilRenewal} days left`, color: 'text-yellow-600 dark:text-yellow-400', urgent: true };
    } else {
      return { text: `${daysUntilRenewal} days left`, color: 'text-green-600 dark:text-green-400', urgent: false };
    }
  };
  
  // Filter clients based on criteria
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filter by status
      if (statusFilter && client.projectStatus !== statusFilter) return false;
      
      // Filter by payment status
      if (paymentFilter && client.paymentStatus !== paymentFilter) return false;
      
      // Filter by project type
      if (typeFilter && client.projectType !== typeFilter) return false;
      
      // Filter by search term
      if (search) {
        const searchTerm = search.toLowerCase();
        return (
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.projectName.toLowerCase().includes(searchTerm) ||
          client.projectType.toLowerCase().includes(searchTerm) ||
          client.notes.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    });
  }, [clients, statusFilter, paymentFilter, typeFilter, search]);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteClient(id);
        toast.success('Client deleted successfully');
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await renewClient(id);
      toast.success('Client renewed successfully');
    } catch (error) {
      toast.error('Failed to renew client');
    }
  };
  
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPaymentFilter('');
    setTypeFilter('');
  };

  const overdue = getOverdueClients();
  const upcoming = getUpcomingRenewals();

  // Mobile Card Component
  const ClientCard = ({ client }: { client: Client }) => {
    const renewalStatus = getRenewalStatus(client);
    
    return (
      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary text-lg truncate">{client.name}</h3>
            <div className="text-sm text-secondary space-y-1 mt-1">
              <div className="flex items-center gap-2">
                <FiMail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <FiPhone className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{client.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            {client.projectStatus === 'active' && renewalStatus.urgent && (
              <button
                onClick={() => handleRenew(client.id)}
                className="flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                title="Renew Client"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            )}
            <Link
              to={`/clients/edit/${client.id}`}
              className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              title="Edit Client"
            >
              <FiEdit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDelete(client.id)}
              className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Delete Client"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Project</label>
            <div className="mt-1">
              <div className="font-medium text-primary">{client.projectName}</div>
              <div className="text-sm text-secondary">{client.projectType}</div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                {formatCurrency(client.projectPayment)}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Annual Fee</label>
            <div className="mt-1 font-medium text-primary">{formatCurrency(client.annualFee)}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Status</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(client.projectStatus)}`}>
                {client.projectStatus.charAt(0).toUpperCase() + client.projectStatus.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Payment</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeColor(client.paymentStatus)}`}>
                {client.paymentStatus.charAt(0).toUpperCase() + client.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-secondary uppercase tracking-wide">Next Renewal</label>
          <div className="mt-1">
            <div className="text-sm text-primary">{formatDate(client.nextRenewalDate)}</div>
            <div className={`text-xs ${renewalStatus.color} ${renewalStatus.urgent ? 'font-medium' : ''}`}>
              {renewalStatus.text}
            </div>
          </div>
        </div>
        
        {client.notes && (
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Notes</label>
            <div className="mt-1 text-sm text-secondary">{client.notes}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-primary">Clients</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link 
            to="/clients/add" 
            className="btn-primary flex items-center justify-center"
          >
            <FiPlusCircle className="mr-2" />
            Add Client
          </Link>
        </div>
      </div>

      {/* Alert Cards */}
      {(overdue.length > 0 || upcoming.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdue.length > 0 && (
            <div className="card border-l-4 border-red-500">
              <div className="flex items-center">
                <FiAlertTriangle className="text-red-500 w-6 h-6 mr-3" />
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400">Overdue Renewals</h3>
                  <p className="text-sm text-secondary">{overdue.length} client{overdue.length > 1 ? 's' : ''} need immediate attention</p>
                </div>
              </div>
            </div>
          )}
          
          {upcoming.length > 0 && (
            <div className="card border-l-4 border-yellow-500">
              <div className="flex items-center">
                <FiCalendar className="text-yellow-500 w-6 h-6 mr-3" />
                <div>
                  <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">Upcoming Renewals</h3>
                  <p className="text-sm text-secondary">{upcoming.length} client{upcoming.length > 1 ? 's' : ''} renewing in the next 30 days</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
              className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-no-repeat bg-right cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | '')}
              className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-no-repeat bg-right cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-no-repeat bg-right cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">All Types</option>
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md transition-colors whitespace-nowrap cursor-pointer font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <FiUser className="mx-auto w-12 h-12 text-secondary mb-4" />
            <p className="text-secondary">No clients found</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-4">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-3 px-4 font-medium text-secondary">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Annual Fee</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Next Renewal</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Notes</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const renewalStatus = getRenewalStatus(client);
                    
                    return (
                      <tr key={client.id} className="border-b border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-primary">{client.name}</div>
                            <div className="text-sm text-secondary flex items-center gap-2 mt-1">
                              <FiMail className="w-3 h-3" />
                              {client.email}
                            </div>
                            {client.phone && (
                              <div className="text-sm text-secondary flex items-center gap-2">
                                <FiPhone className="w-3 h-3" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-primary">{client.projectName}</div>
                            <div className="text-sm text-secondary">{client.projectType}</div>
                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {formatCurrency(client.projectPayment)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(client.projectStatus)}`}>
                            {client.projectStatus.charAt(0).toUpperCase() + client.projectStatus.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeColor(client.paymentStatus)}`}>
                            {client.paymentStatus.charAt(0).toUpperCase() + client.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-primary">{formatCurrency(client.annualFee)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm text-primary">{formatDate(client.nextRenewalDate)}</div>
                            <div className={`text-xs ${renewalStatus.color} ${renewalStatus.urgent ? 'font-medium' : ''}`}>
                              {renewalStatus.text}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-secondary max-w-xs">
                            {client.notes ? (
                              <span className="line-clamp-2" title={client.notes}>
                                {client.notes}
                              </span>
                            ) : (
                              <span className="italic text-gray-400 dark:text-gray-500">No notes</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {client.projectStatus === 'active' && renewalStatus.urgent && (
                              <button
                                onClick={() => handleRenew(client.id)}
                                className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors cursor-pointer"
                                title="Renew Client"
                              >
                                <FiRefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              to={`/clients/edit/${client.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer"
                              title="Edit Client"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer"
                              title="Delete Client"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      <div className="text-sm text-secondary">
        Showing {filteredClients.length} of {clients.length} clients
      </div>
    </div>
  );
};

export default Clients; 