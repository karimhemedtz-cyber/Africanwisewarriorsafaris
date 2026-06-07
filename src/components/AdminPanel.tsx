/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { countries } from '../eastAfricaData';
import { Package, Booking, NewsItem, CommentItem, SiteSettings, DEFAULT_SITE_SETTINGS } from '../types';
import SiteSettingsEditor from './SiteSettingsEditor';
import { CountryEditor, ParkEditor } from './CountryParkEditor';
import { 
  savePackage, deletePackage, 
  saveNews, deleteNews, 
  updateBookingStatus, deleteComment, saveSiteSettings 
} from '../supabase-db';
import { 
  LayoutDashboard, Map, FileText, ClipboardList, MessageSquare, 
  Plus, Edit2, Trash2, CheckCircle, Clock, Save, Image, RefreshCw, AlertTriangle, Globe, Pencil 
} from 'lucide-react';

interface AdminPanelProps {
  packages: Package[];
  bookings: Booking[];
  news: NewsItem[];
  comments: CommentItem[];
  onRefreshData: () => Promise<void>;
  siteSettings: SiteSettings;
  onSaveSettings: (s: SiteSettings) => Promise<void>;
}

type TabType = 'packages' | 'bookings' | 'news' | 'comments' | 'site';

export default function AdminPanel({ 
  packages, 
  bookings, 
  news, 
  comments,
  onRefreshData,
  siteSettings,
  onSaveSettings
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('packages');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Site settings editor state
  const [settingsEditorMode, setSettingsEditorMode] = useState<'hero' | 'contact' | null>(null);
  const [countryEditorId, setCountryEditorId] = useState<string | null>(null);
  const [parkEditorId, setParkEditorId] = useState<string | null>(null);

  // Package Form state
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: '',
    price: 1500,
    route: '',
    days: 5,
    description: '',
    imageUrl: '/src/assets/images/package_serengeti_1779964123153.png'
  });

  // News Form state
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });

  // Photo Presets for ease of admin mock design
  const IMAGE_PRESETS = [
    { name: 'Serengeti Migration', url: '/src/assets/images/package_serengeti_1779964123153.png' },
    { name: 'Maasai Mara Lion', url: '/src/assets/images/package_masaimara_1779964145785.png' },
    { name: 'Ngorongoro Rhino', url: '/src/assets/images/package_ngorongoro_1779964167185.png' },
    { name: 'Sunset Savannah Hero', url: '/src/assets/images/safari_hero_1779964102826.png' }
  ];

  const triggerRefresh = async (msg: string) => {
    setLoading(true);
    await onRefreshData();
    setSuccessMsg(msg);
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // --- PACKAGE ACTIONS ---
  const handleEditPackage = (pkg: Package) => {
    setEditingPackageId(pkg.id);
    setPackageForm({
      name: pkg.name,
      price: pkg.price,
      route: pkg.route,
      days: pkg.days,
      description: pkg.description,
      imageUrl: pkg.imageUrl
    });
  };

  const handleResetPackageForm = () => {
    setEditingPackageId(null);
    setPackageForm({
      name: '',
      price: 1500,
      route: '',
      days: 5,
      description: '',
      imageUrl: '/src/assets/images/package_serengeti_1779964123153.png'
    });
  };

  const handleSavePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.name.trim() || !packageForm.route.trim() || !packageForm.description.trim()) {
      alert('All package fields are required.');
      return;
    }

    try {
      const packageId = editingPackageId || 'pkg_' + Date.now();
      const updatedPkg: Package = {
        id: packageId,
        name: packageForm.name,
        price: Number(packageForm.price) || 0,
        route: packageForm.route,
        days: Number(packageForm.days) || 1,
        description: packageForm.description,
        imageUrl: packageForm.imageUrl,
        createdAt: new Date().toISOString()
      };

      await savePackage(updatedPkg);
      handleResetPackageForm();
      await triggerRefresh('Package properties successfully synchronized!');
    } catch (err) {
      console.error(err);
      alert('Failed to save package settings.');
    }
  };

  const handleDeletePackageClick = async (id: string) => {
    if (!confirm('Are you absolutely certain you wish to delete this safari package? This operation is irreversible.')) return;
    try {
      await deletePackage(id);
      await triggerRefresh('Safari archive updated - package removed.');
    } catch (err) {
      console.error(err);
      alert('Failed to remove package.');
    }
  };

  // --- NEWS ACTIONS ---
  const handleEditNews = (article: NewsItem) => {
    setEditingNewsId(article.id);
    setNewsForm({
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl || ''
    });
  };

  const handleResetNewsForm = () => {
    setEditingNewsId(null);
    setNewsForm({
      title: '',
      content: '',
      imageUrl: ''
    });
  };

  const handleSaveNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      alert('News title and content are mandatory columns.');
      return;
    }

    try {
      const newsId = editingNewsId || 'news_' + Date.now();
      const article: NewsItem = {
        id: newsId,
        title: newsForm.title,
        content: newsForm.content,
        imageUrl: newsForm.imageUrl,
        createdAt: new Date().toISOString()
      };

      await saveNews(article);
      handleResetNewsForm();
      await triggerRefresh('Expedition blog feed successfully updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to synchronize news log.');
    }
  };

  const handleDeleteNewsClick = async (id: string) => {
    if (!confirm('Delete this blog entry permanently?')) return;
    try {
      await deleteNews(id);
      await triggerRefresh('News entry purged.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete news.');
    }
  };

  // --- BOOKING ACTIONS ---
  const handleToggleBookingReviewed = async (id: string, currentStatus: 'pending' | 'reviewed') => {
    const nextStatus = currentStatus === 'pending' ? 'reviewed' : 'pending';
    try {
      await updateBookingStatus(id, nextStatus);
      await triggerRefresh('Booking log status has been updated.');
    } catch (err) {
      console.error(err);
      alert('Failed to modify proposal state.');
    }
  };

  // --- COMMENTS ACTIONS ---
  const handleDeleteCommentClick = async (id: string) => {
    if (!confirm('Purlieu comment removal: Purge this user comment permanently to maintain brand integrity?')) return;
    try {
      await deleteComment(id);
      await triggerRefresh('Feedback item successfully deleted.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete user comment.');
    }
  };

  return (
    <div id="admin_dashboard" className="bg-stone-50 min-h-screen py-12 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>African Wase Warrior Headquarters Security Core</span>
            </div>
            <h1 className="text-3xl font-serif font-black tracking-tight text-stone-900 leading-none">
              Owner Administration Panel
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Active Admin: <strong className="text-emerald-950 font-serif">Karimu Hemedi</strong>. Control itineraries, inspect customer rosters, write news.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              id="btn_admin_force_refresh"
              onClick={() => triggerRefresh('Database values refreshed!')}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 font-semibold text-xs rounded-lg shadow-sm hover:bg-stone-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Synchronize Database</span>
            </button>
          </div>
        </div>

        {/* Global Action Banner */}
        {successMsg && (
          <div id="admin_success_banner" className="mb-6 p-4 bg-emerald-800 text-white rounded-xl shadow-md text-xs font-bold tracking-wide animate-fade-in flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dashboard Frame Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Side Nav Menu */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-3 bg-stone-50 border-b border-stone-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Directory Rails</span>
              </div>
              <nav className="p-2 space-y-1">
                <button
                  id="tab_admin_packages"
                  onClick={() => setActiveTab('packages')}
                  className={`flex items-center space-x-2.5 w-full px-4 py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'packages' 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>Safari Packages</span>
                  <span className="ml-auto bg-stone-100 text-stone-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {packages.length}
                  </span>
                </button>

                <button
                  id="tab_admin_bookings"
                  onClick={() => setActiveTab('bookings')}
                  className={`flex items-center space-x-2.5 w-full px-4 py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'bookings' 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Booking Proposals</span>
                  <span className="ml-auto bg-stone-100 text-stone-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {bookings.length}
                  </span>
                </button>

                <button
                  id="tab_admin_news"
                  onClick={() => setActiveTab('news')}
                  className={`flex items-center space-x-2.5 w-full px-4 py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'news' 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Safari Blog News</span>
                  <span className="ml-auto bg-stone-100 text-stone-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {news.length}
                  </span>
                </button>

                <button
                  id="tab_admin_comments"
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center space-x-2.5 w-full px-4 py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'comments' 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Patron Feedback</span>
                  <span className="ml-auto bg-stone-100 text-stone-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                </button>

                <button
                  id="tab_admin_site"
                  onClick={() => setActiveTab('site')}
                  className={`flex items-center space-x-2.5 w-full px-4 py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'site' 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Site Content</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Work Panel */}
          <div className="lg:col-span-9">
            
            {/* 1. SAFARI PACKAGES WORK PANEL */}
            {activeTab === 'packages' && (
              <div id="panel_packages" className="space-y-8 animate-fade-in text-left">
                
                {/* Form to Create/Edit */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs p-6">
                  <h3 className="text-base font-serif font-extrabold text-stone-900 leading-none mb-4 flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-emerald-800" />
                    <span>{editingPackageId ? 'Edit Safari Package' : 'Upload New Safari Package'}</span>
                  </h3>

                  <form id="add_package_form" onSubmit={handleSavePackageSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Package Display Name</label>
                        <input
                          id="input_package_name"
                          type="text"
                          required
                          className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800 font-medium"
                          placeholder="e.g. Serengeti Great Migration"
                          value={packageForm.name}
                          onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Price (USD)</label>
                        <input
                          id="input_package_price"
                          type="number"
                          required
                          className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800 font-bold"
                          placeholder="1500"
                          value={packageForm.price}
                          onChange={(e) => setPackageForm({...packageForm, price: Number(e.target.value) || 0})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Route itinerary / Destinations</label>
                        <input
                          id="input_package_route"
                          type="text"
                          required
                          className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800"
                          placeholder="Arusha - Serengeti - Arusha"
                          value={packageForm.route}
                          onChange={(e) => setPackageForm({...packageForm, route: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Duration of Safari (Days)</label>
                        <input
                          id="input_package_days"
                          type="number"
                          min={1}
                          required
                          className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800 font-semibold"
                          value={packageForm.days}
                          onChange={(e) => setPackageForm({...packageForm, days: Number(e.target.value) || 1})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Select Custom Safari Image Placeholder</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                        {IMAGE_PRESETS.map((p, i) => (
                          <div 
                            key={i}
                            onClick={() => setPackageForm({...packageForm, imageUrl: p.url})}
                            className={`p-1.5 border rounded-lg cursor-pointer transition-all flex flex-col items-center ${
                              packageForm.imageUrl === p.url 
                                ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold' 
                                : 'border-stone-200 hover:border-emerald-300'
                            }`}
                          >
                            <img src={p.url} className="w-full h-12 object-cover rounded-md mb-1" alt={p.name} referrerPolicy="no-referrer" />
                            <span className="text-[10px] text-center line-clamp-1">{p.name}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">Or Input custom image URL</label>
                        <input
                          id="input_package_image_url"
                          type="text"
                          className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800"
                          placeholder="https://..."
                          value={packageForm.imageUrl}
                          onChange={(e) => setPackageForm({...packageForm, imageUrl: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Package Itinerary Details / Description</label>
                      <textarea
                        id="textarea_package_desc"
                        required
                        className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800 h-28 resize-none"
                        placeholder="Provide details about lodging guides, balloon safaris, included meals and amenities..."
                        value={packageForm.description}
                        onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center space-x-2 justify-end">
                      {editingPackageId && (
                        <button
                          id="btn_cancel_package_edit"
                          type="button"
                          onClick={handleResetPackageForm}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                        >
                          Cancel Reset
                        </button>
                      )}
                      <button
                        id="btn_save_package_props"
                        type="submit"
                        className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingPackageId ? 'Update Settings' : 'Create Package'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Listing of Existing Packages */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-stone-50 border-b border-stone-100 font-serif font-bold text-stone-800 text-sm">
                    Registered Packages Catalog ({packages.length})
                  </div>
                  <div className="divide-y divide-stone-100">
                    {packages.map(pkg => (
                      <div key={pkg.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={pkg.imageUrl} 
                            className="w-14 h-14 object-cover rounded-lg border border-stone-200 shrink-0" 
                            alt={pkg.name} 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="block font-serif font-medium text-stone-900 text-sm leading-tight">{pkg.name}</span>
                            <span className="block text-xs text-stone-400 mt-0.5">{pkg.days} Days • {pkg.route}</span>
                            <span className="inline-block mt-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded leading-none">
                              Price: ${pkg.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                          <button
                            id={`btn_edit_pkg_${pkg.id}`}
                            onClick={() => handleEditPackage(pkg)}
                            className="p-2 bg-stone-50 text-stone-700 border border-stone-200 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-all cursor-pointer"
                            title="Edit package properties"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn_delete_pkg_${pkg.id}`}
                            onClick={() => handleDeletePackageClick(pkg.id)}
                            className="p-2 bg-stone-50 text-stone-400 border border-stone-200 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                            title="Delete package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 2. BOOKING PROPOSALS LOGS PANEL */}
            {activeTab === 'bookings' && (
              <div id="panel_bookings" className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-stone-50 border-b border-stone-100 font-serif font-bold text-stone-800 text-sm flex items-center justify-between">
                    <span>Expedition Booking Roster</span>
                    <span className="text-[10px] uppercase font-bold text-stone-400 bg-white border border-stone-200 px-2 py-1 rounded">
                      Total requests: {bookings.length}
                    </span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="p-12 text-center text-stone-400 text-sm font-medium">
                      No customer booking requests logged in database logs.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {bookings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(b => (
                        <div key={b.id} className="p-6 space-y-3">
                          
                          {/* Top Row User tags */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                            <div>
                              <span className="text-sm font-bold text-stone-900 leading-none">{b.name}</span>
                              <span className="text-xs text-stone-400 block sm:inline sm:ml-2">({b.email})</span>
                            </div>
                            <span className="text-xs text-stone-400 font-mono">
                              Logged on: {new Date(b.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Package selection grid details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 p-3.5 rounded-xl border border-stone-200/50">
                            <div>
                              <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Requested Package</span>
                              <span className="text-xs font-bold text-emerald-950">{b.packageName}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Traveller count</span>
                              <span className="text-xs font-semibold text-stone-800">{b.people} Persons</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Log proposal state</span>
                              <button
                                id={`btn_toggle_booking_status_${b.id}`}
                                onClick={() => handleToggleBookingReviewed(b.id, b.status)}
                                className={`inline-flex items-center space-x-1 mt-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                                  b.status === 'reviewed' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {b.status === 'reviewed' ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-emerald-700" />
                                    <span>Reviewed</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Pending</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Message/Notes container */}
                          {b.message && (
                            <div className="text-xs bg-stone-100/50 p-3 rounded-lg border border-stone-200/30">
                              <span className="block text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1 leading-none">Customer Message notes</span>
                              <em className="text-stone-600 font-serif">"{b.message}"</em>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* 3. NEWS WINDOW / BLOG WORK PANEL */}
            {activeTab === 'news' && (
              <div id="panel_news" className="space-y-8 animate-fade-in text-left">
                
                {/* News creation panel */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs p-6">
                  <h3 className="text-base font-serif font-extrabold text-stone-900 leading-none mb-4 flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-emerald-800" />
                    <span>{editingNewsId ? 'Edit Blog Article' : 'Write Safari Adventure Article'}</span>
                  </h3>

                  <form id="add_news_form" onSubmit={handleSaveNewsSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Article Headline / Title</label>
                      <input
                        id="input_news_title"
                        type="text"
                        required
                        className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800"
                        placeholder="e.g. Serengeti Great Crossing Commences"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Scenic Image URL (Optional)</label>
                      <input
                        id="input_news_image"
                        type="text"
                        className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800"
                        placeholder="https://images.unsplash.com/your-scenic-photo"
                        value={newsForm.imageUrl}
                        onChange={(e) => setNewsForm({...newsForm, imageUrl: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Article Body Content</label>
                      <textarea
                        id="textarea_news_content"
                        required
                        className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-800 h-32 resize-none"
                        placeholder="Write conservation programs updates, tracking safari guides, cheetah observations, local warrior manyattas events log..."
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center space-x-2 justify-end">
                      {editingNewsId && (
                        <button
                          id="btn_cancel_news_edit"
                          type="button"
                          onClick={handleResetNewsForm}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                        >
                          Cancel Reset
                        </button>
                      )}
                      <button
                        id="btn_save_news_feed"
                        type="submit"
                        className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingNewsId ? 'Update News' : 'Publish Article'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* News listing */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-stone-50 border-b border-stone-100 font-serif font-bold text-stone-800 text-sm">
                    Published Headlines Directory ({news.length})
                  </div>
                  <div className="divide-y divide-stone-100">
                    {news.map(n => (
                      <div key={n.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="text-left pr-4">
                          <h4 className="font-serif font-semibold text-stone-900 text-sm leading-tight">{n.title}</h4>
                          <span className="text-[10px] text-stone-400 block mt-1">
                            Published {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            id={`btn_edit_news_${n.id}`}
                            onClick={() => handleEditNews(n)}
                            className="p-2 bg-stone-50 text-stone-700 border border-stone-200 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-all cursor-pointer"
                            title="Edit commentary article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn_delete_news_${n.id}`}
                            onClick={() => handleDeleteNewsClick(n.id)}
                            className="p-2 bg-stone-55 text-stone-400 border border-stone-200 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 4. COMMENTS / REVIEWS MANAGEMENT PANEL */}
            {activeTab === 'comments' && (
              <div id="panel_comments" className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-stone-50 border-b border-stone-100 font-serif font-bold text-stone-800 text-sm flex items-center justify-between">
                    <span>Harmful Comment Audit & Purger</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-stone-200 rounded-full text-stone-500">
                      Reviews count: {comments.length}
                    </span>
                  </div>

                  {comments.length === 0 ? (
                    <div className="p-12 text-center text-stone-400 text-sm font-medium">
                      No public feed reviews found to audit.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {comments.map(c => (
                        <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-stone-800 text-xs">{c.username}</span>
                              <span className="text-[10px] text-stone-400 font-mono">ID: {c.userId}</span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 font-serif">"{c.comment}"</p>
                            <span className="text-[10px] text-stone-400 block mt-1">
                              Posted on: {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            id={`btn_admin_purge_comment_${c.id}`}
                            onClick={() => handleDeleteCommentClick(c.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100/80 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors self-end sm:self-auto cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge Comment</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* 5. SITE CONTENT EDITOR PANEL */}
            {activeTab === 'site' && (
              <div id="panel_site" className="space-y-6 animate-fade-in text-left">

                {/* Hero Section */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                    <span className="font-serif font-bold text-stone-800 text-sm">Hero Section</span>
                    <button
                      onClick={() => setSettingsEditorMode('hero')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-green text-white text-xs font-bold rounded-lg hover:bg-brand-olive transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Hero</span>
                    </button>
                  </div>
                  <div className="p-4 flex items-center space-x-4">
                    <img src={siteSettings.heroImage} alt="Hero" className="w-24 h-16 object-cover rounded-lg border border-stone-200 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-700">{siteSettings.heroSubtitle}</p>
                      <p className="text-sm font-serif font-bold text-stone-900">{siteSettings.heroTitle}</p>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2">{siteSettings.heroDescription}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                    <span className="font-serif font-bold text-stone-800 text-sm">Contact Details</span>
                    <button
                      onClick={() => setSettingsEditorMode('contact')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-green text-white text-xs font-bold rounded-lg hover:bg-brand-olive transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Contact</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-1 text-xs text-stone-600">
                    <p><strong>Phone:</strong> {siteSettings.phone}</p>
                    <p><strong>Email:</strong> {siteSettings.email}</p>
                    <p><strong>WhatsApp:</strong> +{siteSettings.whatsappNumber}</p>
                    <p><strong>Address:</strong> {siteSettings.address}</p>
                  </div>
                </div>

                {/* Country & Park Pages */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-stone-50 border-b border-stone-100">
                    <span className="font-serif font-bold text-stone-800 text-sm">Country & Park Pages</span>
                    <p className="text-xs text-stone-400 mt-0.5">Edit taglines, descriptions and images for each destination page.</p>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {countries.map(country => (
                      <div key={country.id}>
                        {/* Country row */}
                        <div className="p-4 flex items-center justify-between bg-stone-50/50">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{country.flag}</span>
                            <div>
                              <p className="font-bold text-stone-800 text-sm">{country.name}</p>
                              <p className="text-xs text-stone-400">{siteSettings.countryOverrides[country.id]?.tagline ?? country.tagline}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setCountryEditorId(country.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-stone-100 hover:bg-brand-green hover:text-white text-stone-700 text-xs font-bold rounded-lg transition-all"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        {/* Park rows */}
                        {country.parks.map(park => (
                          <div key={park.id} className="p-3 pl-12 flex items-center justify-between border-t border-stone-100">
                            <div className="flex items-center space-x-3">
                              <img src={siteSettings.parkOverrides[park.id]?.coverImage ?? park.coverImage} alt={park.name} className="w-10 h-8 object-cover rounded-md border border-stone-200 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-stone-700">{park.name}</p>
                                <p className="text-[10px] text-stone-400 line-clamp-1">{siteSettings.parkOverrides[park.id]?.tagline ?? park.tagline}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setParkEditorId(park.id)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-stone-100 hover:bg-brand-green hover:text-white text-stone-700 text-xs font-bold rounded-lg transition-all"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Settings Editor Modals */}
      {settingsEditorMode && (
        <SiteSettingsEditor
          mode={settingsEditorMode}
          settings={siteSettings}
          onSave={async (updated) => { await onSaveSettings(updated); }}
          onClose={() => setSettingsEditorMode(null)}
        />
      )}

      {countryEditorId && (() => {
        const country = countries.find(c => c.id === countryEditorId);
        if (!country) return null;
        return (
          <CountryEditor
            country={country}
            settings={siteSettings}
            onSave={async (updated) => { await onSaveSettings(updated); }}
            onClose={() => setCountryEditorId(null)}
          />
        );
      })()}

      {parkEditorId && (() => {
        let foundPark = null;
        for (const c of countries) {
          const p = c.parks.find(pk => pk.id === parkEditorId);
          if (p) { foundPark = p; break; }
        }
        if (!foundPark) return null;
        return (
          <ParkEditor
            park={foundPark}
            settings={siteSettings}
            onSave={async (updated) => { await onSaveSettings(updated); }}
            onClose={() => setParkEditorId(null)}
          />
        );
      })()}

    </div>
  );
}
