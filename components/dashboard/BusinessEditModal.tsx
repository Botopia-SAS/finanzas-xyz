"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Business } from './BusinessCard';
import { uploadImageToCloudinary } from '@/lib/cloudinary/upload';

interface BusinessEditModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BusinessEditModal({ business, isOpen, onClose, onSuccess }: BusinessEditModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setType(business.type);
      setDescription(business.description || '');
    }
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setLoading(true);
    const supabase = createClient();

    try {
      let imageUrl = business.image_url;
      
      // Si hay nueva imagen, subirla
      if (file) {
        try {
          imageUrl = await uploadImageToCloudinary(file);
        } catch (err) {
          console.error("Error uploading to Cloudinary", err);
          alert("Error al subir la imagen");
          return;
        }
      }

      const { error } = await supabase
        .from('businesses')
        .update({
          name,
          type,
          description: description || null,
          image_url: imageUrl,
        })
        .eq('id', business.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Error al actualizar el negocio');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !business) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editar Negocio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
              Nombre *
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="edit-type" className="block text-sm font-medium mb-1">
              Tipo *
            </label>
            <select
              id="edit-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona uno</option>
              <option value="Ganaderia">Ganadería</option>
              <option value="Lecheria">Lechería</option>
              <option value="Avicultura">Avicultura</option>
              <option value="Agricultura">Agricultura</option>
              <option value="Tecnologia">Tecnología</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="edit-image" className="block text-sm font-medium mb-1">
              Cambiar imagen
            </label>
            <input
              id="edit-image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {business.image_url && (
              <p className="text-xs text-gray-500 mt-1">
                Deja vacío para mantener la imagen actual
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}