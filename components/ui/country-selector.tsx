'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, Search } from 'lucide-react'

interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

const countries: Country[] = [
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1', flag: '🇩🇴' },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺' },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸' },
  { code: 'FR', name: 'Francia', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹' },
  { code: 'DE', name: 'Alemania', dialCode: '+49', flag: '🇩🇪' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canadá', dialCode: '+1', flag: '🇨🇦' },
]

interface CountrySelectorProps {
  selectedCountry: Country
  onCountryChange: (country: Country) => void
  phoneNumber: string
  onPhoneChange: (phone: string) => void
}

export function CountrySelector({ 
  selectedCountry, 
  onCountryChange, 
  phoneNumber, 
  onPhoneChange 
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm)
  )

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      {/* Selector de país */}
      <div className="relative">
        <Label htmlFor="country">País</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between mt-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
            <span className="text-muted-foreground">({selectedCountry.dialCode})</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Buscador */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Lista de países */}
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => handleCountrySelect(country)}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted-foreground ml-auto">{country.dialCode}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input de número de teléfono */}
      <div>
        <Label htmlFor="phone">Número de teléfono</Label>
        <div className="flex mt-2">
          <div className="flex items-center bg-gray-50 border border-r-0 rounded-l-md px-3">
            <span className="text-sm text-gray-600">{selectedCountry.dialCode}</span>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="300 123 4567"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="rounded-l-none"
            required
          />
        </div>
      </div>
    </div>
  )
}

export { countries }
export type { Country }
