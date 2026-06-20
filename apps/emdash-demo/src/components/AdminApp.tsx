import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarItem,
  useSidebar,
  Topbar,
  Button,
  Badge,
  Table,
  Tabs,
  Input,
  Select,
  Checkbox,
  IconDashboard,
  IconContent,
  IconMedia,
  IconDatabase,
  IconWorkflows,
  IconAI,
  IconTeams,
  IconAnalytics,
  IconSettings,
  IconSearch,
  IconBell,
  IconPlus,
  IconMoreHorizontal,
  IconFilter,
  IconSortAsc,
  IconEdit,
  IconTrash,
  IconFolder,
  IconHash,
  IconCalendar,
  IconToggleLeft,
  IconUsers,
  IconZap,
  IconClock,
  IconPlay,
  IconFile,
  IconImage,
  IconBrackets,
  IconCode,
  IconShield,
  IconKey,
  IconSliders,
  IconX,
} from '@arrorera/ui';

import type { Column, Tab } from '@arrorera/ui';

/* ───────────────────────────────────────────
   AdminApp — Monochrome Rewrite
   ─────────────────────────────────────────── */

export default function AdminApp({
  user,
  onLogout,
}: {
  user?: { name: string; email: string };
  onLogout?: () => void;
}) {
  const [activeTab, setActiveTab] = useState('content');
  const [activeCollection, setActiveCollection] = useState('posts');
  const [activeSchema, setActiveSchema] = useState('posts');
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  /* ── Dark Mode Toggle ── */

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  /* ── Navigation ── */

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'content', label: 'Content', icon: IconContent },
    { id: 'media', label: 'Media Library', icon: IconMedia },
    { id: 'schema', label: 'Schema Builder', icon: IconDatabase },
    { id: 'workflows', label: 'Workflows', icon: IconWorkflows },
    { id: 'ai', label: 'AI', icon: IconAI },
    { id: 'teams', label: 'Teams', icon: IconTeams },
    { id: 'analytics', label: 'Analytics', icon: IconAnalytics },
    { id: 'plugins', label: 'Plugins', icon: IconBrackets },
    { id: 'automations', label: 'Automations', icon: IconZap },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  /* ── Schemas (for Schema Builder) ── */

  const [schemas] = useState([
    {
      id: 'posts',
      name: 'Posts',
      description: 'Blog posts and articles',
      fields: [
        { id: 'f1', name: 'title', type: 'text', required: true },
        { id: 'f2', name: 'slug', type: 'text', required: true },
        { id: 'f3', name: 'content', type: 'richtext', required: false },
        {
          id: 'f4',
          name: 'author',
          type: 'reference',
          target: 'authors',
          required: true,
        },
        { id: 'f5', name: 'publishedAt', type: 'date', required: false },
      ],
    },
    {
      id: 'authors',
      name: 'Authors',
      description: 'Content creators',
      fields: [
        { id: 'f6', name: 'name', type: 'text', required: true },
        { id: 'f7', name: 'avatar', type: 'image', required: false },
        { id: 'f8', name: 'bio', type: 'richtext', required: false },
      ],
    },
  ]);

  /* ── Collections ── */

  const collections = [
    { id: 'posts', label: 'Posts', count: 12 },
    { id: 'pages', label: 'Pages', count: 5 },
    { id: 'authors', label: 'Authors', count: 3 },
    { id: 'categories', label: 'Categories', count: 8 },
  ];

  /* ── Fetch posts ── */

  useEffect(() => {
    setPosts([
      {
        id: '1',
        title: 'Welcome to ArrowERA CMS',
        status: 'published',
        author: 'Admin User',
        date: '2026-04-04',
        type: 'Post',
      },
      {
        id: '2',
        title: 'Getting Started with AI Features',
        status: 'draft',
        author: 'Admin User',
        date: '2026-04-03',
        type: 'Post',
      },
      {
        id: '3',
        title: 'The Future of Serverless',
        status: 'archived',
        author: 'Jane Doe',
        date: '2026-04-01',
        type: 'Post',
      },
    ]);
  }, []);

  /* ── Table columns ── */

  const contentColumns: Column<(typeof posts)[number]>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-ae-md bg-ae-surface-secondary border border-ae-border flex items-center justify-center text-ae-text-muted shrink-0">
            <IconFile size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-ae-sm font-medium text-ae-text-primary truncate">
              {item.title}
            </div>
            <div className="text-ae-xs text-ae-text-muted mt-0.5">
              {item.type} · ID: {item.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.status === 'published'
              ? 'success'
              : item.status === 'draft'
                ? 'warning'
                : 'neutral'
          }
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    { key: 'author', header: 'Author', sortable: true },
    { key: 'date', header: 'Last Modified', sortable: true },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-ae-fast">
          <button
            className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors"
            title="Edit"
          >
            <IconEdit size={16} />
          </button>
          <button
            className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors"
            title="Delete"
          >
            <IconTrash size={16} />
          </button>
          <button className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors">
            <IconMoreHorizontal size={16} />
          </button>
        </div>
      ),
    },
  ];

  /* ── Settings Tabs ── */

  const settingsTabs: Tab[] = [
    { id: 'general', label: 'General' },
    { id: 'users', label: 'Users', count: 8 },
    { id: 'api', label: 'API' },
    { id: 'webhooks', label: 'Webhooks' },
  ];

  /* ── Render ── */

  return (
    <div className="flex h-screen bg-ae-bg font-sans text-ae-text-primary">
      {/* ── Sidebar ── */}
      <Sidebar defaultCollapsed={false}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-ae-border">
          <div className="w-7 h-7 bg-ae-fg rounded-ae-md flex items-center justify-center text-ae-bg font-bold text-sm shrink-0">
            A
          </div>
          <span className="text-ae-md font-semibold text-ae-text-primary tracking-tight truncate">
            ArrowERA
          </span>
        </div>

        {/* Navigation */}
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

        {/* Footer actions */}
        <div className="border-t border-ae-border p-3 space-y-1">
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 text-ae-xs text-ae-text-muted hover:text-ae-text-primary rounded-ae-md transition-colors duration-ae-fast"
          >
            <span className="text-ae-text-disabled">←</span> Back to Site
          </a>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-ae-xs text-ae-text-muted hover:text-ae-text-primary rounded-ae-md transition-colors duration-ae-fast text-left"
            >
              <span className="text-ae-text-disabled">←</span> Sign Out
            </button>
          )}
        </div>
      </Sidebar>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Topbar ── */}
        <Topbar
          userName={user?.name || 'Admin User'}
          userEmail={user?.email || 'admin@arrowera.com'}
          notificationCount={1}
        >
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-all duration-ae-fast"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
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

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="flex h-full">
              {/* Collection Sidebar */}
              <div className="w-56 bg-ae-surface border-r border-ae-border p-4 overflow-y-auto hidden md:block">
                <h3 className="text-ae-xs font-medium text-ae-text-muted uppercase tracking-wider mb-3 px-2">
                  Collections
                </h3>
                <ul className="space-y-0.5">
                  {collections.map((col) => (
                    <li key={col.id}>
                      <button
                        onClick={() => setActiveCollection(col.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-ae-sm rounded-ae-md transition-colors duration-ae-fast ${
                          activeCollection === col.id
                            ? 'bg-ae-bg text-ae-text-primary border border-ae-border font-medium'
                            : 'text-ae-text-secondary hover:bg-ae-hover'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconFolder
                            size={16}
                            className={
                              activeCollection === col.id
                                ? 'text-ae-fg'
                                : 'text-ae-text-muted'
                            }
                          />
                          {col.label}
                        </div>
                        <Badge variant="neutral">{col.count}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Content Main */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-ae-2xl font-semibold text-ae-text-primary capitalize">
                        {activeCollection}
                      </h2>
                      <p className="text-ae-sm text-ae-text-secondary mt-1">
                        Manage and organize your {activeCollection} content.
                      </p>
                    </div>
                    <Button variant="primary" size="md">
                      <IconPlus size={18} />
                      Create New
                    </Button>
                  </div>

                  {/* Table Controls */}
                  <div className="flex flex-wrap gap-4 items-center justify-between mb-0 px-4 py-3 bg-ae-surface border border-ae-border border-b-0 rounded-t-ae-lg">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <IconFilter size={14} />
                        Filter
                      </Button>
                      <Button variant="ghost" size="sm">
                        <IconSortAsc size={14} />
                        Sort
                      </Button>
                    </div>
                    <div className="text-ae-xs text-ae-text-muted">
                      Showing{' '}
                      <span className="font-medium text-ae-text-primary">
                        {posts.length}
                      </span>{' '}
                      items
                    </div>
                  </div>

                  {/* Table */}
                  <Table
                    columns={contentColumns}
                    data={posts}
                    selectable
                    rowKey={(item) => item.id}
                    className="border border-ae-border border-t-0 rounded-b-ae-lg overflow-hidden bg-ae-bg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="p-8 overflow-y-auto flex-1">
              <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                  <h2 className="text-ae-2xl font-semibold text-ae-text-primary">
                    Dashboard Overview
                  </h2>
                  <p className="text-ae-sm text-ae-text-secondary mt-1">
                    Welcome back. Here's what's happening with your content
                    today.
                  </p>
                </div>

                {/* Stat Blocks — minimal, no cards, no colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                  {[
                    { label: 'Total Posts', value: '124', change: '+12%' },
                    { label: 'Total Users', value: '8,234', change: '+5%' },
                    { label: 'Media Assets', value: '1,042', change: '+18%' },
                    { label: 'Active Plugins', value: '5', change: '0%' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="text-ae-xs font-medium text-ae-text-muted uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <h3 className="text-ae-4xl font-semibold text-ae-text-primary mt-2 tracking-tight">
                        {stat.value}
                      </h3>
                      <div className="mt-2 flex items-center text-ae-xs">
                        <span className="font-medium text-ae-text-primary">
                          {stat.change}
                        </span>
                        <span className="text-ae-text-muted ml-2">
                          from last month
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Content + System Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-4">
                      Recent Content
                    </h3>
                    <div className="border border-ae-border rounded-ae-lg divide-y divide-ae-border">
                      {posts.slice(0, 4).map((post) => (
                        <div
                          key={post.id}
                          className="px-5 py-3.5 flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-ae-md bg-ae-surface-secondary border border-ae-border flex items-center justify-center text-ae-text-muted shrink-0">
                              <IconFile size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-ae-sm font-medium text-ae-text-primary truncate">
                                {post.title}
                              </p>
                              <p className="text-ae-xs text-ae-text-muted mt-0.5">
                                {post.date} by {post.author}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              post.status === 'published'
                                ? 'success'
                                : post.status === 'draft'
                                  ? 'warning'
                                  : 'neutral'
                            }
                          >
                            {post.status.charAt(0).toUpperCase() +
                              post.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-4">
                      System Status
                    </h3>
                    <div className="border border-ae-border rounded-ae-lg p-5 space-y-5">
                      {[
                        { label: 'Database Storage', pct: 45 },
                        { label: 'Media Storage', pct: 78 },
                        { label: 'API Usage', pct: 12 },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-ae-xs mb-1.5">
                            <span className="text-ae-text-secondary">
                              {item.label}
                            </span>
                            <span className="font-medium text-ae-text-primary">
                              {item.pct}%
                            </span>
                          </div>
                          <div className="w-full bg-ae-surface-secondary rounded-full h-1.5">
                            <div
                              className="bg-ae-fg h-1.5 rounded-full transition-all duration-ae-slow"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schema Tab */}
          {activeTab === 'schema' && (
            <div className="flex h-full">
              {/* Schema Sidebar */}
              <div className="w-64 bg-ae-surface border-r border-ae-border p-4 overflow-y-auto hidden md:block">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-ae-xs font-medium text-ae-text-muted uppercase tracking-wider">
                    Content Types
                  </h3>
                  <button className="text-ae-text-secondary hover:text-ae-text-primary p-1 rounded-ae-md hover:bg-ae-hover transition-colors duration-ae-fast">
                    <IconPlus size={16} />
                  </button>
                </div>
                <ul className="space-y-0.5">
                  {schemas.map((schema) => (
                    <li key={schema.id}>
                      <button
                        onClick={() => setActiveSchema(schema.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-ae-sm rounded-ae-md transition-colors duration-ae-fast ${
                          activeSchema === schema.id
                            ? 'bg-ae-bg text-ae-text-primary border border-ae-border font-medium'
                            : 'text-ae-text-secondary hover:bg-ae-hover'
                        }`}
                      >
                        <IconDatabase
                          size={16}
                          className={
                            activeSchema === schema.id
                              ? 'text-ae-fg'
                              : 'text-ae-text-muted'
                          }
                        />
                        {schema.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Schema Main */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  {schemas
                    .filter((s) => s.id === activeSchema)
                    .map((schema) => (
                      <div key={schema.id}>
                        {/* Schema Header */}
                        <div className="border border-ae-border rounded-ae-lg p-6 mb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-ae-xl font-semibold text-ae-text-primary">
                                {schema.name}
                              </h2>
                              <p className="text-ae-sm text-ae-text-secondary mt-1">
                                {schema.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit Details
                              </Button>
                              <Button variant="primary" size="sm">
                                Save Schema
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Fields */}
                        <div className="mb-4 flex justify-between items-center">
                          <h3 className="text-ae-md font-semibold text-ae-text-primary">
                            Fields
                          </h3>
                          <Button variant="ghost" size="sm">
                            <IconPlus size={16} />
                            Add Field
                          </Button>
                        </div>

                        <div className="border border-ae-border rounded-ae-lg overflow-hidden">
                          <div className="divide-y divide-ae-border">
                            {schema.fields.map((field) => (
                              <div
                                key={field.id}
                                className="p-4 flex items-center group hover:bg-ae-hover transition-colors duration-ae-fast"
                              >
                                {/* Drag handle */}
                                <div className="cursor-grab text-ae-text-disabled hover:text-ae-text-muted mr-4">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                  >
                                    <circle cx="6" cy="4" r="1.2" />
                                    <circle cx="10" cy="4" r="1.2" />
                                    <circle cx="6" cy="8" r="1.2" />
                                    <circle cx="10" cy="8" r="1.2" />
                                    <circle cx="6" cy="12" r="1.2" />
                                    <circle cx="10" cy="12" r="1.2" />
                                  </svg>
                                </div>

                                {/* Field type icon */}
                                <div className="w-9 h-9 rounded-ae-md bg-ae-surface-secondary border border-ae-border flex items-center justify-center mr-4 text-ae-text-secondary shrink-0">
                                  {field.type === 'text' && (
                                    <IconHash size={16} />
                                  )}
                                  {field.type === 'date' && (
                                    <IconCalendar size={16} />
                                  )}
                                  {field.type === 'boolean' && (
                                    <IconToggleLeft size={16} />
                                  )}
                                  {field.type === 'richtext' && (
                                    <IconEdit size={16} />
                                  )}
                                  {field.type === 'reference' && (
                                    <IconFolder size={16} />
                                  )}
                                  {field.type === 'image' && (
                                    <IconImage size={16} />
                                  )}
                                </div>

                                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-4">
                                    <p className="text-ae-sm font-medium text-ae-text-primary">
                                      {field.name}
                                    </p>
                                    <p className="text-ae-xs text-ae-text-muted capitalize mt-0.5">
                                      {field.type}
                                    </p>
                                  </div>
                                  <div className="col-span-4 flex items-center">
                                    {field.type === 'reference' &&
                                      field.target && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-ae-md bg-ae-surface-secondary text-ae-text-secondary text-ae-xs font-medium border border-ae-border">
                                          <IconFolder size={12} />{' '}
                                          {field.target}
                                        </span>
                                      )}
                                  </div>
                                  <div className="col-span-3 flex items-center justify-end">
                                    {field.required && (
                                      <span className="text-ae-xs font-medium text-ae-text-muted bg-ae-surface-secondary px-2 py-1 rounded-ae-md border border-ae-border">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-ae-fast">
                                    <button className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors">
                                      <IconMoreHorizontal size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="p-8 overflow-y-auto flex-1">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-ae-2xl font-semibold text-ae-text-primary">
                      Media Library
                    </h2>
                    <p className="text-ae-sm text-ae-text-secondary mt-1">
                      Manage your images, videos, and documents.
                    </p>
                  </div>
                  <Button variant="primary" size="md">
                    <IconPlus size={16} />
                    Upload Media
                  </Button>
                </div>

                {/* Filters */}
                <div className="border border-ae-border rounded-ae-lg p-4 mb-6 flex items-center justify-between bg-ae-surface">
                  <div className="flex items-center gap-4">
                    <Select
                      options={[
                        { label: 'All Media Items', value: 'all' },
                        { label: 'Images', value: 'images' },
                        { label: 'Documents', value: 'documents' },
                        { label: 'Videos', value: 'videos' },
                      ]}
                      defaultValue="all"
                    />
                    <Select
                      options={[
                        { label: 'All Dates', value: 'all' },
                        { label: 'April 2026', value: '2026-04' },
                        { label: 'March 2026', value: '2026-03' },
                      ]}
                      defaultValue="all"
                    />
                  </div>
                  <Input
                    placeholder="Search media..."
                    leftIcon={<IconSearch size={16} />}
                    className="w-64"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((item) => (
                    <div
                      key={item}
                      className="border border-ae-border rounded-ae-lg overflow-hidden group cursor-pointer hover:border-ae-border-strong transition-colors duration-ae-fast"
                    >
                      <div className="aspect-square bg-ae-surface-secondary relative">
                        <img
                          src={`https://picsum.photos/seed/${item}/300/300`}
                          alt={`Media ${item}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-ae-backdrop opacity-0 group-hover:opacity-100 transition-opacity duration-ae-fast flex items-center justify-center gap-2">
                          <button className="w-8 h-8 bg-ae-bg rounded-full flex items-center justify-center text-ae-text-primary hover:text-ae-fg shadow-ae-sm">
                            <IconEdit size={14} />
                          </button>
                          <button className="w-8 h-8 bg-ae-bg rounded-full flex items-center justify-center text-ae-text-primary hover:text-ae-fg shadow-ae-sm">
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-ae-xs font-medium text-ae-text-primary truncate">
                          image-{item}.jpg
                        </p>
                        <p className="text-ae-xs text-ae-text-muted mt-0.5">
                          1.2 MB · Apr 04, 2026
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Plugins Tab */}
          {activeTab === 'plugins' && (
            <div className="p-8 overflow-y-auto flex-1">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-ae-2xl font-semibold text-ae-text-primary">
                      Plugins
                    </h2>
                    <p className="text-ae-sm text-ae-text-secondary mt-1">
                      Manage your installed extensions and capabilities.
                    </p>
                  </div>
                  <Button variant="outline" size="md">
                    Browse Marketplace
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-ae-border rounded-ae-lg p-6 hover:border-ae-border-strong transition-colors duration-ae-fast">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-ae-surface-secondary border border-ae-border rounded-ae-md flex items-center justify-center text-ae-text-secondary">
                          <IconBrackets size={18} />
                        </div>
                        <div>
                          <h4 className="text-ae-sm font-semibold text-ae-text-primary">
                            example-plugin
                          </h4>
                          <p className="text-ae-xs text-ae-text-muted">
                            v1.0.0
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-ae-sm text-ae-text-secondary mb-5 line-clamp-2">
                      A sample plugin demonstrating the sandboxed architecture
                      and capability system.
                    </p>
                    <div>
                      <h5 className="text-ae-xs font-medium text-ae-text-muted uppercase tracking-wider mb-2">
                        Capabilities
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-ae-surface-secondary border border-ae-border text-ae-text-secondary text-ae-xs px-2 py-1 rounded-ae-md inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-ae-fg" />{' '}
                          read:content
                        </span>
                        <span className="bg-ae-surface-secondary border border-ae-border text-ae-text-secondary text-ae-xs px-2 py-1 rounded-ae-md inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-ae-fg" />{' '}
                          email:send
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Automations Tab */}
          {activeTab === 'automations' && (
            <div className="p-8 overflow-y-auto flex-1">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-ae-2xl font-semibold text-ae-text-primary">
                      Automations
                    </h2>
                    <p className="text-ae-sm text-ae-text-secondary mt-1">
                      Manage system-wide automated tasks and workflows.
                    </p>
                  </div>
                  <Button variant="primary" size="md">
                    <IconPlus size={16} />
                    Create Automation
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Publish Scheduled Posts',
                      schedule: 'Every hour',
                      status: 'active',
                      lastRun: '10 mins ago',
                    },
                    {
                      title: 'Database Backup',
                      schedule: 'Daily at 00:00 UTC',
                      status: 'active',
                      lastRun: 'Apr 4, 2026 00:00',
                    },
                    {
                      title: 'Send Weekly Reports',
                      schedule: 'Every Monday at 9:00 AM',
                      status: 'active',
                      lastRun: 'Mar 30, 2026',
                    },
                    {
                      title: 'Clear Cache',
                      schedule: 'When memory > 80%',
                      status: 'paused',
                      lastRun: 'Mar 28, 2026',
                    },
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
                        <Badge
                          variant={
                            automation.status === 'active'
                              ? 'success'
                              : 'neutral'
                          }
                        >
                          {automation.status.charAt(0).toUpperCase() +
                            automation.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-ae-border">
                        <span className="text-ae-xs text-ae-text-muted">
                          Last run: {automation.lastRun}
                        </span>
                        <div className="flex gap-2">
                          <button
                            className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors"
                            title="Run Now"
                          >
                            <IconPlay size={16} />
                          </button>
                          <button
                            className="p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-colors"
                            title="Configure"
                          >
                            <IconSettings size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-8 overflow-y-auto flex-1">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-ae-2xl font-semibold text-ae-text-primary">
                    Settings
                  </h2>
                  <p className="text-ae-sm text-ae-text-secondary mt-1">
                    Configure your ArrowERA CMS instance.
                  </p>
                </div>

                <div className="border border-ae-border rounded-ae-lg overflow-hidden">
                  <Tabs
                    tabs={settingsTabs}
                    activeTab="general"
                    onChange={() => {}}
                  />

                  <div className="p-6">
                    <h3 className="text-ae-md font-semibold text-ae-text-primary mb-5">
                      Site Information
                    </h3>
                    <div className="space-y-5">
                      <Input
                        label="Site Title"
                        defaultValue="ArrowERA Portal"
                        hint="The name of your site, used in titles and emails."
                      />
                      <Input
                        label="Site URL"
                        type="url"
                        defaultValue="https://arrowera.com"
                      />
                      <Input
                        label="Admin Email"
                        type="email"
                        defaultValue="admin@arrowera.com"
                      />

                      <hr className="border-ae-border my-6" />

                      <h3 className="text-ae-md font-semibold text-ae-text-primary mb-5">
                        Localization
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <Select
                          label="Timezone"
                          options={[
                            {
                              label: 'UTC (Coordinated Universal Time)',
                              value: 'utc',
                            },
                            { label: 'America/New_York', value: 'america-ny' },
                            { label: 'Europe/London', value: 'europe-london' },
                          ]}
                          defaultValue="utc"
                        />
                        <Select
                          label="Default Language"
                          options={[
                            { label: 'English (US)', value: 'en-us' },
                            { label: 'Spanish', value: 'es' },
                            { label: 'French', value: 'fr' },
                          ]}
                          defaultValue="en-us"
                        />
                      </div>

                      <div className="pt-6 flex justify-end">
                        <Button variant="primary" size="md">
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflows / AI / Teams / Analytics placeholders */}
          {['workflows', 'ai', 'teams', 'analytics'].includes(activeTab) && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-14 h-14 bg-ae-surface-secondary border border-ae-border rounded-ae-lg flex items-center justify-center mx-auto mb-4 text-ae-text-muted">
                  {activeTab === 'workflows' && <IconWorkflows size={28} />}
                  {activeTab === 'ai' && <IconAI size={28} />}
                  {activeTab === 'teams' && <IconTeams size={28} />}
                  {activeTab === 'analytics' && <IconAnalytics size={28} />}
                </div>
                <h3 className="text-ae-lg font-semibold text-ae-text-primary mb-2 capitalize">
                  {activeTab}
                </h3>
                <p className="text-ae-sm text-ae-text-muted">
                  This module is part of the ArrowERA CMS architecture. It is
                  currently under development.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
