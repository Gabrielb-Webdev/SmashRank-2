'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';

interface CharacterSelectorProps {
  onSelect: (characterId: string, skinId: string) => void;
  onClose: () => void;
}

export default function CharacterSelector({ onSelect, onClose }: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [selectedSkin, setSelectedSkin] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error al cargar personajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedCharacter && selectedSkin) {
      onSelect(selectedCharacter.id, selectedSkin.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Selecciona tu Personaje</CardTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar personaje..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loader" />
            </div>
          ) : (
            <>
              {/* Characters Grid */}
              {!selectedCharacter ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {filteredCharacters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => setSelectedCharacter(character)}
                      className="group relative aspect-square bg-gray-800 rounded-lg border-2 border-primary/30 hover:border-primary hover:scale-105 transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">{character.name[0]}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs font-bold text-center truncate">
                          {character.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  {/* Selected Character & Skins */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{selectedCharacter.name}</h3>
                        <p className="text-sm text-gray-400">{selectedCharacter.series}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCharacter(null);
                          setSelectedSkin(null);
                        }}
                      >
                        Cambiar Personaje
                      </Button>
                    </div>

                    <p className="text-sm font-bold uppercase text-white mb-3">
                      Selecciona un Skin/Croma:
                    </p>
                    
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                      {selectedCharacter.skins.map((skin: any) => (
                        <button
                          key={skin.id}
                          onClick={() => setSelectedSkin(skin)}
                          className={`aspect-square rounded-lg border-2 transition-all ${
                            selectedSkin?.id === skin.id
                              ? 'border-secondary shadow-neon-blue scale-105'
                              : 'border-primary/30 hover:border-primary'
                          } bg-gray-800 flex items-center justify-center overflow-hidden group`}
                        >
                          <div className="text-center p-2">
                            <p className="text-xs font-bold">{skin.number}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Button */}
                  {selectedSkin && (
                    <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-gray-900 to-transparent">
                      <Button onClick={handleConfirm} className="w-full" size="lg">
                        Confirmar: {selectedCharacter.name} - Skin {selectedSkin.number}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
