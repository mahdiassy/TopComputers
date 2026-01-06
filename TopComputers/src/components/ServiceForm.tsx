import React, { useEffect, useMemo, useState } from 'react';
import { type ServiceBlock } from '../contexts/ServicesContext';
import { Plus, Trash2 } from 'lucide-react';

type ServiceFormValues = Omit<ServiceBlock, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

interface ServiceFormProps {
  mode: 'create' | 'edit';
  initialData?: ServiceBlock | null;
  onSubmit: (values: ServiceFormValues, files: { mainImage?: File | null; contentImages?: Record<string, File[]>; applicationIcons?: Record<string, File | null>; }) => Promise<void> | void;
  submitting?: boolean;
}

const emptyValues: ServiceFormValues = {
  title: '',
  description: '',
  mainImage: undefined,
  category: '',
  applications: [],
  contentSections: [],
  specifications: [],
  whatsappMessage: '',
  instagramLink: undefined,
  facebookLink: undefined,
  tiktokLink: undefined,
  slug: '',
  published: false,
  order: 0,
  createdAt: '',
  updatedAt: '',
};

export default function ServiceForm({ mode, initialData, onSubmit, submitting }: ServiceFormProps) {
  const [values, setValues] = useState<ServiceFormValues>(() => initialData || emptyValues);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [contentImages, setContentImages] = useState<Record<string, File[]>>({});
  const [applicationIcons, setApplicationIcons] = useState<Record<string, File | null>>({});
  const [showApplications, setShowApplications] = useState(false);

  useEffect(() => {
    if (initialData) setValues(initialData);
  }, [initialData]);

  const autoSlug = useMemo(() =>
    values.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, ''), [values.title]);

  useEffect(() => {
    if (mode === 'create') {
      setValues(v => ({ ...v, slug: autoSlug }));
    }
  }, [autoSlug, mode]);

  const update = <K extends keyof ServiceFormValues>(key: K, val: ServiceFormValues[K]) => {
    setValues(v => ({ ...v, [key]: val }));
  };

  const handleAddFeature = () => {
    const next = [...(values.contentSections || [])];
    next.push({ id: crypto.randomUUID(), title: '', description: '', images: [], type: 'text' });
    update('contentSections', next);
  };

  const handleAddApplication = () => {
    const next = [...(values.applications || [])];
    next.push({ id: crypto.randomUUID(), name: '', description: '', category: '', icon: undefined });
    update('applications', next);
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values, { mainImage: mainImageFile, contentImages, applicationIcons });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={values.title || ''} onChange={(e) => update('title', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input value={values.slug || ''} onChange={(e) => update('slug', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input value={values.category || ''} onChange={(e) => update('category', e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div className="flex items-center gap-3">
          <input id="published" type="checkbox" checked={values.published} onChange={(e) => update('published', e.target.checked)} />
          <label htmlFor="published" className="text-sm">Published</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Short Description</label>
        <textarea value={values.description} onChange={(e) => update('description', e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={3} />
      </div>

      {/* Specifications - simple list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Specifications / Points</label>
          <button type="button" onClick={() => update('specifications', [...(values.specifications || []), ''])} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 text-white"><Plus size={14} /> Add</button>
        </div>
        <div className="space-y-2">
          {(values.specifications || []).map((spec, index) => (
            <div key={index} className="flex gap-2">
              <input value={spec || ''} onChange={(e) => {
                const next = [...(values.specifications || [])];
                next[index] = e.target.value;
                update('specifications', next);
              }} className="flex-1 border rounded px-2 py-1.5" placeholder={`Point #${index + 1}`} />
              <button type="button" onClick={() => {
                const next = (values.specifications || []).filter((_, i) => i !== index);
                update('specifications', next);
              }} className="px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Main Image</label>
        {values.mainImage && (
          <img src={values.mainImage} alt="main" className="h-24 w-24 object-cover rounded mb-2" />
        )}
        <input type="file" accept="image/*" onChange={(e) => setMainImageFile(e.target.files?.[0] || null)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp Message (optional)</label>
          <input value={values.whatsappMessage || ''} onChange={(e) => update('whatsappMessage', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input value={values.instagramLink || ''} onChange={(e) => update('instagramLink', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Facebook</label>
          <input value={values.facebookLink || ''} onChange={(e) => update('facebookLink', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">TikTok</label>
          <input value={values.tiktokLink || ''} onChange={(e) => update('tiktokLink', e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Applications (optional)</label>
          <div className="flex items-center gap-3">
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={showApplications} onChange={(e) => setShowApplications(e.target.checked)} /> Enable</label>
            <button type="button" onClick={handleAddApplication} disabled={!showApplications} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"><Plus size={14} /> Add</button>
          </div>
        </div>
        {showApplications && (
        <div className="space-y-3">
          {(values.applications || []).map((app, index) => (
            <div key={app.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border p-3 rounded">
              <div className="md:col-span-2">
                <label className="text-xs">Name</label>
                <input value={app.name} onChange={(e) => {
                  const next = [...values.applications];
                  next[index] = { ...app, name: e.target.value };
                  update('applications', next);
                }} className="w-full border rounded px-2 py-1.5" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs">Category</label>
                <input value={app.category} onChange={(e) => {
                  const next = [...values.applications];
                  next[index] = { ...app, category: e.target.value };
                  update('applications', next);
                }} className="w-full border rounded px-2 py-1.5" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs block">Icon</label>
                {app.icon && <img src={app.icon} className="h-10 w-10 object-cover mb-1 rounded" />}
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setApplicationIcons(prev => ({ ...prev, [app.id]: file }));
                }} />
              </div>
              <div className="md:col-span-5">
                <label className="text-xs">Description</label>
                <input value={app.description} onChange={(e) => {
                  const next = [...values.applications];
                  next[index] = { ...app, description: e.target.value };
                  update('applications', next);
                }} className="w-full border rounded px-2 py-1.5" />
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button type="button" onClick={() => {
                  const next = values.applications.filter(a => a.id !== app.id);
                  update('applications', next);
                }} className="px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Content Sections</label>
          <button type="button" onClick={handleAddFeature} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 text-white"><Plus size={14} /> Add</button>
        </div>
        <div className="space-y-4">
          {(values.contentSections || []).map((section, index) => (
            <div key={section.id} className="border rounded p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Title</label>
                  <input value={section.title} onChange={(e) => {
                    const next = [...values.contentSections];
                    next[index] = { ...section, title: e.target.value };
                    update('contentSections', next);
                  }} className="w-full border rounded px-2 py-1.5" />
                </div>
                <div>
                  <label className="text-xs">Type</label>
                  <select value={section.type} onChange={(e) => {
                    const next = [...values.contentSections];
                    next[index] = { ...section, type: e.target.value as any };
                    update('contentSections', next);
                  }} className="w-full border rounded px-2 py-1.5">
                    <option value="text">Text</option>
                    <option value="gallery">Gallery</option>
                    <option value="process">Process</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs">Description</label>
                <textarea value={section.description} onChange={(e) => {
                  const next = [...values.contentSections];
                  next[index] = { ...section, description: e.target.value };
                  update('contentSections', next);
                }} className="w-full border rounded px-2 py-1.5" rows={3} />
              </div>
              <div>
                <label className="text-xs block mb-1">Images</label>
                <input multiple type="file" accept="image/*" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setContentImages(prev => ({ ...prev, [section.id]: files }));
                }} />
                {section.images && section.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {section.images.map((img, i) => (
                      <img key={i} src={img} className="h-16 w-16 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => {
                  const next = values.contentSections.filter(s => s.id !== section.id);
                  update('contentSections', next);
                }} className="px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button disabled={!!submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          {submitting ? 'Saving...' : (mode === 'create' ? 'Create Service' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
}


