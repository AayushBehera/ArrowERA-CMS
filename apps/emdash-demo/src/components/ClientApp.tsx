import React, { useState } from 'react';
import {
  Sidebar,
  SidebarItem,
  Topbar,
  Button,
  Badge,
  Input,
  Table,
  IconDashboard,
  IconContent,
  IconSettings,
  IconSearch,
  IconBell,
  IconZap,
  IconPlus,
  IconClock,
  IconPlay,
  IconFile,
  IconCreditCard,
  IconLifeBuoy,
  IconLogOut,
  IconActivity,
  IconTrendingUp,
  IconUsers,
  IconMoreHorizontal,
  IconFolder,
  IconMessageSquare,
  IconArrowRight,
} from '@arrorera/ui';

import type { Column } from '@arrorera/ui';

export default function ClientApp({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: IconDashboard },
    { id: 'projects', label: 'My Projects', icon: IconFolder },
    { id: 'messages', label: 'Messages', icon: IconMessageSquare },
    { id: 'billing', label: 'Billing', icon: IconCreditCard },
    { id: 'support', label: 'Support', icon: IconLifeBuoy },
    { id: 'automations', label: 'Automations', icon: IconZap },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  return (
    <div className="flex h-screen bg-ae-bg font-sans text-ae-text-primary">
      {/* Sidebar */}
      <Sidebar defaultCollapsed={false}>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-ae-border">
          <div className="w-7 h-7 bg-ae-fg rounded-ae-md flex items-center justify-center text-ae-bg font-bold text-sm shrink-0">
            C
          </div>
          <span className="text-ae-md font-semibold text-ae-text-primary tracking-tight truncate">
            Client Portal
          </span>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <SidebarItem
                key={item.id}
                active={isActive}
                onClick={() => setActiveTab(item.id)}
                icon={<Icon size={18} />}
                label={item.label}
              />
            );
          })}
        </nav>

        <div className="border-t border-ae-border p-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-ae-sm text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors duration-ae-fast"
          >
            <IconLogOut size={18} />
            Sign Out
          </button>
        </div>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          userName={user?.name || 'Client User'}
          userEmail={user?.email || 'client@example.com'}
          notificationCount={1}
        >
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-all duration-ae-fast"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </Topbar>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="mb-10">
                  <h2 className="text-ae-2xl font-semibold text-ae-text-primary">
                    Welcome back, {user?.name?.split(' ')[0] || 'Client'}!
                  </h2>
                  <p className="text-ae-sm text-ae-text-secondary mt-1">
                    Here's what's happening with your projects today.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {[
                    { label: 'Active Projects', value: '3', change: '+1' },
                    { label: 'Unread Messages', value: '5', change: 'Attention' },
                    { label: 'Next Payment', value: '$1,250', change: 'Apr 15, 2026' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="text-ae-xs font-medium text-ae-text-muted uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <h3 className="text-ae-4xl font-semibold text-ae-text-primary mt-2 tracking-tight">
                        {stat.value}
                      </h3>
                      <p className="text-ae-xs text-ae-text-muted mt-2">{stat.change}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-ae-md font-semibold text-ae-text-primary">
                      Recent Activity
                    </h3>
                    <Button variant="ghost" size="sm">View all</Button>
                  </div>
                  <div className="border border-ae-border rounded-ae-lg divide-y divide-ae-border">
                    {[
                      { title: 'New draft submitted for review', project: 'Website Redesign', time: '2 hours ago' },
                      { title: 'Invoice #INV-2026-042 paid', project: 'Marketing Campaign', time: '1 day ago' },
                      { title: 'New comment from Sarah', project: 'Website Redesign', time: '2 days ago' },
                    ].map((activity, i) => (
                      <div
                        key={i}
                        className="px-5 py-3.5 flex items-center hover:bg-ae-hover transition-colors duration-ae-fast"
                      >
                        <div className="w-9 h-9 rounded-ae-md bg-ae-surface-secondary border border-ae-border flex items-center justify-center text-ae-text-muted mr-4 shrink-0">
                          <IconFile size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ae-sm font-medium text-ae-text-primary truncate">
                            {activity.title}
                          </p>
                          <p className="text-ae-xs text-ae-text-muted mt-0.5">{activity.project}</p>
                        </div>
                        <div className="text-ae-xs text-ae-text-muted shrink-0 ml-4">
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
                    <h2 className="text-ae-2xl font-semibold text-ae-text-primary">My Projects</h2>
                    <p className="text-ae-sm text-ae-text-secondary mt-1">
                      Manage and track your ongoing projects.
                    </p>
                  </div>
                  <Button variant="primary" size="md">Request New Project</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Website Redesign', status: 'In Progress', progress: 65, due: 'May 15, 2026', team: ['A', 'B'] },
                    { name: 'Marketing Campaign', status: 'Review', progress: 90, due: 'Apr 10, 2026', team: ['C'] },
                    { name: 'SEO Optimization', status: 'Planning', progress: 15, due: 'Jun 01, 2026', team: ['A', 'D'] },
                  ].map((project, i) => (
                    <div
                      key={i}
                      className="border border-ae-border rounded-ae-lg p-6 hover:border-ae-border-strong transition-colors duration-ae-fast"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-ae-md font-semibold text-ae-text-primary">
                          {project.name}
                        </h3>
                        <Badge
                          variant={
                            project.status === 'In Progress'
                              ? 'warning'
                              : project.status === 'Review'
                                ? 'success'
                                : 'neutral'
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-ae-xs mb-1.5">
                          <span className="text-ae-text-muted">Progress</span>
                          <span className="font-medium text-ae-text-primary">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-ae-surface-secondary rounded-full h-1.5">
                          <div
                            className="bg-ae-fg h-1.5 rounded-full transition-all duration-ae-slow"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-ae-border">
                        <div className="text-ae-xs text-ae-text-muted">
                          Due: <span className="font-medium text-ae-text-primary">{project.due}</span>
                        </div>
                        <div className="flex -space-x-2">
                          {project.team.map((member, j) => (
                            <div
                              key={j}
                              className="w-7 h-7 rounded-full bg-ae-surface-secondary border-2 border-ae-bg flex items-center justify-center text-ae-xs font-medium text-ae-text-secondary"
                            >
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
              <div className="border border-ae-border rounded-ae-lg h-[calc(100vh-12rem)] flex overflow-hidden">
                <div className="w-1/3 border-r border-ae-border flex flex-col">
                  <div className="p-4 border-b border-ae-border">
                    <Input placeholder="Search messages..." leftIcon={<IconSearch size={16} />} />
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {[
                      { name: 'Sarah Jenkins', project: 'Website Redesign', time: '10:42 AM', unread: true, preview: 'I have uploaded the new wireframes for your review.' },
                      { name: 'Mike Ross', project: 'Marketing Campaign', time: 'Yesterday', unread: false, preview: 'The ad copy looks good to go.' },
                      { name: 'Support Team', project: 'General', time: 'Mon', unread: false, preview: 'Your ticket has been resolved.' },
                    ].map((chat, i) => (
                      <div
                        key={i}
                        className={`p-4 border-b border-ae-border cursor-pointer hover:bg-ae-hover transition-colors duration-ae-fast ${
                          i === 0 ? 'bg-ae-surface-secondary' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`text-ae-sm ${
                              chat.unread ? 'font-semibold text-ae-text-primary' : 'font-medium text-ae-text-secondary'
                            }`}
                          >
                            {chat.name}
                          </h4>
                          <span className="text-ae-xs text-ae-text-muted">{chat.time}</span>
                        </div>
                        <p className="text-ae-xs text-ae-text-muted mb-1">{chat.project}</p>
                        <p
                          className={`text-ae-sm line-clamp-1 ${
                            chat.unread ? 'text-ae-text-primary font-medium' : 'text-ae-text-muted'
                          }`}
                        >
                          {chat.preview}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-ae-border flex justify-between items-center">
                    <div>
                      <h3 className="text-ae-md font-semibold text-ae-text-primary">Sarah Jenkins</h3>
                      <p className="text-ae-xs text-ae-text-muted">Website Redesign</p>
                    </div>
                    <button className="text-ae-text-muted hover:text-ae-text-primary transition-colors duration-ae-fast">
                      <IconMoreHorizontal size={18} />
                    </button>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-ae-surface space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-ae-surface-secondary border border-ae-border flex items-center justify-center font-medium text-ae-sm text-ae-text-secondary shrink-0">
                        SJ
                      </div>
                      <div className="bg-ae-bg p-3 rounded-ae-lg rounded-tl-none border border-ae-border max-w-md">
                        <p className="text-ae-sm text-ae-text-primary">
                          Hi there! I've just uploaded the new wireframes for the homepage. Let me know what you think.
                        </p>
                        <span className="text-ae-xs text-ae-text-muted mt-2 block">10:42 AM</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-ae-border bg-ae-bg">
                    <div className="flex gap-2">
                      <Input placeholder="Type your message..." className="flex-1" />
                      <Button variant="primary" size="md">Send</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-ae-2xl font-semibold text-ae-text-primary">Billing & Invoices</h2>
                  <p className="text-ae-sm text-ae-text-secondary mt-1">
                    Manage your payment methods and view invoice history.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-4">Invoice History</h3>
                    <Table
                      columns={[
                        { key: 'id', header: 'Invoice' },
                        { key: 'date', header: 'Date' },
                        { key: 'amount', header: 'Amount' },
                        {
                          key: 'status',
                          header: 'Status',
                          render: (inv: any) => <Badge variant="success">{inv.status}</Badge>,
                        },
                        {
                          key: 'action',
                          header: '',
                          align: 'right',
                          render: () => (
                            <Button variant="ghost" size="sm">Download</Button>
                          ),
                        },
                      ]}
                      data={[
                        { id: 'INV-2026-042', date: 'Apr 01, 2026', amount: '$1,250.00', status: 'Paid' },
                        { id: 'INV-2026-038', date: 'Mar 01, 2026', amount: '$1,250.00', status: 'Paid' },
                        { id: 'INV-2026-031', date: 'Feb 01, 2026', amount: '$2,500.00', status: 'Paid' },
                      ]}
                      rowKey={(inv) => inv.id}
                    />
                  </div>

                  <div>
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-4">Payment Method</h3>
                    <div className="border border-ae-border rounded-ae-lg p-6">
                      <div className="flex items-center p-4 border border-ae-border rounded-ae-md mb-4">
                        <div className="w-10 h-7 bg-ae-surface-secondary rounded-ae-sm flex items-center justify-center mr-3">
                          <IconCreditCard size={18} className="text-ae-text-secondary" />
                        </div>
                        <div>
                          <p className="text-ae-sm font-medium text-ae-text-primary">Visa ending in 4242</p>
                          <p className="text-ae-xs text-ae-text-muted">Expires 12/28</p>
                        </div>
                      </div>
                      <Button variant="outline" size="md" className="w-full">
                        Update Payment Method
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-ae-2xl font-semibold text-ae-text-primary mb-4">
                    How can we help you?
                  </h2>
                  <div className="max-w-xl mx-auto">
                    <Input
                      placeholder="Search knowledge base..."
                      leftIcon={<IconSearch size={18} />}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-ae-border rounded-ae-lg p-6 hover:border-ae-border-strong transition-colors duration-ae-fast cursor-pointer">
                    <div className="w-11 h-11 bg-ae-surface-secondary border border-ae-border rounded-ae-md flex items-center justify-center mb-4 text-ae-text-secondary">
                      <IconMessageSquare size={22} />
                    </div>
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-2">
                      Contact Support
                    </h3>
                    <p className="text-ae-sm text-ae-text-secondary">
                      Open a ticket with our support team. We typically respond within 2 hours.
                    </p>
                  </div>
                  <div className="border border-ae-border rounded-ae-lg p-6 hover:border-ae-border-strong transition-colors duration-ae-fast cursor-pointer">
                    <div className="w-11 h-11 bg-ae-surface-secondary border border-ae-border rounded-ae-md flex items-center justify-center mb-4 text-ae-text-secondary">
                      <IconFile size={22} />
                    </div>
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-2">
                      Documentation
                    </h3>
                    <p className="text-ae-sm text-ae-text-secondary">
                      Browse our detailed guides and documentation to find answers quickly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Automations Tab */}
            {activeTab === 'automations' && (
              <div className="max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-ae-2xl font-semibold text-ae-text-primary">Automations</h2>
                    <p className="text-ae-sm text-ae-text-secondary mt-1">
                      Manage your automated tasks and workflows.
                    </p>
                  </div>
                  <Button variant="primary" size="md">
                    <IconPlus size={16} />
                    New Automation
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Monthly Invoice Generation', schedule: '1st of every month', status: 'active', lastRun: 'Apr 1, 2026' },
                    { title: 'Weekly Project Update Reminder', schedule: 'Every Friday at 9:00 AM', status: 'active', lastRun: 'Apr 3, 2026' },
                    { title: 'Feedback Request', schedule: '3 days after project completion', status: 'paused', lastRun: 'Mar 15, 2026' },
                  ].map((automation, i) => (
                    <div
                      key={i}
                      className="border border-ae-border rounded-ae-lg p-6 hover:border-ae-border-strong transition-colors duration-ae-fast"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-ae-md bg-ae-surface-secondary border border-ae-border flex items-center justify-center text-ae-text-secondary">
                            <IconZap size={18} />
                          </div>
                          <div>
                            <h3 className="text-ae-sm font-semibold text-ae-text-primary">
                              {automation.title}
                            </h3>
                            <div className="flex items-center gap-1 text-ae-xs text-ae-text-muted mt-0.5">
                              <IconClock size={12} /> {automation.schedule}
                            </div>
                          </div>
                        </div>
                        <Badge variant={automation.status === 'active' ? 'success' : 'neutral'}>
                          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-ae-border">
                        <span className="text-ae-xs text-ae-text-muted">
                          Last run: {automation.lastRun}
                        </span>
                        <div className="flex gap-2">
                          <button className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors" title="Run Now">
                            <IconPlay size={16} />
                          </button>
                          <button className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors" title="Configure">
                            <IconSettings size={16} />
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
                  <h2 className="text-ae-2xl font-semibold text-ae-text-primary">Account Settings</h2>
                  <p className="text-ae-sm text-ae-text-secondary mt-1">
                    Manage your personal information and preferences.
                  </p>
                </div>

                <div className="border border-ae-border rounded-ae-lg overflow-hidden">
                  <div className="p-6 border-b border-ae-border">
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-5">
                      Profile Information
                    </h3>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 bg-ae-surface-secondary border-2 border-ae-border rounded-full flex items-center justify-center text-ae-text-primary font-bold text-xl">
                        {user?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="mb-2">
                          Change Avatar
                        </Button>
                        <p className="text-ae-xs text-ae-text-muted">
                          JPG, GIF or PNG. Max size of 800K
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Full Name" defaultValue={user?.name || 'Client User'} />
                      <Input label="Email Address" type="email" defaultValue={user?.email || 'client@example.com'} />
                      <Input label="Company" defaultValue="Acme Corp" />
                      <Input label="Phone Number" type="tel" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div className="p-6 bg-ae-surface flex justify-end">
                    <Button variant="primary" size="md">Save Changes</Button>
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
