"use client";

import { Label } from '@/components/ui/label';

interface PermissionSelectorProps {
  selectedRole: string;
  verticals: Array<{id: string; name: string}>;
  selectedVerticals: string[];
  onVerticalsChange: (verticals: string[]) => void;
}

export default function PermissionSelector({ 
  selectedRole, 
  verticals, 
  selectedVerticals, 
  onVerticalsChange 
}: PermissionSelectorProps) {
  
  // Solo mostrar selector de verticales para capturistas
  if (!selectedRole.includes('data_entry')) {
    return null;
  }

  const handleVerticalToggle = (verticalId: string) => {
    if (selectedVerticals.includes(verticalId)) {
      onVerticalsChange(selectedVerticals.filter(id => id !== verticalId));
    } else {
      onVerticalsChange([...selectedVerticals, verticalId]);
    }
  };

  return (
    <div>
      <Label className="block text-sm font-medium mb-2">
        Verticales permitidos *
      </Label>
      <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
        {verticals.length === 0 ? (
          <p className="text-sm text-gray-500">No hay verticales disponibles</p>
        ) : (
          verticals.map((vertical) => (
            <label key={vertical.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedVerticals.includes(vertical.id)}
                onChange={() => handleVerticalToggle(vertical.id)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{vertical.name}</span>
            </label>
          ))
        )}
      </div>
      {selectedRole.includes('data_entry') && selectedVerticals.length === 0 && (
        <p className="text-xs text-red-500 mt-1">
          Debe seleccionar al menos un vertical para capturistas
        </p>
      )}
    </div>
  );
}