import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Search, Upload, FolderOpen, Download, RefreshCw, Settings } from 'lucide-react';
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          // Here you would typically update your file tree and contents
          console.log(`Uploaded ${file.name}:`, content);
          // You could call a prop function to update the parent component
        };
        reader.readAsText(file);
      });
    }
  };

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Folder uploaded with', files.length, 'files');
      // Process folder structure
      Array.from(files).forEach(file => {
        console.log('File path:', file.webkitRelativePath || file.name);
      });
    }
  };

  const downloadProject = () => {
    // Create a simple project download
    const projectData = {
      name: 'AI-IDE-Project',
      files: fileTree,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-structure.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-200">EXPLORER</h3>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Upload Files"
            >
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={() => folderInputRef.current?.click()}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Upload Folder"
            >
              <FolderOpen className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={downloadProject}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Download Project"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded transition-colors">
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="mb-3 text-xs text-gray-400">
          <span>💻 Local File System Access</span>
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
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.md,.txt,.yml,.yaml,.xml"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          webkitdirectory=""
          onChange={handleFolderUpload}
          className="hidden"
        />
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
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>🚀 AI-Powered IDE</span>
            <Settings className="w-3 h-3 cursor-pointer hover:text-gray-300" />
          </div>
          <div>Ready for local development</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;