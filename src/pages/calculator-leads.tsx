import {FC, memo, useCallback, useEffect, useState} from 'react';
import {Download, Filter, Search, Lock, CheckCircle, XCircle} from 'lucide-react';

interface BreakdownItem {
  label: string;
  value: number;
}

interface Lead {
  id: string;
  suburb: string;
  travelTime: number;
  scriptsPerDay: number;
  techQuality: string;
  ostVolume: string;
  daaComplexity: string;
  compounding: string;
  workflowPattern: string;
  email: string;
  phone?: string;
  contactPreference: string;
  pharmacyName?: string;
  rate: number;
  breakdown: BreakdownItem[];
  submittedAt?: string;
  abandonedAt?: string;
  status?: string;
  abandonedStep?: number;
}

const CalculatorLeads: FC = memo(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'complete' | 'abandoned'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const DASHBOARD_PASSWORD = 'LPMPL2025';

  const handleLogin = useCallback(() => {
    if (password === DASHBOARD_PASSWORD) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('calculator_auth', 'true');
      }
    } else {
      alert('Incorrect password');
    }
  }, [password]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('calculator_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/get-leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        setFilteredLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
      // Refresh every 30 seconds
      const interval = setInterval(fetchLeads, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchLeads]);

  useEffect(() => {
    let filtered = leads;

    // Filter by status
    if (filter === 'complete') {
      filtered = filtered.filter(lead => lead.status === 'complete');
    } else if (filter === 'abandoned') {
      filtered = filtered.filter(lead => lead.status === 'abandoned');
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        lead =>
          lead.email.toLowerCase().includes(term) ||
          lead.suburb.toLowerCase().includes(term) ||
          lead.pharmacyName?.toLowerCase().includes(term) ||
          lead.phone?.includes(term),
      );
    }

    setFilteredLeads(filtered);
  }, [leads, filter, searchTerm]);

  const exportToCSV = useCallback(() => {
    const headers = [
      'Date',
      'Status',
      'Email',
      'Pharmacy Name',
      'Suburb',
      'Rate ($/hr)',
      'Scripts/Day',
      'Phone',
      'Contact Preference',
    ];

    const rows = filteredLeads.map(lead => {
      const date = lead.submittedAt || lead.abandonedAt || '';
      return [
        new Date(date).toLocaleString('en-AU', {timeZone: 'Australia/Melbourne'}),
        lead.status === 'complete' ? 'Complete' : 'Abandoned',
        lead.email,
        lead.pharmacyName || '',
        lead.suburb,
        lead.rate.toString(),
        lead.scriptsPerDay.toString(),
        lead.phone || '',
        lead.contactPreference,
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `locum-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredLeads]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Dashboard Access</h2>
          <p className="text-gray-600 mb-6 text-center">Enter password to view leads</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
            placeholder="Password"
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Calculator Leads Dashboard</h1>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('calculator_auth');
                }
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Leads</div>
              <div className="text-3xl font-bold text-blue-600">{leads.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Complete</div>
              <div className="text-3xl font-bold text-green-600">
                {leads.filter(l => l.status === 'complete').length}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Abandoned</div>
              <div className="text-3xl font-bold text-orange-600">
                {leads.filter(l => l.status === 'abandoned').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by email, suburb, pharmacy name..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                All
              </button>
              <button
                onClick={() => setFilter('complete')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'complete'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                Complete
              </button>
              <button
                onClick={() => setFilter('abandoned')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'abandoned'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                Abandoned
              </button>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-all">
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-gray-600">Loading leads...</div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-gray-600">No leads found</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pharmacy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suburb
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scripts/Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map(lead => {
                    const date = lead.submittedAt || lead.abandonedAt || '';
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {date
                            ? new Date(date).toLocaleString('en-AU', {timeZone: 'Australia/Melbourne'})
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.status === 'complete' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                              <XCircle className="w-4 h-4" />
                              Abandoned
                              {lead.abandonedStep && ` (Step ${lead.abandonedStep})`}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.pharmacyName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.suburb}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                          ${lead.rate}/hr
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.scriptsPerDay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                              {lead.phone}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CalculatorLeads.displayName = 'CalculatorLeads';
export default CalculatorLeads;

