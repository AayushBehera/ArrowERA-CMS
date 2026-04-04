import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  MessageSquare,
  CreditCard,
  LifeBuoy,
  LogOut,
  Activity,
  TrendingUp,
  Users,
  MoreVertical,
  Zap,
  Plus,
  Clock,
  Play
} from 'lucide-react';

export default function ClientApp({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
            C
          </div>
          <h1 className="text-lg font-bold tracking-tight">Client Portal</h1>
        </div>
        
        <div className="p-6 pb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={18} className="text-slate-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-0">
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-96 border border-slate-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
            <Search size={16} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search invoices, projects, or messages..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center space-x-5">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{user?.name || 'Client User'}</p>
                <p className="text-xs text-slate-500">{user?.email || 'client@example.com'}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full shadow-sm border-2 border-white flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0] || 'Client'}!</h2>
                  <p className="text-sm text-slate-500 mt-1">Here's what's happening with your projects today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Active Projects</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">3</h3>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <Activity size={24} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-emerald-600 font-medium flex items-center"><TrendingUp size={14} className="mr-1" /> +1</span>
                      <span className="text-slate-400 ml-2">from last month</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Unread Messages</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">5</h3>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                        <MessageSquare size={24} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-amber-600 font-medium">Requires attention</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Next Payment</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">$1,250</h3>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <CreditCard size={24} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-slate-500">Due on <span className="font-medium text-slate-700">Apr 15, 2026</span></span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { title: 'New draft submitted for review', project: 'Website Redesign', time: '2 hours ago', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                      { title: 'Invoice #INV-2026-042 paid', project: 'Marketing Campaign', time: '1 day ago', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                      { title: 'New comment from Sarah', project: 'Website Redesign', time: '2 days ago', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50' },
                    ].map((activity, i) => (
                      <div key={i} className="px-6 py-4 flex items-center hover:bg-slate-50 transition-colors">
                        <div className={`w-10 h-10 rounded-full ${activity.bg} ${activity.color} flex items-center justify-center mr-4`}>
                          <activity.icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{activity.project}</p>
                        </div>
                        <div className="text-xs text-slate-400">
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">My Projects</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage and track your ongoing projects.</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    Request New Project
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Website Redesign', status: 'In Progress', progress: 65, due: 'May 15, 2026', team: ['A', 'B'] },
                    { name: 'Marketing Campaign', status: 'Review', progress: 90, due: 'Apr 10, 2026', team: ['C'] },
                    { name: 'SEO Optimization', status: 'Planning', progress: 15, due: 'Jun 01, 2026', team: ['A', 'D'] },
                  ].map((project, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'Review' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-medium text-slate-700">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <div className="text-sm text-slate-500">
                          Due: <span className="font-medium text-slate-700">{project.due}</span>
                        </div>
                        <div className="flex -space-x-2">
                          {project.team.map((member, j) => (
                            <div key={j} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                              {member}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-12rem)] flex overflow-hidden">
                <div className="w-1/3 border-r border-slate-200 flex flex-col">
                  <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {[
                      { name: 'Sarah Jenkins', project: 'Website Redesign', time: '10:42 AM', unread: true, preview: 'I have uploaded the new wireframes for your review.' },
                      { name: 'Mike Ross', project: 'Marketing Campaign', time: 'Yesterday', unread: false, preview: 'The ad copy looks good to go.' },
                      { name: 'Support Team', project: 'General', time: 'Mon', unread: false, preview: 'Your ticket has been resolved.' },
                    ].map((chat, i) => (
                      <div key={i} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-indigo-50/50' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm ${chat.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{chat.name}</h4>
                          <span className="text-xs text-slate-400">{chat.time}</span>
                        </div>
                        <p className="text-xs text-indigo-600 mb-1">{chat.project}</p>
                        <p className={`text-sm line-clamp-1 ${chat.unread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{chat.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Sarah Jenkins</h3>
                      <p className="text-xs text-slate-500">Website Redesign</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={20} /></button>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-sm flex-shrink-0">SJ</div>
                      <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-slate-200 max-w-md">
                        <p className="text-sm text-slate-700">Hi there! I've just uploaded the new wireframes for the homepage. Let me know what you think.</p>
                        <span className="text-[10px] text-slate-400 mt-2 block">10:42 AM</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-white">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Type your message..." className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Send</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Billing & Invoices</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your payment methods and view invoice history.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Invoice History</h3>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-3 font-medium">Invoice</th>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {[
                            { id: 'INV-2026-042', date: 'Apr 01, 2026', amount: '$1,250.00', status: 'Paid' },
                            { id: 'INV-2026-038', date: 'Mar 01, 2026', amount: '$1,250.00', status: 'Paid' },
                            { id: 'INV-2026-031', date: 'Feb 01, 2026', amount: '$2,500.00', status: 'Paid' },
                          ].map((inv, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">{inv.id}</td>
                              <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                              <td className="px-6 py-4 text-slate-900">{inv.amount}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">{inv.status}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Download</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h3>
                      <div className="flex items-center p-4 border border-slate-200 rounded-lg mb-4">
                        <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center mr-4">
                          <CreditCard size={20} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Visa ending in 4242</p>
                          <p className="text-xs text-slate-500">Expires 12/28</p>
                        </div>
                      </div>
                      <button className="w-full py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">How can we help you?</h2>
                  <div className="relative max-w-xl mx-auto">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search knowledge base..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <MessageSquare size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Support</h3>
                    <p className="text-sm text-slate-500">Open a ticket with our support team. We typically respond within 2 hours.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Documentation</h3>
                    <p className="text-sm text-slate-500">Browse our detailed guides and documentation to find answers quickly.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Automations Tab */}
            {activeTab === 'automations' && (
              <div className="max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Automations</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your automated tasks and workflows.</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={16} /> New Automation
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Monthly Invoice Generation', schedule: '1st of every month', status: 'active', lastRun: 'Apr 1, 2026' },
                    { title: 'Weekly Project Update Reminder', schedule: 'Every Friday at 9:00 AM', status: 'active', lastRun: 'Apr 3, 2026' },
                    { title: 'Feedback Request', schedule: '3 days after project completion', status: 'paused', lastRun: 'Mar 15, 2026' },
                  ].map((automation, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${automation.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{automation.title}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                              <Clock size={12} /> {automation.schedule}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${automation.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500">Last run: {automation.lastRun}</span>
                        <div className="flex gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Run Now">
                            <Play size={16} />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                            <Settings size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-3xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your personal information and preferences.</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Information</h3>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full shadow-sm border-4 border-white flex items-center justify-center text-white font-bold text-2xl">
                        {user?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors mb-2 block">
                          Change Avatar
                        </button>
                        <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" defaultValue={user?.name || 'Client User'} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" defaultValue={user?.email || 'client@example.com'} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                        <input type="text" defaultValue="Acme Corp" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
