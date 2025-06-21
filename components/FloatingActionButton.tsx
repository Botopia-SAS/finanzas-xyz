"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Package, BarChart3, DollarSign, Users } from 'lucide-react';

interface FABProps {
  businessId: string;
  onAddMovement?: () => void;
}

export default function FloatingActionButton({ businessId, onAddMovement }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Colaboradores',
      onClick: () => {
        router.push(`/business/${businessId}/collaborators`);
        setIsOpen(false);
      }
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Inventario', 
      onClick: () => {
        router.push(`/business/${businessId}/inventory`);
        setIsOpen(false);
      }
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Verticales',
      onClick: () => {
        router.push(`/business/${businessId}/verticals`);
        setIsOpen(false);
      }
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Movimiento',
      onClick: () => {
        onAddMovement?.();
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Overlay para cerrar cuando se toca fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contenedor del FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Menú desplegable */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-2">
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Label del botón */}
                <div className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
                  {item.label}
                </div>
                
                {/* Botón circular */}
                <button
                  onClick={item.onClick}
                  className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-110 transition-all duration-200 border border-gray-200"
                >
                  {item.icon}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botón principal */}
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>
    </>
  );
}