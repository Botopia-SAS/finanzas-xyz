// components/verticals/verticalDetail/dairy/ParentSearchSelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Cow {
  id: string;
  name: string;
  tag: string;
  breed: string;
  status: string;
}

interface ParentSearchSelectorProps {
  businessId: string;
  selectedParentId?: string;
  onParentSelect: (cow: Cow | null) => void;
  label: string;
  placeholder: string;
  excludeCowId?: string; // Para excluir la vaca que se está editando
}

export default function ParentSearchSelector({
  businessId,
  selectedParentId,
  onParentSelect,
  label,
  placeholder,
  excludeCowId
}: ParentSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Cow[]>([]);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (selectedParentId) {
      fetchSelectedCow();
    }
  }, [selectedParentId]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchCows();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const fetchSelectedCow = async () => {
    if (!selectedParentId) return;
    
    try {
      const { data, error } = await supabase
        .from('livestock_cows')
        .select('id, name, tag, breed, status')
        .eq('id', selectedParentId)
        .single();

      if (error) throw error;
      setSelectedCow(data);
    } catch (error) {
      console.error('Error fetching selected cow:', error);
    }
  };

  const searchCows = async () => {
    setIsSearching(true);
    try {
      let query = supabase
        .from('livestock_cows')
        .select('id, name, tag, breed, status')
        .eq('business_id', businessId)
        .limit(10);

      // Excluir la vaca actual si se especifica
      if (excludeCowId) {
        query = query.neq('id', excludeCowId);
      }

      // Buscar por nombre o tag
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,tag.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSearchResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching cows:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCow = (cow: Cow) => {
    setSelectedCow(cow);
    onParentSelect(cow);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleClearSelection = () => {
    setSelectedCow(null);
    onParentSelect(null);
    setSearchTerm("");
    setShowResults(false);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Activa', color: 'bg-green-100 text-green-800' },
      'pregnant': { label: 'Preñada', color: 'bg-blue-100 text-blue-800' },
      'dry': { label: 'Seca', color: 'bg-yellow-100 text-yellow-800' },
      'sick': { label: 'Enferma', color: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {selectedCow ? (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Users className="h-4 w-4 text-blue-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-900">{selectedCow.name}</span>
              <span className="text-sm text-blue-600 font-mono">({selectedCow.tag})</span>
              {getStatusBadge(selectedCow.status)}
            </div>
            <p className="text-xs text-blue-700">{selectedCow.breed}</p>
          </div>
          <button
            onClick={handleClearSelection}
            className="p-1 hover:bg-blue-100 rounded"
          >
            <X className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {showResults && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  Buscando...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((cow) => (
                    <button
                      key={cow.id}
                      onClick={() => handleSelectCow(cow)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{cow.name}</span>
                            <span className="text-sm text-gray-600 font-mono">({cow.tag})</span>
                          </div>
                          <p className="text-xs text-gray-500">{cow.breed}</p>
                        </div>
                        {getStatusBadge(cow.status)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm.length < 2 
                    ? "Escribe al menos 2 caracteres para buscar" 
                    : "No se encontraron vacas"
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
