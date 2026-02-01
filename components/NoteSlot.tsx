
import React from 'react';
import { Note } from '../types';
import { PIXEL_ICONS } from '../constants';

interface NoteSlotProps {
  note?: Note;
  isActive: boolean;
  onClick: () => void;
}

const NoteSlot: React.FC<NoteSlotProps> = ({ note, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center cursor-pointer transition-all
        ${isActive ? 'mc-slot-active scale-105 z-10' : 'mc-slot'}
        hover:brightness-110
      `}
    >
      {note ? (
        <div className="flex flex-col items-center">
          {note.type === 'book' ? <PIXEL_ICONS.Book /> : <PIXEL_ICONS.Paper />}
          <span className="text-[10px] text-white absolute bottom-1 truncate w-full text-center px-1">
            {note.title.substring(0, 8)}
          </span>
        </div>
      ) : (
        <div className="opacity-20">
          <PIXEL_ICONS.Paper />
        </div>
      )}
    </div>
  );
};

export default NoteSlot;
