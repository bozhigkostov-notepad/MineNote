
import React, { useState, useEffect, useMemo } from 'react';
import { Note } from './types';
import PixelButton from './components/PixelButton';
import NoteSlot from './components/NoteSlot';
import { PIXEL_ICONS } from './constants';
import { enchantNote, synthesizeNotes } from './services/geminiService';

const STORAGE_KEY = 'minenotes_data';
const ARCHIVE_KEY = 'minenotes_archive';
const LAVA_CACHE_KEY = 'minenotes_lava_cache'; // Hidden internal cache

type ViewState = 'menu' | 'app' | 'crafting' | 'archive';

const SPLASH_TEXTS = [
  "Gemini Powered!",
  "Crafting Ideas!",
  "Pixel Perfect!",
  "Enchant Your Thoughts!",
  "Now with AI!",
  "Lava-proof (Mostly)!",
  "Dig Deep!",
  "Don't Mine at Night!",
  "Sssssss.... Boom!",
  "Crafting 3x3 Recipes!",
  "Archiving in Chests!"
];

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [lavaCache, setLavaCache] = useState<Note[]>([]); // Internal cache for "deleted" items
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [isEnchanting, setIsEnchanting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('menu');

  // Crafting State
  const [craftingGrid, setCraftingGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [activeCraftSlot, setActiveCraftSlot] = useState<number | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);

  const splashText = useMemo(() => 
    SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)], 
  []);

  // Load notes
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    const savedArchive = localStorage.getItem(ARCHIVE_KEY);
    const savedLava = localStorage.getItem(LAVA_CACHE_KEY);
    if (savedNotes) {
      try { setNotes(JSON.parse(savedNotes)); } catch (e) { console.error(e); }
    }
    if (savedArchive) {
      try { setArchivedNotes(JSON.parse(savedArchive)); } catch (e) { console.error(e); }
    }
    if (savedLava) {
      try { setLavaCache(JSON.parse(savedLava)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save notes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archivedNotes));
  }, [archivedNotes]);

  useEffect(() => {
    localStorage.setItem(LAVA_CACHE_KEY, JSON.stringify(lavaCache));
  }, [lavaCache]);

  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const selectedArchivedNote = archivedNotes.find(n => n.id === selectedArchiveId);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'New Scroll',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      type: 'paper'
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setCurrentView('app');
  };

  const handleUpdateNote = (updates: Partial<Note>) => {
    if (!selectedNoteId) return;
    setNotes(prev => prev.map(n => 
      n.id === selectedNoteId 
        ? { ...n, ...updates, updatedAt: Date.now() } 
        : n
    ));
  };

  const handleArchiveNote = () => {
    if (!selectedNoteId) return;
    const noteToArchive = notes.find(n => n.id === selectedNoteId);
    if (noteToArchive) {
      setArchivedNotes(prev => [noteToArchive, ...prev]);
      const remainingNotes = notes.filter(n => n.id !== selectedNoteId);
      setNotes(remainingNotes);
      if (remainingNotes.length > 0) {
        const sortedRemaining = [...remainingNotes].sort((a, b) => b.createdAt - a.createdAt);
        setSelectedNoteId(sortedRemaining[0].id);
      } else {
        setSelectedNoteId(null);
      }
      alert("Note moved to Chest!");
    }
  };

  const handleUnarchiveNote = () => {
    if (!selectedArchiveId) return;
    const noteToRestore = archivedNotes.find(n => n.id === selectedArchiveId);
    if (noteToRestore) {
      // Create a fresh version with current timestamps to make it "last created"
      const restoredNote: Note = {
        ...noteToRestore,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      setNotes(prev => [restoredNote, ...prev]);
      setArchivedNotes(prev => prev.filter(n => n.id !== selectedArchiveId));
      setSelectedArchiveId(null);
      
      // Auto-select in main app view
      setSelectedNoteId(restoredNote.id);
      setCurrentView('app');
      alert("Note restored as fresh item!");
    }
  };

  const handleLavaDelete = () => {
    if (!selectedArchiveId) return;
    if (confirm("Toss this item into lava? It will be gone forever!")) {
      const noteToCache = archivedNotes.find(n => n.id === selectedArchiveId);
      if (noteToCache) {
        setLavaCache(prev => [...prev, noteToCache]);
      }
      setArchivedNotes(prev => prev.filter(n => n.id !== selectedArchiveId));
      setSelectedArchiveId(null);
    }
  };

  const handleEnchant = async (action: 'summarize' | 'expand' | 'fix') => {
    if (!selectedNote || !selectedNote.content) return;
    
    setIsEnchanting(true);
    try {
      const result = await enchantNote(selectedNote.content, action);
      handleUpdateNote({
        content: result.content,
        title: result.suggestedTitle || selectedNote.title,
        type: 'book'
      });
    } catch (error) {
      alert("The enchantment fizzled out. (Check console)");
    } finally {
      setIsEnchanting(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Crafting Logic
  const handleCraftingSlotClick = (index: number) => {
    if (activeCraftSlot === index) {
      setActiveCraftSlot(null);
      setCraftingGrid(prev => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    } else {
      setActiveCraftSlot(index);
    }
  };

  const handleInventorySelectForCraft = (noteId: string) => {
    if (activeCraftSlot !== null) {
      setCraftingGrid(prev => {
        const next = [...prev];
        next[activeCraftSlot] = noteId;
        return next;
      });
      setActiveCraftSlot(null);
    }
  };

  const performCraft = async () => {
    const inputNoteIds = craftingGrid.filter(id => id !== null) as string[];
    if (inputNoteIds.length === 0) return;

    const inputNotes = inputNoteIds.map(id => notes.find(n => n.id === id)).filter(Boolean) as Note[];
    
    setIsCrafting(true);
    try {
      let craftedNote: Note;
      if (inputNotes.length === 1) {
        craftedNote = {
          ...inputNotes[0],
          id: crypto.randomUUID(),
          title: `${inputNotes[0].title} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      } else {
        const synthesis = await synthesizeNotes(inputNotes);
        craftedNote = {
          id: crypto.randomUUID(),
          title: synthesis.suggestedTitle || "Master Tome",
          content: synthesis.content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          type: 'book'
        };
      }
      setNotes(prev => [craftedNote, ...prev]);
      setCraftingGrid(Array(9).fill(null));
      alert("Item Crafted Successfully!");
    } catch (e) {
      alert("Crafting failed. The recipe was too unstable.");
    } finally {
      setIsCrafting(false);
    }
  };

  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-[#313131] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5c5c5c] to-[#1a1a1a] opacity-50 z-0"></div>
        <div className="z-10 flex flex-col items-center gap-12 max-w-2xl w-full">
          <div className="relative group">
            <h1 className="text-8xl md:text-9xl font-bold text-white drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] tracking-tighter text-center">
              MineNotes
            </h1>
            <div className="absolute -right-4 -bottom-4 animate-bounce rotate-[-20deg]">
              <span className="text-[#ffff55] text-2xl md:text-3xl font-bold drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {splashText}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <PixelButton className="w-full py-4 text-3xl" onClick={() => setCurrentView('app')}>
              Enter Inventory
            </PixelButton>
            <PixelButton className="w-full py-4 text-3xl" variant="green" onClick={() => setCurrentView('crafting')}>
              Go to Crafting Table
            </PixelButton>
            <div className="flex gap-4">
              <PixelButton className="flex-1 py-4 text-2xl" onClick={() => setCurrentView('archive')}>
                Storage Chest
              </PixelButton>
              <PixelButton className="flex-1 py-4 text-2xl" variant="red" onClick={() => { if(confirm("Are you sure you want to quit?")) window.close(); }}>
                Quit Game
              </PixelButton>
            </div>
          </div>
          <div className="text-[#8b8b8b] text-xl mt-8">Copyright (C) Mojang AB. Pixel-art for the soul.</div>
        </div>
      </div>
    );
  }

  if (currentView === 'archive') {
    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start gap-8 select-none">
        <header className="w-full max-w-5xl flex justify-between items-center mc-border p-4 bg-[#8B4513]">
          <div className="flex items-center gap-4">
            <PixelButton onClick={() => setCurrentView('menu')} className="px-2 py-1 text-sm">
              &lt; Menu
            </PixelButton>
            <PIXEL_ICONS.Chest />
            <h1 className="text-4xl font-bold text-[#fff]">Storage Chest (Archive)</h1>
          </div>
        </header>

        <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <section className="mc-border p-4 bg-[#c6c6c6] h-[600px] flex flex-col">
            <h2 className="text-2xl mb-4 text-[#373737]">Archived Items</h2>
            <div className="flex-1 bg-[#444] mc-border overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 p-2">
              {archivedNotes.length > 0 ? (
                archivedNotes.map(note => (
                  <NoteSlot 
                    key={note.id} 
                    note={note} 
                    isActive={selectedArchiveId === note.id} 
                    onClick={() => setSelectedArchiveId(note.id)}
                  />
                ))
              ) : (
                Array.from({ length: 20 }).map((_, i) => (
                  <NoteSlot key={i} isActive={false} onClick={() => {}} />
                ))
              )}
            </div>
            <p className="mt-4 text-[#373737] text-xl">{archivedNotes.length} Items stored</p>
          </section>

          <section className="mc-border p-4 bg-[#c6c6c6] min-h-[400px] flex flex-col gap-6">
            {selectedArchivedNote ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-4xl font-bold text-[#373737] break-words">{selectedArchivedNote.title}</h2>
                <div className="mc-input p-4 min-h-[200px] text-xl max-h-[300px] overflow-y-auto opacity-70">
                  {selectedArchivedNote.content || "Empty scroll..."}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <PixelButton variant="green" onClick={handleUnarchiveNote}>
                    Restore to Inventory
                  </PixelButton>
                  <PixelButton variant="red" className="flex items-center justify-center gap-2" onClick={handleLavaDelete}>
                    <PIXEL_ICONS.Lava className="w-6 h-6" />
                    Toss Into Lava
                  </PixelButton>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4">
                <PIXEL_ICONS.Chest width="128" height="128" />
                <p className="text-3xl">Select an archived item</p>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  if (currentView === 'crafting') {
    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start gap-8 select-none">
        <header className="w-full max-w-5xl flex justify-between items-center mc-border p-4 bg-[#c6c6c6]">
          <div className="flex items-center gap-4">
            <PixelButton onClick={() => setCurrentView('app')} className="px-2 py-1 text-sm">
              &lt; Inventory
            </PixelButton>
            <PIXEL_ICONS.CraftingTable />
            <h1 className="text-4xl font-bold text-[#373737]">Crafting Table</h1>
          </div>
          <PixelButton onClick={() => setCraftingGrid(Array(9).fill(null))} variant="red" className="text-sm px-2">
            Clear Grid
          </PixelButton>
        </header>

        <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <section className="flex flex-col items-center gap-8 mc-border p-8 bg-[#c6c6c6]">
            <div className="flex items-center gap-8">
              <div className="grid grid-cols-3 gap-2 p-2 bg-[#8b8b8b] mc-border">
                {craftingGrid.map((noteId, i) => {
                  const note = notes.find(n => n.id === noteId);
                  return (
                    <div 
                      key={i}
                      onClick={() => handleCraftingSlotClick(i)}
                      className={`w-20 h-20 flex items-center justify-center cursor-pointer mc-slot ${activeCraftSlot === i ? 'mc-slot-active' : ''}`}
                    >
                      {note ? (
                        <div className="flex flex-col items-center">
                          {note.type === 'book' ? <PIXEL_ICONS.Book /> : <PIXEL_ICONS.Paper />}
                          <span className="text-[8px] text-white absolute bottom-1 truncate w-full text-center">{note.title.substring(0, 6)}</span>
                        </div>
                      ) : (
                        activeCraftSlot === i && <div className="text-white text-xs animate-pulse">Select...</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <PIXEL_ICONS.Arrow className="scale-150" />
              <div className="w-24 h-24 bg-[#8b8b8b] mc-border flex items-center justify-center relative overflow-hidden">
                {isCrafting ? <div className="animate-spin"><PIXEL_ICONS.Enchant /></div> : <div className="opacity-40"><PIXEL_ICONS.Book width="48" height="48" /></div>}
              </div>
            </div>
            <PixelButton variant="green" className="w-full text-3xl" disabled={isCrafting || craftingGrid.every(v => v === null)} onClick={performCraft}>
              {isCrafting ? "Crafting..." : "CRAFT!"}
            </PixelButton>
          </section>

          <section className="mc-border p-4 bg-[#c6c6c6] h-[500px] flex flex-col">
            <h2 className="text-2xl mb-4 text-[#373737]">Select Ingredients</h2>
            <div className="flex-1 bg-[#444] mc-border overflow-y-auto grid grid-cols-4 gap-2 p-2 h-0">
              {notes.map(note => (
                <div key={note.id} onClick={() => handleInventorySelectForCraft(note.id)} className={`w-full aspect-square mc-slot hover:brightness-110 cursor-pointer flex flex-col items-center justify-center ${activeCraftSlot === null ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {note.type === 'book' ? <PIXEL_ICONS.Book /> : <PIXEL_ICONS.Paper />}
                  <span className="text-[8px] text-white mt-1 truncate w-full text-center px-1">{note.title}</span>
                </div>
              ))}
            </div>
            {activeCraftSlot === null && <p className="mt-4 text-[#373737] text-center italic">Click a grid slot first</p>}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start gap-8 select-none">
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 mc-border p-4 bg-[#c6c6c6]">
        <div className="flex items-center gap-4">
          <PixelButton onClick={() => setCurrentView('menu')} className="px-2 py-1 text-sm">
            &lt; Menu
          </PixelButton>
          <div className="w-12 h-12 bg-[#8b8b8b] border-2 border-[#000] flex items-center justify-center hidden sm:flex">
            <PIXEL_ICONS.Book />
          </div>
          <h1 className="text-4xl font-bold text-[#373737]">MineNotes</h1>
        </div>
        <div className="flex flex-1 max-w-md w-full gap-2">
          <input type="text" placeholder="Search inventory..." className="flex-1 mc-input p-2 text-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <PixelButton onClick={handleCreateNote} variant="green">Craft</PixelButton>
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5 mc-border p-4 bg-[#c6c6c6] h-fit">
          <div className="flex justify-between items-center mb-4 border-b-2 border-[#8b8b8b] pb-2">
            <h2 className="text-2xl text-[#373737]">Inventory</h2>
            <div className="flex gap-2">
              <PixelButton onClick={() => setCurrentView('crafting')} className="text-sm px-2 py-0">Table</PixelButton>
              <PixelButton onClick={() => setCurrentView('archive')} className="text-sm px-2 py-0">Chest</PixelButton>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto p-1 bg-[#444] mc-border">
            {filteredNotes.length > 0 ? filteredNotes.map(note => (
              <NoteSlot key={note.id} note={note} isActive={selectedNoteId === note.id} onClick={() => setSelectedNoteId(note.id)} />
            )) : Array.from({ length: 20 }).map((_, i) => (
              <NoteSlot key={i} isActive={false} onClick={() => {}} />
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center text-xl text-[#373737]">
            <span>{filteredNotes.length} Items</span>
            {selectedNoteId && (
              <button onClick={handleArchiveNote} className="text-[#373737] hover:underline cursor-pointer flex items-center gap-1">
                <PIXEL_ICONS.Chest className="w-4 h-4" /> Move to Chest
              </button>
            )}
          </div>
        </section>

        <section className="lg:col-span-7 mc-border p-4 bg-[#c6c6c6] min-h-[500px] flex flex-col">
          {selectedNote ? (
            <div className="flex flex-col h-full gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                <input className="bg-transparent text-3xl font-bold border-none outline-none text-[#373737] w-full" value={selectedNote.title} onChange={(e) => handleUpdateNote({ title: e.target.value })} placeholder="Scroll Title..." />
              </div>
              <textarea className="flex-1 mc-input p-4 text-xl resize-none min-h-[300px]" value={selectedNote.content} onChange={(e) => handleUpdateNote({ content: e.target.value })} placeholder="Start writing your lore..." />
              <div className="mt-4 mc-border bg-[#9370DB] p-4 bg-opacity-20 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <PIXEL_ICONS.Enchant />
                  <span className="text-xl font-bold text-[#4B0082]">Enchanting Table</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <PixelButton disabled={isEnchanting || !selectedNote.content} onClick={() => handleEnchant('summarize')} className="text-lg py-1">Summarize</PixelButton>
                  <PixelButton disabled={isEnchanting || !selectedNote.content} onClick={() => handleEnchant('expand')} className="text-lg py-1">Expand</PixelButton>
                  <PixelButton disabled={isEnchanting || !selectedNote.content} onClick={() => handleEnchant('fix')} className="text-lg py-1">Refine</PixelButton>
                </div>
                {isEnchanting && <div className="text-center animate-pulse text-[#4B0082] font-bold">Brewing Enchantment...</div>}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4">
              <PIXEL_ICONS.Paper width="128" height="128" />
              <p className="text-3xl">Select an item to view</p>
            </div>
          )}
        </section>
      </main>
      <footer className="w-full max-w-5xl flex justify-between items-center text-[#8b8b8b] text-xl">
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="w-6 h-6 bg-[#ff5555] border-2 border-[#000] rotate-45"></div>)}
        </div>
        <div className="text-right">v1.2.2 Stable Build</div>
      </footer>
    </div>
  );
};

export default App;
