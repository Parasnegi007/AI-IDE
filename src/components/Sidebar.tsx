import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Search } from 'lucide-react';
import { FileTree } from '../types';

interface SidebarProps {
  fileTree: FileTree;
  activeFile: string | null;
  onFileSelect: (filePath: string) => void;
}

interface FileItemProps {
  name: string;
  item: FileTree[string];
  path: string;
  activeFile: string | null;
  onFileSelect: (filePath: string) => void;
  level: number;
}

const FileItem: React.FC<FileItemProps> = ({ 
  name, 
  item, 
  path, 
  activeFile, 
  onFileSelect, 
  level 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const isActive = activeFile === path;
  const isFolder = item.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(path);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return '📄';
      case 'ts':
      case 'tsx':
        return '📘';
      case 'py':
        return '🐍';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-700 transition-colors ${
          isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-1 flex-1">
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Folder className="w-4 h-4 text-blue-400" />
            </>
          ) : (
            <>
              <span className="w-4 text-center text-xs">{getFileIcon(name)}</span>
            </>
          )}
          <span className="text-sm truncate">{name}</span>
        </div>
      </div>
      
      {isFolder && isExpanded && item.children && (
        <div>
          {Object.entries(item.children).map(([childName, childItem]) => (
            <FileItem
              key={childName}
              name={childName}
              item={childItem}
              path={path ? `${path}/${childName}` : childName}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ fileTree, activeFile, onFileSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-200">EXPLORER</h3>
          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(fileTree).map(([name, item]) => (
          <FileItem
            key={name}
            name={name}
            item={item}
            path={name}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            level={0}
          />
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          Ready to code with AI
        </div>
      </div>
    </div>
  );
};

export default Sidebar;