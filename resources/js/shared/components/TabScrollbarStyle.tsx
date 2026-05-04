import { memo } from 'react';

interface TabScrollbarStyleProps {
  color: string;
}

const TabScrollbarStyle = memo(function TabScrollbarStyle({ color }: TabScrollbarStyleProps) {
  return (
    <style>{`
      .tab-scrollbar { overflow-x: auto; overflow-y: hidden; }
      .tab-scrollbar::-webkit-scrollbar { height: 3px; }
      .tab-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); }
      .tab-scrollbar::-webkit-scrollbar-thumb {
        background: ${color}55;
        border-radius: 99px;
      }
      .tab-scrollbar::-webkit-scrollbar-thumb:hover { background: ${color}99; }
      .tab-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: ${color}55 rgba(255,255,255,0.04);
      }
    `}</style>
  );
});

export default TabScrollbarStyle;
