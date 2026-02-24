// Sidebar.jsx
import Anchor from './Anchor';
import Button from './Button';

const Sidebar = ({ buttons, setPage }) => {
  // Convertiamo l'oggetto buttons in un array per il mapping
  const buttonEntries = Object.entries(buttons);

  const handleButtonClick = (label, onClick) => {
    // Eseguiamo sia la funzione passata che setPage per consistenza
    onClick();
    setPage(label);
  };

  return (
    <aside className="w-64 h-screen bg-black border-r border-red-900/30 fixed left-0 top-0 flex flex-col">
      {/* Header con logo/indicatore */}
      <div className="p-6 border-b border-red-900/30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="text-white font-bold text-lg tracking-wider">DARK GUI</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <div className="space-y-2">
          {buttonEntries.map(([label, onClick], index) => (
            <Button
              key={index}
              label={label}
              onClick={() => handleButtonClick(label, onClick)}
            />
          ))}
          <Anchor label="Torna alla home" href="/" />
        </div>
      </nav>

      {/* Footer con informazioni sistema e contatore sezioni */}
      <div className="p-4 border-t border-red-900/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-red-600/50 rounded-full" />
            <span className="text-gray-600">SYSTEM v1.0</span>
          </div>
          <span className="text-gray-700 font-mono">
            {buttonEntries.length} sec
          </span>
        </div>
        
        {/* Barra di stato delle sezioni */}
        <div className="mt-3 h-1 bg-red-950/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-600/50 rounded-full"
            style={{ width: `${Math.min(buttonEntries.length * 10, 100)}%` }}
          />
        </div>
        
        <div className="mt-2 text-[10px] text-gray-800 flex justify-between">
          <span>© 2024 DARK GUI</span>
          <span className="text-red-900/50">v2.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;