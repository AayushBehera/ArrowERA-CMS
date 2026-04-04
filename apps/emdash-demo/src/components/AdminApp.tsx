import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Database, 
  Blocks, 
  Settings, 
  Search, 
  Bell, 
  Plus, 
  MoreVertical, 
  Filter,
  ArrowUpDown,
  Edit3,
  Trash2,
  FolderOpen,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  AlignLeft,
  Link as LinkIcon,
  GripVertical,
  Users,
  Zap,
  Clock,
  Play
} from 'lucide-react';

export default function AdminApp({ user, onLogout }: { user?: any, onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState('schema');
  const [activeCollection, setActiveCollection] = useState('posts');
  const [posts, setPosts] = useState<any[]>([]);

  // Schema Builder State
  const [activeSchema, setActiveSchema] = useState('posts');
  const [schemas, setSchemas] = useState([
    {
      id: 'posts',
      name: 'Posts',
      description: 'Blog posts and articles',
      fields: [
        { id: 'f1', name: 'title', type: 'text', required: true },
        { id: 'f2', name: 'slug', type: 'text', required: true },
        { id: 'f3', name: 'content', type: 'richtext', required: false },
        { id: 'f4', name: 'author', type: 'reference', target: 'authors', required: true },
        { id: 'f5', name: 'publishedAt', type: 'date', required: false },
      ]
    },
    {
      id: 'authors',
      name: 'Authors',
      description: 'Content creators',
      fields: [
        { id: 'f6', name: 'name', type: 'text', required: true },
        { id: 'f7', name: 'avatar', type: 'image', required: false },
        { id: 'f8', name: 'bio', type: 'richtext', required: false },
      ]
    }
  ]);

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={16} className="text-blue-500" />;
      case 'number': return <Hash size={16} className="text-orange-500" />;
      case 'date': return <Calendar size={16} className="text-green-500" />;
      case 'boolean': return <ToggleLeft size={16} className="text-purple-500" />;
      case 'richtext': return <AlignLeft size={16} className="text-indigo-500" />;
      case 'reference': return <LinkIcon size={16} className="text-pink-500" />;
      case 'image': return <ImageIcon size={16} className="text-teal-500" />;
      default: return <Type size={16} className="text-slate-500" />;
    }
  };

  useEffect(() => {
    // Simulated fetch
    setPosts([
      { id: '1', title: 'Welcome to ArrorEra CMS', status: 'published', author: 'Admin User', date: '2026-04-04', type: 'Post' },
      { id: '2', title: 'Getting Started with AI Features', status: 'draft', author: 'Admin User', date: '2026-04-03', type: 'Post' },
      { id: '3', title: 'The Future of Serverless', status: 'archived', author: 'Jane Doe', date: '2026-04-01', type: 'Post' },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'schema', label: 'Schema Builder', icon: Database },
    { id: 'plugins', label: 'Plugins', icon: Blocks },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const collections = [
    { id: 'posts', label: 'Posts', count: 12 },
    { id: 'pages', label: 'Pages', count: 5 },
    { id: 'authors', label: 'Authors', count: 3 },
    { id: 'categories', label: 'Categories', count: 8 },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
            A
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">ArrorEra</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <a href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            <span>←</span> Back to Site
          </a>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors mt-2"
            >
              <span>←</span> Sign Out
            </button>
          )}
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
              placeholder="Search anything..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center space-x-5">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-500">{user?.email || 'admin@arrorera.com'}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-sm border-2 border-white flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'content' && (
            <div className="flex h-full">
              {/* Content Sidebar (Collections) */}
              <div className="w-56 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto hidden md:block">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Collections</h3>
                <ul className="space-y-1">
                  {collections.map(collection => (
                    <li key={collection.id}>
                      <button
                        onClick={() => setActiveCollection(collection.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                          activeCollection === collection.id
                            ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-medium'
                            : 'text-slate-600 hover:bg-slate-200/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen size={16} className={activeCollection === collection.id ? 'text-indigo-500' : 'text-slate-400'} />
                          {collection.label}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeCollection === collection.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {collection.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Content Main Area */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                  {/* Header & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeCollection}</h2>
                      <p className="text-sm text-slate-500 mt-1">Manage and organize your {activeCollection} content.</p>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-2">
                      <Plus size={18} />
                      Create New
                    </button>
                  </div>

                  {/* Filters & Table Controls */}
                  <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
                        <Filter size={14} /> Filter
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
                        <ArrowUpDown size={14} /> Sort
                      </button>
                    </div>
                    <div className="text-sm text-slate-500">
                      Showing <span className="font-medium text-slate-900">{posts.length}</span> items
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white shadow-sm rounded-b-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80">
                          <tr>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">
                              <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            </th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Modified</th>
                            <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {posts.map(post => (
                            <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 text-slate-400">
                                    <FileText size={20} />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{post.title}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{post.type} • ID: {post.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${getStatusColor(post.status)}`}>
                                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {post.author}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {post.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                                    <Edit3 size={16} />
                                  </button>
                                  <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                    <Trash2 size={16} />
                                  </button>
                                  <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                                    <MoreVertical size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs (Plugins, Media, etc.) */}
          {activeTab === 'plugins' && (
            <div className="p-8 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Plugins</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your installed extensions and capabilities.</p>
                  </div>
                  <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all">
                    Browse Marketplace
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                          <Blocks size={20} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">example-plugin</h4>
                          <p className="text-xs text-slate-500">v1.0.0</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">Active</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-5 line-clamp-2">A sample plugin demonstrating the sandboxed architecture and capability system.</p>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Capabilities</h5>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> read:content
                        </span>
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> email:send
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="flex h-full">
              {/* Schema Sidebar */}
              <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto hidden md:block">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Types</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 p-1 rounded-md hover:bg-indigo-50 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <ul className="space-y-1">
                  {schemas.map(schema => (
                    <li key={schema.id}>
                      <button
                        onClick={() => setActiveSchema(schema.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                          activeSchema === schema.id
                            ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-medium'
                            : 'text-slate-600 hover:bg-slate-200/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Database size={16} className={activeSchema === schema.id ? 'text-indigo-500' : 'text-slate-400'} />
                          {schema.name}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Schema Main Area */}
              <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
                <div className="max-w-4xl mx-auto">
                  {schemas.filter(s => s.id === activeSchema).map(schema => (
                    <div key={schema.id}>
                      {/* Schema Header */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900">{schema.name}</h2>
                            <p className="text-sm text-slate-500 mt-1">{schema.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                              Edit Details
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">
                              Save Schema
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Fields List */}
                      <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Fields</h3>
                        <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                          <Plus size={16} /> Add Field
                        </button>
                      </div>

                      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                        <div className="divide-y divide-slate-100">
                          {schema.fields.map((field, index) => (
                            <div key={field.id} className="p-4 flex items-center group hover:bg-slate-50 transition-colors">
                              <div className="cursor-grab text-slate-300 hover:text-slate-500 mr-4">
                                <GripVertical size={20} />
                              </div>
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mr-4">
                                {getFieldIcon(field.type)}
                              </div>
                              <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-4">
                                  <p className="text-sm font-bold text-slate-900">{field.name}</p>
                                  <p className="text-xs text-slate-500 capitalize">{field.type}</p>
                                </div>
                                <div className="col-span-4 flex items-center">
                                  {field.type === 'reference' && field.target && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-50 text-pink-700 text-xs font-medium border border-pink-100">
                                      <LinkIcon size={12} /> {field.target}
                                    </span>
                                  )}
                                </div>
                                <div className="col-span-3 flex items-center justify-end">
                                  {field.required && (
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Required</span>
                                  )}
                                </div>
                                <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                                    <MoreVertical size={16} />
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

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                  <p className="text-sm text-slate-500 mt-1">Welcome back. Here's what's happening with your content today.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Posts', value: '124', change: '+12%', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Total Users', value: '8,234', change: '+5%', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Media Assets', value: '1,042', change: '+18%', icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Active Plugins', value: '5', change: '0%', icon: Blocks, color: 'text-amber-600', bg: 'bg-amber-100' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                          <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                          <stat.icon size={24} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <span className="text-emerald-600 font-medium">{stat.change}</span>
                        <span className="text-slate-400 ml-2">from last month</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Content</h3>
                    <div className="divide-y divide-slate-100">
                      {posts.slice(0, 4).map(post => (
                        <div key={post.id} className="py-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{post.title}</p>
                              <p className="text-xs text-slate-500">{post.date} by {post.author}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${getStatusColor(post.status)}`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Database Storage</span>
                          <span className="font-medium text-slate-900">45%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Media Storage</span>
                          <span className="font-medium text-slate-900">78%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">API Usage</span>
                          <span className="font-medium text-slate-900">12%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Media Library</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your images, videos, and documents.</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={16} /> Upload Media
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
                      <option>All Media Items</option>
                      <option>Images</option>
                      <option>Documents</option>
                      <option>Videos</option>
                    </select>
                    <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
                      <option>All Dates</option>
                      <option>April 2026</option>
                      <option>March 2026</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search media..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                    <div key={item} className="bg-white rounded-lg border border-slate-200 overflow-hidden group cursor-pointer hover:border-indigo-400 transition-colors">
                      <div className="aspect-square bg-slate-100 relative">
                        <img src={`https://picsum.photos/seed/${item}/300/300`} alt={`Media ${item}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-indigo-600"><Edit3 size={14} /></button>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-slate-900 truncate">image-{item}.jpg</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">1.2 MB • Apr 04, 2026</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Automations Tab */}
          {activeTab === 'automations' && (
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Automations</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage system-wide automated tasks and workflows.</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={16} /> Create Automation
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Publish Scheduled Posts', schedule: 'Every hour', status: 'active', lastRun: '10 mins ago' },
                    { title: 'Database Backup', schedule: 'Daily at 00:00 UTC', status: 'active', lastRun: 'Apr 4, 2026 00:00' },
                    { title: 'Send Weekly Reports', schedule: 'Every Monday at 9:00 AM', status: 'active', lastRun: 'Mar 30, 2026' },
                    { title: 'Clear Cache', schedule: 'When memory > 80%', status: 'paused', lastRun: 'Mar 28, 2026' },
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
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure your ArrorEra CMS instance.</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="flex border-b border-slate-200">
                    <button className="px-6 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50">General</button>
                    <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50">Users</button>
                    <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50">API</button>
                    <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50">Webhooks</button>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Site Information</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Site Title</label>
                        <input type="text" defaultValue="ArrorEra Portal" className="w-full max-w-md border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                        <p className="text-xs text-slate-500 mt-1">The name of your site, used in titles and emails.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Site URL</label>
                        <input type="url" defaultValue="https://arrorera.com" className="w-full max-w-md border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                        <input type="email" defaultValue="admin@arrorera.com" className="w-full max-w-md border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      
                      <hr className="border-slate-200 my-6" />
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Localization</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                            <option>UTC (Coordinated Universal Time)</option>
                            <option>America/New_York</option>
                            <option>Europe/London</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Default Language</label>
                          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                            <option>English (US)</option>
                            <option>Spanish</option>
                            <option>French</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="pt-6 flex justify-end">
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {[] /* removed placeholders */.includes(activeTab) && (
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                  {activeTab === 'dashboard' && <LayoutDashboard size={32} />}
                  {activeTab === 'media' && <ImageIcon size={32} />}
                  {activeTab === 'schema' && <Database size={32} />}
                  {activeTab === 'settings' && <Settings size={32} />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 capitalize">{activeTab}</h3>
                <p className="text-slate-500 text-sm">
                  This module is part of the ArrorEra CMS architecture. It is currently under development.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
